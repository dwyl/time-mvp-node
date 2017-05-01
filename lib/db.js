require('env2')('.env'); // see: https://github.com/dwyl/env2
var assert = require('assert');
// if DATABASE_URL Environment Variable unset halt server startup else continue
assert(process.env.DATABASE_URL, 'Please set DATABASE_URL Env Variable');
var email = require('./email.js');
var crypto = require('crypto'); // http://nodejs.org/api/crypto.html
var pg = require('pg');
var escape = require('pg-escape'); // npmjs.com/package/pg-escape
var PG_CLIENT; // connect once and expose the connection via PG_CLIENT
pg.connect(process.env.DATABASE_URL, function(err, client, done) {
  assert(!err, 'ERROR Connecting to PostgreSQL!');
  // console.log({ client: client, done: done});
  PG_CLIENT = client;
  var select = escape('SELECT * FROM store WHERE person_id = %L', '1');
  console.log(select);
  PG_CLIENT.query(select, function(err, result) {
    // console.log(err, result);
    console.log(JSON.stringify(result.rows[0]), ' ... it\'s working. ;-)');
  });
  return;
});


function extract_browser_request_metadata(req) {
  var r = req.headers;
  r.url = req.method + ': ' + req.url; // log the method and url requested
  r.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  return r;
}

/**
 * use client/browser metadata to create the session so it's unique
 */
function set_session_id(req) {
  var m = extract_browser_request_metadata(req);
  return crypto.createHash('sha256')
    .update(m['user-agent'] + req.json.date + m.ip)
    .digest('hex').substring(0, 36);
}

/**
 * see: https://github.com/nelsonic/time-mvp/issues/5
 */
function create_session_if_not_exist(req, res, callback) {
  var r = req.record;
  var select = escape('SELECT * FROM sessions '
    + 'WHERE session_id = %L', r.session_id);
  PG_CLIENT.query(select, function(err, result) {
    if(err || result.rows.length === 0) { // no session, create it!
      var CREATE = escape('INSERT INTO sessions '
        + '(session_id, person_id) VALUES (%L, %L)',
        r.session_id, r.person_id);
      PG_CLIENT.query(CREATE, function(err, result) {
        // console.log(err, result);
        return callback(err, req, res);
      });
    }  // update person_id in session github.com/nelsonic/time-mvp/issues/25
    else if(result.rows.length > 0) {
      var UPDATE = escape('UPDATE sessions SET '
      + 'person_id = %L WHERE session_id = %L',
        r.person_id, r.session_id);
      // console.log(UPDATE);
      PG_CLIENT.query(UPDATE, function(err, result) {
        return callback(err, req, res);
      });
    }
    else { // does this ever run?
      console.log(' - - - - - - - - - - - - - DO WE NEED THIS?!');
      return callback(err, req, res);
    }
  });
}

function save_state_to_db(req, res, callback) {
  req.meta = extract_browser_request_metadata(req);
  // console.log(req.meta);
  req.record = { // in for a penny, in for a pound!!
    store_id: req.json.store_id || '1',
    session_id: req.json.session_id || set_session_id(req),
    person_id: req.json.person_id || '1', // if not logged-in set to 1
    data: JSON.stringify(req.json)
  }
  if(req.json.email_address && req.json.person_id !== '1') {
    register_person_by_email_address(req, res,
      function user_created(err, req, res) {
        console.log('L75: person_id:', req.record.person_id);
        create_session_if_not_exist(req, res, function save(err, req, res) {
          console.log('totes done');
          return insert_or_update_state(req, res, callback);
        })
      });
  }
  else {
    create_session_if_not_exist(req, res, function save(err, req, res) {
      console.log('totes done');
      return insert_or_update_state(req, res, callback);
    })
  }
}

function register_person_by_email_address(req, res, callback) {
  var verify_token = crypto.createHash('sha256')
    .update(req.json.email_address + Math.random() * Date.now()) // pseudorandom
    .digest('hex').substring(0, 13); // if you don't understand do your homework
  var SELECT = escape('SELECT * FROM people WHERE email = %L',
  req.json.email_address);
  console.log('SELECT:', SELECT);
  PG_CLIENT.query(SELECT, function(err, result) {
    if(err || result.rows.length === 0) {
      var INSERT = escape('INSERT INTO people '
      + '(email, password, verify_token) VALUES (%L, %L, %L)',
      req.json.email_address, 'temporarypassword', verify_token);
      PG_CLIENT.query(INSERT, function(err, result) {
        console.log(err, result)
        console.log(' - - - - - - - - - - - - - -')
        console.log('person INSERTed:', req.json.email_address);
        // fire off verification email asynchronously
        var person = {
          name : "Friend", // we don't ask for their name till later!
          email: req.json.email_address,
          subject:"Here are your Timers/Tasks | Please Verify your email Address",
          verify_token: verify_token,
          server: req.meta.origin
        }
        email(person, function(err, res) {
          console.log(err, res);
        });
        // get person_id so we can include it in the session & store
        PG_CLIENT.query(SELECT, function(err, result) {
          // console.log(err, result)
          console.log('L106 person_id:', result.rows[0].id);
          req.json.person_id = result.rows[0].id.toString();  // for client
          req.record.person_id = result.rows[0].id.toString(); // for session
          return callback(err, req, res);
        });
      });
    }
    else { // person already exists not updating for now.
      console.log('L114 person_id:', result.rows[0].id);
      req.json.person_id = result.rows[0].id.toString();  // for client
      req.record.person_id = result.rows[0].id.toString(); // for session
      return callback(err, req, res);
      return callback(err, req, res);
    }
  });
}

function insert_or_update_state(req, res, callback) {
  var r = req.record;
  var SELECT = escape('SELECT * FROM store WHERE session_id = %L',
  r.session_id);
  PG_CLIENT.query(SELECT, function(err, result) {
    if(err || result.rows.length === 0) {
      var INSERT = escape('INSERT INTO store '
      + '(session_id, person_id, data) VALUES (%L, %L, %L)',
        r.session_id, r.person_id, r.data);
      PG_CLIENT.query(INSERT, function(err, result) {
        console.log('state INSERTed:', r.session_id);
        return callback(err, req, res);
      });
    }
    else {
      var UPDATE = escape('UPDATE store SET '
      + 'person_id = %L, data = %L WHERE session_id = %L',
        r.person_id, r.data, r.session_id);
      console.log(UPDATE);
      PG_CLIENT.query(UPDATE, function(err, result) {
        // console.log(err, result);
        console.log('state UPDATEd:', r.session_id);
        console.log('times.length:', req.json.timers.length,
        req.json.timers[req.json.timers.length-1].description);
        return callback(err, req, res);
      });
    }
  });
}

function check_verification_token(req, res, callback) {
  var token = req.url.split('?')[1];
  console.log('verify_token:', token);
  var SELECT = escape('SELECT * FROM people WHERE verify_token = %L', token);
  console.log('L182 SELECT:', SELECT);
  PG_CLIENT.query(SELECT, function(err, result) {
    if(err || result.rows.length === 0) { // invalid verify token
      return callback(err, req, res);
    }
    else {
      var UPDATE = escape('UPDATE people SET '
      + 'verified = %L WHERE verify_token = %L',
      '' + Math.floor(Date.now()/1000), token);
      console.log(UPDATE);
      PG_CLIENT.query(UPDATE, function(err, result) {
        console.log(err, result);
        console.log('Verified:', token);
        return callback(err, req, res);
      });
    }
  });
}

function get_store_for_verification_token(req, res, callback) {
  var token = req.url.split('?')[1];
  var SELECT = escape('SELECT * FROM people WHERE verify_token = %L', token);
  console.log('L204 SELECT:', SELECT);
  PG_CLIENT.query(SELECT, function(err, result) {
    console.log(err, result);
    if(err || result.rows.length === 0) { // invalid verify token
      return callback(err, req, res);
    }
    else {
      var SELECT = escape('SELECT * FROM store WHERE person_id = %L',
      '' + result.rows[0].id);
      console.log('L213 SELECT:', SELECT);
      PG_CLIENT.query(SELECT, function(err, result2) {
        // console.log(err, result2);
        // console.log('L216 result2.rows[0].data', result2.rows[0].data);
        combine_stores_for_user(req, result2, function(req){
          return callback(err, req, res);
        });
      });
    }
  });
}

// if the person has timers from more than one session or device, combine them
function combine_stores_for_user(req, result, callback) {
  var body = ''; // accumulate the HTTP POST body before attempting to process.
  req.on('data', function (data) { body += data; });
  req.on('end', function () {
    try {
      req.json = JSON.parse(body); // MVP!! (Don't Do this Kids!!)
    } catch(e) { // in case for any reason the JSON from the client is malformed
      console.warn('unable to parse the data received:', body)
      res.writeHead(200, {'Content-Type': 'text/json'});
      return res.end(body);
    }
    console.log('L236: - - - - - - - - - - - - req.json:')
    console.log(req.json)
    console.log(' - - - - - - - - - - - - - - -  - - - - - - - - - - - - - -')
    result.rows.forEach(function(row) {
      try {
        console.log(row.data)
        row.data.timers.forEach(function(timer){ req.json.timers.push(timer)});
        // req.json.timers.concat(row.data.timers);
        req.json.email_address = req.json.email_address || row.email_address;
      } catch(e) {
        console.log('FAILEDED!!')
      }
    });
    req.json.timers
    return callback(req);
  });
}

module.exports = {
  save_state: save_state_to_db,
  check_verification_token: check_verification_token,
  get_store_for_verification_token: get_store_for_verification_token
}

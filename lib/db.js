require('env2')('.env'); // see: https://github.com/dwyl/env2
var assert = require('assert');
// if DATABASE_URL Environment Variable unset halt server startup else continue
assert(process.env.DATABASE_URL, 'Please set DATABASE_URL Env Variable');

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
    if(err || result.rows.length === 0) {
      var create = escape('INSERT INTO sessions '
        + '(session_id, person_id) VALUES (%L, %L)',
        r.session_id, r.person_id);
      PG_CLIENT.query(create, function(err, result) {
        // console.log(err, result);
        return callback(err, req, res);
      });
    }
    else {
      return callback(err, req, res);
    }
  });
}

function save_state_to_db(req, res, callback) {
  req.meta = extract_browser_request_metadata(req);
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
  var SELECT = escape('SELECT * FROM people WHERE email = %L',
  req.json.email_address);
  console.log('SELECT:', SELECT);
  PG_CLIENT.query(SELECT, function(err, result) {
    if(err || result.rows.length === 0) {
      var INSERT = escape('INSERT INTO people '
      + '(email, password) VALUES (%L, %L)',
      req.json.email_address, 'temporarypassword');
      PG_CLIENT.query(INSERT, function(err, result) {
        // console.log(err, result)
        // console.log(' - - - - - - - - - - - - - -')
        console.log('person INSERTed:', req.json.email_address);
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

module.exports = {
  save_state: save_state_to_db
}

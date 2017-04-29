require('env2')('.env'); // see: https://github.com/dwyl/env2
var assert = require('assert');
// if DATABASE_URL Environment Variable unset halt server startup else continue
assert(process.env.DATABASE_URL, 'Please set DATABASE_URL Env Variable');

var http = require('http');
var fs = require('fs');
var path = require('path');
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


http.createServer(function (req, res) {
  log_hit(req);
  switch (req.url) {
    case '/save':
      handle_post(req, res)
      break;
    case '/client.js':
      fs.readFile(path.resolve('./client.js'), function (err, data) {
        res.writeHead(200, {'Content-Type': 'text/javascript'});
        res.end(data);
      });
      break;
    default:
      fs.readFile(path.resolve('./index.html'), function (err, data) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(data);
      });
      break;
  }

}).listen(process.env.PORT); // start the server with the command: npm run dev

function log_hit(req) {
  var r = extract_browser_request_metadata(req);
  // console.log(r);
}

function extract_browser_request_metadata(req) {
  var r = req.headers;
  r.url = req.method + ': ' + req.url; // log the method and url requested
  r.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  return r;
}

/**
 * use client/browser metadata to create the session so it's unique
 */
function set_session_id(meta) {
  return crypto.createHash('sha256').update(JSON.stringify(meta))
    .digest('hex').substring(0, 36);
}

/**
 * see: https://github.com/nelsonic/time-mvp/issues/5
 */
function create_session_if_not_exist(record, callback) {
  var select = escape('SELECT * FROM sessions '
    + 'WHERE session_id = %L', record.session_id);
  PG_CLIENT.query(select, function(err, result) {
    // console.log(err, result);
    if(err || result.rows.length === 0) {
      var create = escape('INSERT INTO sessions '
        + '(session_id, person_id) VALUES (%L, %L)',
        record.session_id, record.person_id);
      PG_CLIENT.query(create, function(err, result) {
        console.log(err, result);
        return callback();
      });
    }
    else {
      return callback();
    }
    // console.log(JSON.stringify(result.rows[0]), 'session');
  });
}

function save_state_to_db(req, res, data, callback) {
  var meta = extract_browser_request_metadata(req);
  var json;
  try {
    json = JSON.parse(data);
  } catch(e) { // in case for any reason the JSON from the client is malformed
    console.log('unable to parse the data received:', data)
  }
  var record = {
    store_id: json.store_id || '1',
    session_id: json.session_id || set_session_id(meta),
    person_id: json.person_id || '1', // if person is not logged-in set to 1.
    data: data
  }
  create_session_if_not_exist(record, function save() { // named inner callback
    console.log('totes done');
    return insert_or_update_state(record, callback);
  })
}

function insert_or_update_state(record, callback) {
  var SELECT = escape('SELECT * FROM store WHERE session_id = %L',
  record.session_id);
  PG_CLIENT.query(SELECT, function(err, result) {
    // console.log(err, result);
    if(err || result.rows.length === 0) {
      var INSERT = escape('INSERT INTO store '
      + '(session_id, person_id, data) VALUES (%L, %L, %L)',
        record.session_id, record.person_id, record.data);
      PG_CLIENT.query(INSERT, function(err, result) {
        console.log(err, result);
        return callback();
      });
    }
    else {
      var UPDATE = escape('UPDATE store SET ' +
      '(person_id, data) VALUES (%L, %L)',
        record.person_id, record.data);
      PG_CLIENT.query(UPDATE, function(err, result) {
        console.log(err, result);
        return callback();
      });
    }
  });
}


function handle_post(req, res) {
  var body = ''; // accumulate the HTTP POST body before attempting to process.
  req.on('data', function (data) { body += data; });
  req.on('end', function () {
    // console.log("Body: " + body);
    save_state_to_db(req, res, body, function(){
      res.writeHead(200, {'Content-Type': 'text/json'});
      res.end(body);
    });
  });
}

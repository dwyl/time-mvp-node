require('env2')('.env'); // see: https://github.com/dwyl/env2
var assert = require('assert');
// if DATABASE_URL Environment Variable unset halt server startup else continue
assert(process.env.DATABASE_URL, 'Please set DATABASE_URL Env Variable');

var http = require('http');
var fs = require('fs');
var path = require('path');
var crypto = require('crypto'); // http://nodejs.org/api/crypto.html
var pg = require('pg');
var PG_CLIENT; // connect once and expose the connection via PG_CLIENT
pg.connect(process.env.DATABASE_URL, function(err, client, done) {
  assert(!err, 'ERROR Connecting to PostgreSQL!');
  // console.log({ client: client, done: done});
  PG_CLIENT = client;
  var select = "SELECT * FROM store WHERE person_id = '1'";
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
  console.log(r);
}

function extract_browser_request_metadata(req) {
  var r = req.headers;
  r.url = req.method + ': ' + req.url; // log the method and url requested
  r.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  return r;
}

function handle_post(req, res) {
  var body = ''; // accumulate the HTTP POST body before attempting to process.
  req.on('data', function (data) { body += data; });
  req.on('end', function () {
      // console.log("Body: " + body);
      res.writeHead(200, {'Content-Type': 'text/json'});
      res.end(body);
  });
}

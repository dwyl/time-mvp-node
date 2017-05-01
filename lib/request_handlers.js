var fs = require('fs');
var path = require('path');
var db = require('./db.js');

function serve_index(req, res) {
  return fs.readFile(path.resolve('./lib/index.html'), function (err, data) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(data);
  });
}

function serve_client(req, res) {
  return fs.readFile(path.resolve('./lib/client.js'), function (err, data) {
    res.writeHead(200, {'Content-Type': 'text/javascript'});
    res.end(data);
  });
}

function handle_post(req, res) {
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
    db.save_state(req, res, function(err, req, res){
      res.writeHead(200, {'Content-Type': 'text/json'});
      return res.end(JSON.stringify(req.json));
    });
  });
}

function handle_email_verification_request(req, res) {
  if(req.headers.accept.indexOf('text/html') > -1) { // clicked link in email
    db.check_verification_token(req, res, function(err, req, res) {
      fs.readFile(path.resolve('./lib/index.html'), function (err, data) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(data);
      });
    });
  }
  else { // get existing state for client based on verification token
    console.log('JSON "AJAX" request for /verify');
    db.get_store_for_verification_token(req, res, function(err, req, res) {
      res.writeHead(200, {'Content-Type': 'text/json'});
      console.log('63 - - - - - - - - - - - -req.json:')
      console.log(req.json)
      return res.end(JSON.stringify(req.json));
    });
  }
}

module.exports = {
  serve_index: serve_index,
  serve_client: serve_client,
  handle_post: handle_post,
  handle_email_verification_request: handle_email_verification_request
}

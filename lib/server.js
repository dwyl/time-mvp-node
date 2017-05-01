var http = require('http');
var fs = require('fs');
var path = require('path');
var db = require('./db.js');

http.createServer(function handler (req, res) {
  switch (req.url) {
    case '/save':
      handle_post(req, res)
      break;
    case '/client.js':
      fs.readFile(path.resolve('./lib/client.js'), function (err, data) {
        res.writeHead(200, {'Content-Type': 'text/javascript'});
        res.end(data);
      });
      break;
    default:
      fs.readFile(path.resolve('./lib/index.html'), function (err, data) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(data);
      });
      break;
  }
}).listen(process.env.PORT); // start the server with the command: npm run dev

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

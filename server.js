var http = require('http');
var fs = require('fs');
var path = require('path');


http.createServer(function (req, res) {
  console.log(req.url); // log the url the client/browser requested (duh!)
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

function handle_post(req, res) {
  console.log("POST");
  var body = '';
  req.on('data', function (data) {
      body += data;
      console.log("Partial body: " + body);
  });
  req.on('end', function () {
      console.log("Body: " + body);
  });
  fs.readFile(path.resolve('./index.html'), function (err, data) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(data);
  });
}

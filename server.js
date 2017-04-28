var http = require('http');
var fs = require('fs');
var path = require('path');

var index = fs.readFileSync('index.html');

http.createServer(function (req, res) {
  console.log(req.url); // log the url the client/browser requested (duh!)
  switch (req.url) {
    case '/' || '/index.html':
      fs.readFile(path.resolve('./index.html'), function (err, data) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(data);
      });
      break;
    case '/client.js':
      fs.readFile(path.resolve('./client.js'), function (err, data) {
        res.writeHead(200, {'Content-Type': 'text/javascript'});
        res.end(data);
      });
      break;
    default:
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(index);
      break;
  }
}).listen(process.env.PORT || 8000);

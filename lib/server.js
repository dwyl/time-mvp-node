var http = require('http');
var handlers = require('./request_handlers.js');

http.createServer(function handler (req, res) { // can you make it simpler? ;-)
  console.log(req.method, ':', req.url); // rudimentary request logging
  var url = req.url.split('?')[0];       // strip query params for url routing
  switch (url) {
    case '/save':
      handlers.handle_post(req, res);
      break;
    case '/verify':
      handlers.handle_email_verification_request(req, res);
      break;
    case '/client.js':
      handlers.serve_client(req, res);
      break;
    default:
      handlers.serve_index(req, res);
      break;
  }
}).listen(process.env.PORT); // start the server with the command: npm run dev

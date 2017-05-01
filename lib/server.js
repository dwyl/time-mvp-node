var http = require('http');
var handlers = require('./request_handlers.js');

http.createServer(function run (req, res) { // can you make simplify it? ;-)
  console.log(req.method, ':', req.url);    // absolute minimum request logging
  var url = req.url.split('?')[0];          // strip query params for routing
  switch (url) {
    case '/client.js':                      // serve the client application
      handlers.serve_client(req, res);
      break;
    case '/save':                           // save state to server
      handlers.handle_post(req, res);
      break;
    case '/verify':                         // verify the person's email address
      handlers.handle_email_verification_request(req, res);
      break;
    default:                                // serve the application
      handlers.serve_index(req, res);
      break;
  }
}).listen(process.env.PORT); // start the server with the command: npm run dev

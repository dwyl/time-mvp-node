// for complete instructions see: github.com/dwyl/sendemail]
require('env2')('.env'); // see: https://github.com/dwyl/env2
var sendemail = require('sendemail');
var email = sendemail.email;
sendemail.set_template_directory(process.env.TEMPLATE_DIRECTORY);

module.exports = function (person, callback) {
  email('welcome', person, function(error, result){
    console.log(' - - - - - - - - - - - - - - - - - - - - -> email sent: ');
    console.log(error, result);
    console.log(' - - - - - - - - - - - - - - - - - - - - - - - - - - - -')
    console.log(person);
    if(callback && typeof callback === "function") {
      return callback(error, result);
    }
  })
}

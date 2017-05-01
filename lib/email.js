// for complete instructions see: github.com/dwyl/sendemail]
require('env2')('.env'); // see: https://github.com/dwyl/env2
var sendemail = require('sendemail');
var email = sendemail.email;
sendemail.set_template_directory(process.env.TEMPLATE_DIRECTORY);

var person = {
  name : "Friend",
  email: "contact.nelsonic@gmail.com",
  subject:"Here are your Timers/Tasks"
}

email('welcome', person, function(error, result){
  console.log(' - - - - - - - - - - - - - - - - - - - - -> email sent: ');
  console.log(error, result);
  console.log(' - - - - - - - - - - - - - - - - - - - - - - - - - - - -')
  console.log(person);
})

/** Elmo is a "Barebones" implementation of the Elm Architecture in JavaScript.
New to this? see: https://github.com/dwyl/learn-elm-architecture-in-javascript
         __   __
       .'  '.'  `.
    _.-|  o | o  |-._
  .~   `.__.'.__.'^  ~.
.~     ^  /   \  ^     ~.
\-._^   ^|     |    ^_.-/
`\  `-._  \___/ ^_.-' /'
  `\_   `--...--'   /'
     `-.._______..-'      /\  /\
        __/   \__         | |/ /_
      .'^   ^    `.      .'   `__\
    .'    ^     ^  `.__.'^ .\ \
   .' ^ .    ^   .    ^  .'  \/
  /    /        ^ \'.__.'
 |  ^ /|   ^      |
  \   \|^      ^  |
   `\^ |        ^ |
     `~|    ^     |
       |  ^     ^ |
       \^         /
        `.    ^ .'
         : ^    ;
 .-~~~~~~   |  ^ ~~~~~~-.
/   ^     ^ |    ^       \
\^     ^   / \  ^     ^  /
 `~~~~~~~~'   `~~~~~~~~~'
*******************************************************************************/
console.log('elmo loaded');

var store = {
  timers: [],
  default_minutes_per_pomodoro: 25,
  date: new Date(),
  gmt_offset: new Date().toString().split("GMT")[1].split(" (")[0]
};

// Define the Component's Actions:
var Inc = 'inc';                     // increment the counter
var Dec = 'dec';                     // decrement the counter
var Res = 'reset';                   // reset counter: git.io/v9KJk

function update(model, action) {     // Update function takes the current state
  switch(action) {                   // and an action (String) runs a switch
    case Inc: return model + 1;      // add 1 to the model
    case Dec: return model - 1;      // subtract 1 from model
    case Res: return 0;              // reset state to 0 (Zero) git.io/v9KJk
    default: return model;           // if no action, return curent state.
  }                                  // (default action always returns current)
}

function view(signal, model, root) {
  empty(root);                                 // clear root element before
  [                                            // Store DOM nodes in an array
    button('+', signal, Inc),                  // then iterate to append them
    div('count', model),                       // create div with stat as text
    button('-', signal, Dec),                  // decrement counter
    button('Reset', signal, Res)               // reset counter
  ].forEach(function(el){ root.appendChild(el) }); // forEach is ES5 so IE9+
} // yes, for loop is "faster" than forEach, but readability trumps "perf" here!

// Mount Function receives all MUV and mounts the app in the "root" DOM Element
function elmount(model, update, view, root_element_id) {
  var root = document.getElementById(root_element_id); // root DOM element
  function signal(action) {          // signal function takes action
    return function callback() {     // and returns callback
      model = update(model, action); // update model according to action
      view(signal, model, root);     // subsequent re-rendering
    };
  };
  view(signal, model, root);         // render initial model (once)
}

// The following are "Helper" Functions which each "Do ONLY One Thing" and are
// used in the "View" function to render the Model (State) to the Browser DOM:

// empty the contents of a given DOM element "node" (before re-rendering)
function empty(node) {
  // console.log('node', node);
  while (node.firstChild) {
      node.removeChild(node.firstChild);
  }
} // Inspired by: stackoverflow.com/a/3955238/1148249

function button(text, signal, action) {
  var button = document.createElement('button');
  var text = document.createTextNode(text);    // human-readable button text
  button.appendChild(text);                    // text goes *inside* not attrib
  button.className = action;                   // use action as CSS class
  button.id = action;
  // console.log(signal, ' action:', action)
  button.onclick = signal(action);             // onclick tells how to process
  return button;                               // return the DOM node(s)
} // how to create a button in JavaScript: stackoverflow.com/a/8650996/1148249

function div(divid, text) {
  var div = document.createElement('div');
  div.id = divid;
  div.className = divid;
  if(text !== undefined) { // if text is passed in render it in a "Text Node"
    var txt = document.createTextNode(text);
    div.appendChild(txt);
  }
  return div;
}

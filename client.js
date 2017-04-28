// GLOBAL store for all data
var store = {};

/**
 * read state form localStorage if the user has used the app before
 */
function initialise_state() {
  try { // see: http://diveintohtml5.info/detect.html#storage
    if('localStorage' in window && window['localStorage'] !== null
      && localStorage.getItem('store')) {
      store = JSON.parse(localStorage.getItem('store'));
      // console.log(store);
    } else { // always initialise to empty
      store = { timers: [] };
    }
  } catch(e) {
    console.log('No Store Saved in localStorage! Welcome to Timer Land!');
    store = { timers: [] };
    return false;
  }
}

/**
 * save state to localstorage so that we don't lose a timer on page refresh
 */
function save_state_to_localstorage() {
  try { // see: http://diveintohtml5.info/detect.html#storage
    if('localStorage' in window && window['localStorage'] !== null) {
      localStorage.setItem('store', JSON.stringify(store));
    }
  } catch(e) {
    return false;
  }
}

/**
 * format timer in MM:SS (no need for hours, yet!)
 */
function format_timer(seconds) { // "pad" with a 00 or 0 if required:
  // seconds = seconds || 0;
  if(isNaN(seconds)) {
    // start_timer();
    console.log('format_timer(', seconds ,')');
    seconds = 321;
  }
  var MM = String("00" + Math.floor(seconds / 60)).slice(-2);
  var SS = String("00" + seconds % 60).slice(-2);
  return MM + ':' + SS;
}

/**
 * Display Timer in Browser Tab Title see: github.com/dwyl/time/issues/37
 */
function update_desktop_browser_tab_title_counter() {
  var start_time = get_current_active_timer().start;
  var now = Date.now();
  var seconds = Math.ceil((now - start_time) / 1000); // round up!
  var default_minutes_per_pomodoro = 25;
  var default_time_estimate = default_minutes_per_pomodoro * 60 * 1000;
  var remaining = Math.floor((start_time + default_time_estimate - now) / 1000);
  var rem = (remaining < 0 ? '-' : '') + format_timer(remaining)
  document.title = format_timer(seconds) + ' / ' + rem
    + ' (Est: ' + default_minutes_per_pomodoro +' mins)';
}

// this could be "DRY-ed" out ...
function update_timer_counter() {
  var start_time = get_current_active_timer().start;
  var now = Date.now();
  var seconds = Math.ceil((now - start_time) / 1000); // round up!
  var default_minutes_per_pomodoro = 25;
  var default_time_estimate = default_minutes_per_pomodoro * 60 * 1000;
  var remaining = Math.floor((start_time + default_time_estimate - now) / 1000);
  var rem = (remaining < 0 ? '-' : '') + format_timer(remaining)
  document.getElementById("timer").innerHTML = format_timer(seconds)
  + ' / ' + rem;
  document.getElementById("estimate").innerHTML =  '(Estimate: '
    + default_minutes_per_pomodoro +' minutes)'
}


function timer_is_running() {
  console.log('Timer Count: ' + store.timers.length);
  var running = store.timers.filter(function (timer) {
    console.log(timer);
    return !timer.end; // we only care about the timers without an end time!
  });
  console.log('Number of Active Timers: ' + running.length);
  return running.length > 0;
}

function get_current_active_timer() {
  var running = store.timers.filter(function (timer) {
    return !timer.end; // we only care about the timers without an end time!
  });
  // console.log('get_current_active_timer()', running)
  return running[0];
}


function start_timer() {
  console.log('start_timer()');
  if (timer_is_running()) {
    // do nothing
    // console.log(get_current_active_timer());
  }
  else {
    store.timers.push({
      start: Date.now()
    });

  }
  save_state_to_localstorage();
}

function clock() {
  store.interval = setInterval(function () {
    update_desktop_browser_tab_title_counter();
    update_timer_counter();
  }, 2000); // ensure we don't skip seconds in the UI
}

/**
 * this will delete the state in the app and the localStorage irrevocably!
 */
function reset_state() {
  store = { timers: [] }; // reset
  localStorage.removeItem('store');
  window.location.reload();
  return false;
}

/**
 * remove blank lines and excess white space from description
 * auto grow the height of the text area when text goes on new line
 */
function auto_grow(element) {
  clearInterval(store.interval);  // avoid showing a "NaN" while updating
  var e = element || document.getElementById("description")
  e.style.height = "5px";
  e.style.height = (e.scrollHeight)+"px";
  e.value.replace(/^\s+|\s+$/g, "");
  clock();
} // see: http://stackoverflow.com/questions/17772260/textarea-auto-height

function save_timer_description() {
  var description = document.getElementById("description").value
  console.log('save_timer_description() > ' + description)
  store.timers[store.timers.length-1].description = description;
}

function stop_timer() {
  store.timers[store.timers.length-1].end = Date.now();
  render_complete();
  start_timer(); // start a new timer cause time doesn't stop!
  var desc = document.getElementById("description");
  desc.value = 'Describe your task ...';
  auto_grow();
  desc.focus();
}

function render_complete() {
  save_timer_description(); // avoid saving a timer without a description.

  // clear the placeholder table
  var old_tbody = document.getElementById('timers')
    .getElementsByTagName('tbody')[0]
  old_tbody.parentNode.replaceChild(document.createElement('tbody'), old_tbody)

  store.timers.forEach(function(t) {
    if(t.end) {
      var seconds = Math.floor((t.end - t.start)/1000);
      // developer.mozilla.org/en-US/docs/Web/API/HTMLTableElement/insertRow
      var tableRef = document.getElementById('timers')
        .getElementsByTagName('tbody')[0];
      var newRow = tableRef.insertRow(0);
      newRow.className = 'striped--near-white';
      // Insert a cell in the row at index 0
      var descCell = newRow.insertCell(0);
      descCell.className = 'pv2 ph3';
      var newText = document.createTextNode(t.description);
      descCell.appendChild(newText);

      var timeCell = newRow.insertCell(1);
      timeCell.className = 'pv2 ph3 tr';
      var newText = document.createTextNode(format_timer(seconds));
      timeCell.appendChild(newText);
    }
  });
}

console.log('Welcome to Monotask Timer Land!');

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
      console.log(store);
    } else { // always initialise to empty
      store = {
        counter: 1,
        timers: []
      };
    }
  } catch(e) {
    console.log('No Store Saved in localStorage!');
    store = {
      counter: 1,
      timers: []
    };
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
 * format timer in MM:SS
 */
function format_timer(seconds) {
  var MM = String("00" + Math.floor(seconds / 60)).slice(-2);
  var SS = String("00" + seconds % 60).slice(-2);
  return MM + ':' + SS;
}


function update_tab_title_counter() {
  var start_time = get_current_acctive_timer().start;
  var now = Date.now();
  var seconds = Math.ceil((now - start_time) / 1000); // round up!
  var default_minutes_per_pomodoro = 25;
  var default_time_estimate = default_minutes_per_pomodoro * 60 * 1000;
  var remaining = Math.floor((start_time + default_time_estimate - now) / 1000);
  document.title = format_timer(seconds) + ' | ' + format_timer(remaining)
    + ' (Est: ' + default_minutes_per_pomodoro +' mins)';
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

function get_current_acctive_timer() {
  var running = store.timers.filter(function (timer) {
    // console.log(timer);
    return !timer.end; // we only care about the timers without an end time!
  });
  // console.log('Number of Active Timers: ' + running.length);
  return running[0];
}


function start_timer() {
  console.log('start_timer()');
  if (timer_is_running()) {

  }
  else {
    store.timers.push({
      start: Date.now()
    });
  }
  save_state_to_localstorage();
}


function clock() {
  var interval = window.setInterval(function () {
    update_tab_title_counter();
  }, 1000);
}

initialise_state()
clock();
start_timer();

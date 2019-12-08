function makeTwoDig(number) {
  if (number < 10) {
    return '0' + number
  } else {
    return number
  }
}

// date ----------->
var d = new Date();
var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var nowdate
var nowday
var nowmonth
var nowyear

Intl.DateTimeFormat().resolvedOptions().timeZone

function markdownDate(year, month, day) {
  var mdd = new Date(year, month - 1, day)
  var mddatestr = '<p style="display:none">' + year + '-' + month + '-' + day + '</p>'
  var mdyear = '<h1 style="color:#6EAAD2;line-height: 0px;">' + year + '</span><br>'
  var mddate = '<h2 style="color:#AAAAAA;line-height: 10px;">' + days[mdd.getDay()] + ' ' + day + ' ' + months[mdd.getMonth()] + '</span><br>'
  var mdtime = '<h6 style="color:#000000;line-height: 10px;">' + makeTwoDig(d.getHours()) + ':' + makeTwoDig(d.getMinutes()) + ' ' + Intl.DateTimeFormat().resolvedOptions().timeZone + '</span><br id="thisisamarker">'
  return mddatestr + mdyear + mddate + mdtime
}


function getTodayDate() {
  nowday = JSON.stringify(makeTwoDig(d.getDate()))
  nowmonth = makeTwoDig(d.getMonth() + 1)
  nowyear = JSON.stringify(d.getFullYear())
  nowdate = [nowyear, nowmonth, nowday]
  return nowdate
}

function getFullDate(year, month, day) {
  var nd = new Date(year, month, day)
  var fday = days[d.getDay()]
  var fmonth = months[parseInt(month)]
  var fdate = fday + ' ' + day.toString() + ' ' + fmonth + ' ' + year.toString()
  return fdate
}
// end date <---------

const remote = require('electron').remote;
const app = remote.app;

const fs = require('fs');
var CryptoJS = require("crypto-js");

var password
var passwordisset = false

// Make sure JS Journal has access to it's userdata folder ------->

var canrwuserdata

function quitNoAccess() {
  alert('JS Journal doees no have sufficiant permissions to ' + app.getPath('userData') + ' (its data folder), please make sure JS Journal can read/write here.')
  app.quit()
}

fs.promises.access(app.getPath('userData'), fs.constants.R_OK | fs.constants.W_OK)
  .then(() => canrwuserdata = true)
  .catch(() => quitNoAccess());

// end permissions check <----------

// Check if user has already registered / created a journal ----->

var hasregistered

if (fs.existsSync(app.getPath('userData')+'/journal/passcheck')) {
  hasregistered = true
} else {
  hasregistered = false
}

// end registered check <--------

function login() {
  password = $('#passwd').val()
  if (passwordisset == false && password != '') {
    passwordisset = true
  }
}

$("#passwd").keypress(function (event) {
  if (event.which == 13) {
    login()
  }
});

function readFile(filepath) {
  textencrypted = fs.readFileSync(filepath, 'utf-8')
  textdecrypted = CryptoJS.AES.decrypt(textencrypted, password)
  textutf8 = textdecrypted.toString(CryptoJS.enc.Utf8)
  return textutf8
}

function writeFile(filepath, content) {
  textencrypted = CryptoJS.AES.encrypt(content, password).toString()
  fs.writeFileSync(filepath, content)
}

const {
  app
} = require('electron').remote
var fs = require('fs')
var CryptoJS = require("crypto-js");
var path = app.getPath('appData') + '/js-journal'
var showdown = require('showdown')
var converter = new showdown.Converter()
var pad = document.getElementById('pad')
var markdownArea = document.getElementById('markdown')
var mainArea = document.getElementById('all')
var passArea = document.getElementById('pass')
var indexofentriespath = path + '/index-of-entries.json'
var indexofentries = []
var indexofEntriesArray
var currentEntry = null
var d = new Date();
var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var nowdate
var nowday
var nowmonth
var password
var nowyear
var markdowndate
var loadingentry
var newid
var locked = true

Intl.DateTimeFormat().resolvedOptions().timeZone

function makeCollapse() {
  var coll = document.getElementsByClassName("collapsible");
  var i;

  for (i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function() {
      this.classList.toggle("active");
      var content = this.nextElementSibling;
      if (content.style.display === "block") {
        content.style.display = "none";
      } else {
        content.style.display = "block";
      }
    });
  }
}

function enterPass() {
  password = document.getElementById('passwd').value
  loadEntriesFile()
  entriesFileToArray()
  listEntries()
  locked = false
}


function loadEntriesFile() {
  // check if the list of entries already exists if not then create it
  try {
    indexofentriesArray = require(indexofentriespath)
  } catch (e) {
    if (e.code == 'MODULE_NOT_FOUND') {
      saveEntriesIndex()
    } else {
      indexofentriesArray = require(indexofentriespath)
      listEntries()
    }
  }
}

function entriesFileToArray() {
  // load json list into js array
  for (var i in indexofentriesArray) {
    if (indexofentriesArray.hasOwnProperty(i) && !isNaN(+i)) {
      indexofentries[+i] = indexofentriesArray[i];
      console.log('loaded')
    }
  }
}

function lock() {
  password = null
  locked = true
  pad.value = ''
  document.getElementById('entrytitle').value = 'untitled'
}

function hidePreview() {
  markdownArea.className = 'hidden'
  pad.className = 'col-md-6 full-height fullwidth'
}

function showBoth() {
  markdownArea.className = 'col-md-6 full-height wordwrap leftborder'
  pad.className = 'col-md-6 full-height'
}

function hideInput() {
  markdownArea.className = 'col-md-6 full-height wordwrap fullwidth noborder'
  pad.className = 'hidden'
}

function makeTwoDig(number) {
  if (number < 10) {
    return '0' + number
  } else {
    return number
  }
}

function markdownDate() {
  var mdyear = '<h1 style="color:#6EAAD2;line-height: 0px;">' + d.getFullYear() + '</span><br>'
  var mddate = '<h2 style="color:#AAAAAA;line-height: 10px;">' + days[d.getDay()] + ' ' + d.getDate() + ' ' + months[d.getMonth()] + '</span><br>'
  var mdtime = '<h6 style="color:#000000;line-height: 10px;">' + makeTwoDig(d.getHours()) + ':' + makeTwoDig(d.getMinutes()) + ' ' + Intl.DateTimeFormat().resolvedOptions().timeZone + '</span><br>'
  markdowndate = mdyear + mddate + mdtime
}


function getTodayDate() {
  nowday = JSON.stringify(makeTwoDig(d.getDate()))
  nowmonth = makeTwoDig(d.getMonth() + 1)
  nowyear = JSON.stringify(d.getFullYear())
  nowdate = nowyear + '-' + nowmonth + '-' + nowday
}
getTodayDate()

function getFullDate(year, month, day) {
  var nd = new Date(year, month, day)
  var fday = days[d.getDay()]
  var fmonth = months[parseInt(month)]
  var fdate = fday + ' ' + day.toString() + ' ' + fmonth + ' ' + year.toString()
  return fdate
}

setInterval(() => {
  getTodayDate()
}, 60000)

function makeTwoDig(number) {
  if (number < 10) {
    return '0' + number
  } else {
    return number
  }
}

// save the list of entries
function saveEntriesIndex() {
  var indexofentriesJSON = Object.assign({}, indexofentries)
  var indexofentriesJSONstring = JSON.stringify(indexofentriesJSON)

  fs.writeFile(indexofentriespath, indexofentriesJSONstring, (err) => {
    if (err) {
      // console.log('An error ocurred creating the JSON file ' + err.message)
    } else {
      // console.log('The JSON file has been succesfully saved')
    }
  })
}

// create save directory if it doesn't exist
fs.promises.mkdir(path, {
  "recursive": true
})

// save entrie to file
function saveFile(entryfilename, data) {
  fs.promises.writeFile(entryfilename, data, {
    "recursive": true
  })
  saveEntriesIndex()
}

// loads entry from markdown file
function loadEntry(entry) {
  loadingentry = entry
  if (entry === undefined) {
    console.log('failed')
    return 'failed'
  }
  var id = entry
  document.getElementById('entrytitle').value = indexofentries[id][1]
  var encrypted = indexofentries[id][3]
  var decrypted = decryptMD(encrypted)
  pad.value = decrypted
  currentEntry = id
  loadingentry = undefined
}

// creates the markdown file for an entry and adds it to the index
function createEntry(data) {
  getTodayDate()
  markdownDate()
  var entrytitle = document.getElementById('entrytitle').value
  var entrydate = nowdate
  var entryarray = []
  newid = indexofentries.length
  entryarray = [entrydate, entrytitle, newid, markdowndate]
  indexofentries.push(entryarray)
  currentEntry = newid
  markdownDate()
  saveEntry(markdowndate, newid, entrytitle)
  listEntries()
}

function createAndLoadEntry(data) {
  createEntry(data)
  loadEntry(indexofentries.length - 1)
  listEntries()
}

function getEntryDateRange() {
  var years = []
  for (i = 0; i < indexofentries.length; i++) {
    var entrydatepart = indexofentries[i][0]
    var entryyear = parseInt(entrydatepart.substring(0, 4))
    if (years.includes(entryyear)) {
      // do nothing
    } else {
      years.push(entryyear)
    }
  }
  return years
}

function encryptMD(mdtoencrypt) {
  var ciphertext = CryptoJS.AES.encrypt(mdtoencrypt, password).toString();
  return ciphertext
}

function decryptMD(mdtodecrypt) {
  var bytes = CryptoJS.AES.decrypt(mdtodecrypt, password);
  var originalText = bytes.toString(CryptoJS.enc.Utf8);
  return originalText
}

function saveEntry(data, entry, title) {
  if (locked == false) {
    indexofentries[entry][1] = title
    indexofentries[entry][3] = encryptMD(data)
    saveEntriesIndex()
    return
  } else {
    return
  }
}

// list entries in entriespath
function listEntries() {
  var years = getEntryDateRange()
  var entrieslistyearbutton = []
  var entrieslistyeardiv = []
  var entrieslistmonthbutton = []
  var entrieslistmonthdiv = []
  var entries = []
  getEntryDateRange()
  for (i = 0; i < indexofentries.length; i++) {
    entries[i] = JSON.stringify(indexofentries[i][2]) + '-' + indexofentries[i][1]
  }
  var entrieslist = []
  document.getElementById('sidenav').innerHTML = ''
  for (var i = 0; i < years.length; i++) {
    entrieslistyearbutton[i] = document.createElement('button')
    entrieslistyearbutton[i].className = 'collapsible'
    entrieslistyearbutton[i].innerHTML = years[i]
    entrieslistyeardiv[i] = document.createElement('div')
    entrieslistyeardiv[i].className = 'content'
    for (var u = 0; u < 12; u++) {
      entrieslistmonthbutton[u] = document.createElement('button')
      entrieslistmonthbutton[u].className = 'collapsible'
      entrieslistmonthbutton[u].innerHTML = months[u]
      entrieslistmonthdiv[u] = document.createElement('div')
      entrieslistmonthdiv[u].className = 'content'
      for (var p = 0; p < indexofentries.length; p++) {
        if (parseInt(indexofentries[p][0].substring(0, 4)) == years[i]) {
          if (parseInt(indexofentries[p][0].substring(5, 7)) == u + 1) {
            var listentry = document.createElement('button')
            listentry.className = 'btn btn-link'
            listentry.setAttribute('onClick', 'javascript: loadEntry(parseInt(indexofentries[' + p + '][2]));')
            var daytoconv = parseInt(indexofentries[p][0].substring(8, 10))
            var monthtoconv = parseInt(indexofentries[p][0].substring(5, 7))
            var yeartoconv = parseInt(indexofentries[p][0].substring(0, 4))
            listentry.innerHTML = getFullDate(yeartoconv, monthtoconv - 1, daytoconv) + '<br>' + indexofentries[p][1]
            entrieslistmonthdiv[u].appendChild(listentry)
          }
        }
      }
      entrieslistyeardiv[i].appendChild(entrieslistmonthbutton[u])
      entrieslistyeardiv[i].appendChild(entrieslistmonthdiv[u])
    }
    document.getElementById('sidenav').appendChild(entrieslistyearbutton[i])
    document.getElementById('sidenav').appendChild(entrieslistyeardiv[i])
  }
  makeCollapse()
}
listEntries()

var previousMarkdownValue = ''

// convert text area to markdown html
function convertTextAreaToMarkdown() {
  var markdownText = pad.value
  previousMarkdownValue = markdownText
  var html = converter.makeHtml(markdownText)
  markdownArea.innerHTML = html
  if (currentEntry === null) {
    markdownDate()
    createEntry(markdowndate)
    saveEntriesIndex()
  } else {
    saveEntry(markdownText, currentEntry, document.getElementById('entrytitle').value)
  }
}

window.onload = function() {
  // make the tab act like a tab
  pad.addEventListener('keydown', function(e) {
    if (e.keyCode === 9) { // tab was pressed
      // get caret position/selection
      var start = this.selectionStart
      var end = this.selectionEnd

      var target = e.target
      var value = target.value

      // set textarea value to: text before caret + tab + text after caret
      target.value = value.substring(0, start) +
        "\t" +
        value.substring(end)

      // put caret at right position again (add one for the tab)
      this.selectionStart = this.selectionEnd = start + 1

      // prevent the focus lose
      e.preventDefault()
    }
  })

  function didChangeOccur() {
    if (previousMarkdownValue != pad.value) {
      return true
    }
    return false
  }

  // check every second if the text area has changed
  setInterval(() => {
    if (didChangeOccur()) {
      convertTextAreaToMarkdown()
    }
  }, 1000)

  // convert textarea on input change
  pad.addEventListener('input', convertTextAreaToMarkdown)
}

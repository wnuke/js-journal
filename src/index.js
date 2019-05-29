const {
  app
} = require('electron').remote
var fs = require('fs')
var path = app.getPath('appData') + '/js-journal'
var entriespath = path + '/entries'
var showdown = require('showdown')
var converter = new showdown.Converter()
var pad = document.getElementById('pad')
var markdownArea = document.getElementById('markdown')
var indexofentriespath = path + '/index-of-entries.json'
var indexofentries = []
var indexofentriesArray
var currentEntry = null
var d = new Date();
var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var nowdate
var nowday
var nowmonth
var nowyear
var markdowndate

Intl.DateTimeFormat().resolvedOptions().timeZone

function markdownDate() {
  var mdyear = '<h1 style="color:#6EAAD2;line-height: 0px;">' + d.getFullYear() + '</span><br>'
  var mddate = '<h2 style="color:#AAAAAA;line-height: 10px;">' + days[d.getDay()] + ' ' + d.getDate() + ' ' + months[d.getMonth()] + '</span><br>'
  var mdtime = '<h6 style="color:#000000;line-height: 10px;">' + d.getHours() + ':' + d.getMinutes() + ' ' + Intl.DateTimeFormat().resolvedOptions().timeZone + '</span><br>'
  markdowndate = mdyear + mddate + mdtime
}
markdownDate()

function getTodayDate() {
  nowday = JSON.stringify(makeTwoDig(d.getDate()))
  nowmonth = makeTwoDig(d.getMonth() + 1)
  nowyear = JSON.stringify(d.getFullYear())
  nowdate = nowyear + '-' + nowmonth + '-' + nowday
}
getTodayDate()

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

// check if the list of entries already exists if not then create it
try {
  indexofentriesArray = require(indexofentriespath)
} catch (e) {
  if (e.code == 'MODULE_NOT_FOUND') {
    saveEntriesIndex()
  } else {
    indexofentriesArray = require(indexofentriespath)
  }
}

// load json list into js array
for (var i in indexofentriesArray) {
  if (indexofentriesArray.hasOwnProperty(i) && !isNaN(+i)) {
    indexofentries[+i] = indexofentriesArray[i];
  }
}

// create save directory if it doesn't exist
fs.promises.mkdir(entriespath, {
  "recursive": true
})

// save entrie to file
function saveFile(entryfilename, data) {
  fs.promises.writeFile(entryfilename, data, {
    "recursive": true
  })
  saveEntriesIndex()
}

// creates the markdown file for an entry and adds it to the index
function createEntry(data) {
  var entrytitle = document.getElementById('entrytitle').value
  var entrydate = nowdate
  var entryarray = []
  var entryfilename = entriespath + '/' + entrydate + '-' + entrytitle + '-' + JSON.stringify(indexofentries.length) + '.md'
  entryarray = [entrydate, entrytitle, indexofentries.length, entryfilename]
  indexofentries.push(entryarray)
  currentEntry = indexofentries.length - 1
  saveFile(indexofentries[indexofentries.length - 1][3], data)
  pad.value = fs.readFileSync(entryfilename)
  listEntries()
}

function saveEntry(data, entry) {
  var file = indexofentries[entry][3]
  saveFile(file, data)
}

// loads entry from markdown file
function loadEntry() {
  var entry = document.getElementById('loadselect').value
  if (entry == '') {
    return 'failed'
  }
  var id = parseInt(entry.substring(0, entry.indexOf('-')))
  var entrypath = indexofentries[id][3]
  document.getElementById('entrytitle').value = indexofentries[id][1]
  pad.value = fs.readFileSync(entrypath)
  currentEntry = id
  document.getElementById('loadselect').value = ''
}

// list entries in entriespath
function listEntries() {
  var entries = []
  for (i = 0; i < indexofentries.length; i++) {
    entries[i] = JSON.stringify(indexofentries[i][2]) + '-' + indexofentries[i][1]
  }
  var entrieslist = []
  document.getElementById('entries').innerHTML = ''
  for (var i = 0; i < entries.length; i++) {
    entrieslist[i] = document.createElement("option")
    entrieslist[i].innerHTML = entries[i]
    document.getElementById('entries').appendChild(entrieslist[i])
  }
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
    saveEntry(markdownText, currentEntry)
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

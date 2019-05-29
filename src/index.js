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
pad.value = ''
var entryfilename

// list entries in entriespath
function listEntries() {
  var entries = fs.readdirSync(entriespath)
  var entrieslist = []
  document.getElementById('entries').innerHTML = ''
  for (var i = 0; i < entries.length; i++) {
    entrieslist[i] = document.createElement("option")
    entrieslist[i].innerHTML = entries[i]
    document.getElementById('entries').appendChild(entrieslist[i])
  }
}
listEntries()

// create save directory if it doesn't exist
fs.promises.mkdir(entriespath, {
  "recursive": true
})

function createEntry(data) {
  var entrytitle = document.getElementById('entrytitle').value
  var entrydate = document.getElementById('entrydate').value
  if (entrydate == '') {
    entryfilename = entriespath + '/' + entrytitle + '.md'
    saveFile(entryfilename, data)
  } else {
    entryfilename = entriespath + '/' + entrydate + '-' + entrytitle + '.md'
    saveFile(entryfilename, data)
  }
}

// save entrie to file
function saveFile(entryfilename, data) {
  fs.promises.writeFile(entryfilename, data, {
    "recursive": true
  })
  listEntries()
}

var previousMarkdownValue = ''

// convert text area to markdown html
function convertTextAreaToMarkdown() {
  var markdownText = pad.value
  previousMarkdownValue = markdownText
  var html = converter.makeHtml(markdownText)
  markdownArea.innerHTML = html
  createEntry(markdownText)
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

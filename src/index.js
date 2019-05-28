const {
  app
} = require('electron').remote;
var fs = require('fs')
var path = app.getPath('appData')
var filepath = path + '/js-journal.json'

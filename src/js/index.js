// general variables and functions ---->

var dt = require('./js/date.js');

const remote = require('electron').remote;
const app = remote.app;

const fs = require('fs');
var CryptoJS = require('crypto-js');

let $ = require('jquery');

var appDataPath = app.getPath('userData') + '/journal';
var passcheckPath = appDataPath + '/passcheck';

var password;
var unlocked = false;

function readFile(filepath, pass) {
	var textencrypted = fs.readFileSync(filepath, 'utf-8').toString();
	var textdecrypted = CryptoJS.AES.decrypt(textencrypted, pass);
	var textutf8 = textdecrypted.toString(CryptoJS.enc.Utf8);
	return textutf8;
}

function writeFile(filepath, content, pass) {
	var encrypteddata = CryptoJS.AES.encrypt(content, pass).toString();
	fs.writeFileSync(filepath, encrypteddata);
}

function strIsInt(str) {
	if (!isNaN(parseInt(str))) {
		return true;
	} else {
		return false;
	}
}

// end general <----

// Make sure JS Journal has access to it's userdata folder ------->

function quitNoAccess() {
	alert('JS Journal doees no have sufficiant permissions to ' + app.getPath('userData') + ' (its data folder), please make sure JS Journal can read/write here.');
	app.quit();
}

function createUserDataFolder() {
	fs.promises.mkdir(app.getPath('userData'))
		.then()
		.catch(() => quitNoAccess());
}

fs.promises.access(app.getPath('userData'), fs.constants.R_OK | fs.constants.W_OK)
	.then()
	.catch(() => createUserDataFolder());

// end permissions check <----------

// Check if user has already registered / created a journal and if not create basic dir tree and make user set password ----->

var hasregistered;

if (fs.existsSync(passcheckPath)) {
	hasregistered = true;
} else {
	hasregistered = false;
	fs.promises.access(appDataPath)
		.then()
		.catch(() => fs.mkdirSync(appDataPath));
}

function checkAndRegPass() {
	if ($('#passwdr').val() == $('#passwdv').val() && $('#passwdr').hasClass('is-invalid') == false && $('#passwdv').hasClass('is-invalid') == false) {
		password = $('#passwdr').val();
		writeFile(passcheckPath, password, password);
		location.reload();
	}
}

if (hasregistered == false) {
	$('#main').load('html/setpassword.html');
	$(document).ready(function ($) {
		$('#setpasswdbtn').click(function () {
			checkAndRegPass();
		});
		$('#passwdv').keypress(function (event) {
			if (event.which == 13) {
				$('#setpasswdbtn').click();
			}
		});
	});
}

// end registered check <--------

// login ---->

if (hasregistered == true) {
	$('#main').load('html/unlock.html');
	$(document).ready(function ($) {
		$('#passwd').focus();
		$('#unlockbtn').click(function () {
			login();
		});
		$('#passwd').keypress(function (event) {
			if (event.which == 13) {
				$('#unlockbtn').click();
			}
		});

		$('#passwd').on('input', function () {
			$('#passwd-invalid').hide();
			$('#passwd').removeClass('is-invalid');
		});
	});
}

function login() {
	password = $('#passwd').val();
	if (unlocked == false && password != undefined && readFile(passcheckPath, password) == password) {
		unlocked = true;
		journal();
	} else {
		password = '';
		$('#passwd').val('');
		$('#passwd-invalid').show();
		$('#passwd').addClass('is-invalid');
	}
}

// login end <----

var entriesfolder = appDataPath + '/entries';
var entries = [];

function journal() {
	$('#main').load('html/indexing.html');
	scanForEntries();
	indexEntries();
	$('#main').load('html/journal.html');
}

// scan for entries ---->

function scanForEntries() {
	entries = [];
	if (!fs.existsSync(entriesfolder)) {
		fs.mkdirSync(entriesfolder);
		scanForEntries();
	}
	var entriesfoldercontents = fs.readdirSync(entriesfolder, 'utf-8');
	for (var i = 0; i < entriesfoldercontents.length; i++) {
		var possibleentry = [fs.statSync(entriesfolder + '/' + entriesfoldercontents[i]), entriesfoldercontents[i]];
		if (possibleentry[0].isFile() == true && possibleentry[1].slice(-5) == '.jsje') {
			entries.push(entriesfolder + '/' + possibleentry[1]);
		}
	}
}

// end scan for entries <----

// index entries ---->

var entriesindex;

function indexEntries() {
	entriesindex = [];
	for (var i = 0; i < entries.length; i++) {
		var entry = readFile(entries[i], password);
		if (entry.length > 0) {
			var entrymeta = entry.split('---')[1].split(': ');
			var entrytitle = entrymeta[1].split('date')[0].trim();
			var entrydate = entrymeta[2].split('time')[0].trim();
			var entrytime = entrymeta[3].trim();
			entriesindex.push([entries[i], entrytitle, entrydate, entrytime]);
		}
	}
}

// end index entries <----

function createEntry(title, entrynumber) {
	var datetimearr = dt.getTodayDateTime();
	var date = datetimearr[0][0] + '-' + datetimearr[0][1] + '-' + datetimearr[0][2];
	var time = datetimearr[1][0] + ':' + datetimearr[1][1] + ':' + datetimearr[1][2];
	var entryfilecontent = `---
title: ${title}
date: ${date}
time: ${time}
---`;
	writeFile(entriesfolder + '/' + entrynumber + '.jsje', entryfilecontent, password);
	scanForEntries();
	indexEntries();
}
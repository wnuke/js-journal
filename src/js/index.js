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

async function readFile(filepath, pass) {
	let promise = new Promise((resolve) => {
		fs.promises.readFile(filepath, 'utf-8')
			.then((data) => {
				resolve(data)
			})
			.catch((err) => reject(err))
	})
	let textencrypted = await promise;
	let textdecrypted = await CryptoJS.AES.decrypt(textencrypted, pass);
	let textutf8 = await textdecrypted.toString(CryptoJS.enc.Utf8);
	return textutf8;
}

async function writeFile(filepath, content, pass) {
	var encrypteddata = CryptoJS.AES.encrypt(content, pass).toString();
	let promise = new Promise((resolve, reject) => {
		fs.promises.writeFile(filepath, encrypteddata)
			.then(() => resolve('Wrote file "' + filepath + '".'))
			.catch(() => reject('Error: could not write file "' + filepath + '".'));
	})
	let result = await promise;
	return result;
}

/*unction strIsInt(str) {
	if (!isNaN(parseInt(str))) {
		return true;
	} else {
		return false;
	}
}*/

// end general <----

// Make sure JS Journal has access to it's userdata folder ------->

async function quitNoAccess(folder) {
	alert('JS Journal could not access or create "' + folder + '", please make sure JS Journal can read/write here.');
	app.quit();
}

async function createUserDataFolder() {
	fs.promises.mkdir(app.getPath('userData'))
		.catch(() => quitNoAccess(app.getPath('userData')));
}

fs.promises.access(app.getPath('userData'), fs.constants.R_OK | fs.constants.W_OK)
	.then(() => checkFiles())
	.catch(() => createUserDataFolder());

// end permissions check <----------

// Check if user has already registered / created a journal and if not create basic dir tree and make user set password ----->

async function checkFiles() {
	fs.promises.readFile(passcheckPath)
		.then(() => unlock())
		.catch(() => setpassword());
}

fs.promises.access(appDataPath)
	.then(() => checkFiles())
	.catch(() =>
		fs.promises.mkdir(appDataPath)
			.then(() => checkFiles())
			.catch(() => createUserDataFolder())
	);


async function sha1Base64(text) {
	let bytes = await CryptoJS.enc.Utf16LE.parse(text);
	let sha1Hash = await CryptoJS.SHA1(bytes);
	let hashBase64 = await sha1Hash.toString(CryptoJS.enc.Base64);
	return hashBase64;
}

async function checkAndRegPass() {
	if ($('#passwdr').val() == $('#passwdv').val() && $('#passwdr').hasClass('is-invalid') == false && $('#passwdv').hasClass('is-invalid') == false) {
		password = $('#passwdr').val();
		await writeFile(passcheckPath, sha1Base64(password), password);
		location.reload();
	}
}

async function setpassword() {
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

async function unlock() {
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

async function login() {
	password = $('#passwd').val();
	let passcheckResult = await readFile(passcheckPath, password)
	if (unlocked == false && password != undefined && passcheckResult == await sha1Base64(password)) {
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
var entriesindex;

async function journal() {
	$('#main').load('html/indexing.html');
	let entries = await scanForEntries();
	indexEntries(entries)
	$('#main').load('html/journal.html');
}

// scan for entries ---->

async function scanForEntries() {
	let promise = new Promise((resolve) => {
		fs.access(entriesfolder, fs.constants.F_OK | fs.constants.W_OK, async (err) => {
			if (err) {
				console.error(
					`"${entriesfolder}" ${err.code === 'ENOENT' ? 'does not exist' : 'is read-only'}`);
			} else {
				console.log(`"${entriesfolder}" exists, and it is writable`);
				entries = [];
				fs.readdir(entriesfolder, 'utf-8', async (err, files) => {
					if (err) {
						console.error(err)
					} if (files) {
						let entriespromise = await new Promise(async (resolve) => {
							var entries = [];
							for (var i in files) {
								await fs.promises.stat(entriesfolder + '/' + files[i])
									.then((stats) => {
										var possibleentry = [stats, files[i]];
										if (possibleentry[0].isFile() == true && possibleentry[1].slice(-5) == '.jsje') {
											entries.push(entriesfolder + '/' + possibleentry[1]);
										}
									})
									.catch(() => quitNoAccess(entriesfolder + '/' + files[i]));
							}
							resolve(entries)
						})
						let entries = await entriespromise
						resolve(entries)
					}
				})
			}
		})
	})
	let result = await promise;
	return result;
}

// end scan for entries <----

// index entries ---->

async function indexEntries(entries) {
	entriesindex = [];
	for (var i = 0; i < entries.length; i++) {
		let entry = await readFile(entries[i], password);
		if (entry.length > 0) {
			var entrymeta = await entry.split('---')[1].split(': ');
			var entrytitle = entrymeta[1].split('date')[0].trim();
			var entrydate = entrymeta[2].split('time')[0].trim();
			var entrytime = entrymeta[3].trim();
			let meta = await Promise.all([entrytitle, entrydate, entrytime]).then(function (em) {
				return [entries[i], em[0], em[1], em[2]]
			})
			entriesindex.push(meta);
		}
	}
	console.log(entriesindex);
}


// end index entries <----

async function createEntry(title, entrynumber) {
	var datetimearr = await dt.getTodayDateTime();
	var date = datetimearr[0][0] + '-' + datetimearr[0][1] + '-' + datetimearr[0][2];
	var time = datetimearr[1][0] + ':' + datetimearr[1][1] + ':' + datetimearr[1][2];
	var entryfilecontent = `---
title: ${title}
date: ${date}
time: ${time}
---`;
	await writeFile(entriesfolder + '/' + entrynumber + '.jsje', entryfilecontent, password);
	let entries = await scanForEntries();
	indexEntries(entries)
}
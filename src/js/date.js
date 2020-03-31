var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function makeTwoDig(number) {
	if (number < 10) {
		return '0' + number;
	} else {
		return number;
	}
}

function markdownDate(date) {
	Intl.DateTimeFormat().resolvedOptions().timeZone;
	var year = date[0];
	var month = date[1];
	var day = date[2];
	var d = new Date();
	var mdd = new Date(year, month, day);
	var mddatestr = '<p style="display:none">' + year + '-' + month + '-' + day + '</p>';
	var mdyear = '<h1 style="color:#6EAAD2;line-height: 0px;">' + year + '</span><br>';
	var mddate = '<h2 style="color:#AAAAAA;line-height: 10px;">' + days[mdd.getDay()] + ' ' + day + ' ' + months[mdd.getMonth()] + '</span><br>';
	var mdtime = '<h6 style="color:#000000;line-height: 10px;">' + makeTwoDig(d.getHours()) + ':' + makeTwoDig(d.getMinutes()) + ' ' + Intl.DateTimeFormat().resolvedOptions().timeZone + '</span><br id="thisisamarker">';
	return mddatestr + mdyear + mddate + mdtime;
}

function getTodayDateTime() {
	Intl.DateTimeFormat().resolvedOptions().timeZone;
	var d = new Date();
	var nowday = JSON.stringify(makeTwoDig(d.getDate()));
	var nowmonth = makeTwoDig(d.getMonth() + 1);
	var nowyear = JSON.stringify(d.getFullYear());
	var nowhours = d.getHours();
	var nowminutes = d.getMinutes();
	var nowseconds = d.getSeconds();
	var nowtime = [nowhours, nowminutes, nowseconds];
	var nowdate = [nowyear, nowmonth, nowday];
	var nowdatetime = [nowdate, nowtime];
	return nowdatetime;
}

function getFullDate(year, month, day) {
	Intl.DateTimeFormat().resolvedOptions().timeZone;
	var d = new Date(year, month, day);
	var fday = days[d.getDay()];
	var fmonth = months[parseInt(month)];
	var fdate = fday + ' ' + day.toString() + ' ' + fmonth + ' ' + year.toString();
	return fdate;
}

exports.getTodayDateTime = getTodayDateTime;
exports.getFullDate = getFullDate;
exports.markdownDate = markdownDate;
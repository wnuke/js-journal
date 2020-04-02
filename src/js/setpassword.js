var passwdrval;
var passwdvval;

function checkPassValid() {
	if (passwdrval.length < 6) {
		$('#passwdr').removeClass('is-valid');
		$('#passwdr').addClass('is-invalid');
		$('#passwdr-invalid').show();
	} else if (passwdrval.length >= 6) {
		$('#passwdr').addClass('is-valid');
		$('#passwdr').removeClass('is-invalid');
		$('#passwdr-invalid').hide();
	}
}

function checkPassEqual() {
	if (passwdvval != passwdrval) {
		$('#passwdv').removeClass('is-valid');
		$('#passwdv').addClass('is-invalid');
		$('#passwdv-invalid').show();
	} else {
		$('#passwdv').addClass('is-valid');
		$('#passwdv').removeClass('is-invalid');
		$('#passwdv-invalid').hide();
	}
}

$(document).ready(function ($) {
	$('#passwdr').focus();
	$('#passwdr').keypress(function (event) {
		if (event.which === 13) {
			$('#passwdv').focus();
		}
	});
	$('#passwdr').on('input', function () {
		passwdrval = $('#passwdr').val();
		passwdvval = $('#passwdv').val();
		checkPassValid();
		checkPassEqual();
	});

	$('#passwdv').on('input', function () {
		passwdrval = $('#passwdr').val();
		passwdvval = $('#passwdv').val();
		checkPassValid();
		checkPassEqual();
	});
});



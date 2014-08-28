var casper = require('casper').create();
var fs = require('fs');
var utils = require('utils');

//read credentials from file and parse them as json
var data = fs.read('credentials.json');
var credentials = JSON.parse(data);

//use credentials to log in
loginToNetflix(credentials.username, credentials.password);


function loginToNetflix (username, password) {
	casper.start('https://www.netflix.com/Login?locale=en-US', function() {
		this.echo('Attempting login to Netflix - filling and submitting login form');
		
		this.fill('form#login-form', {
				'email':    username,
			 'password':    password,
		   'RememberMe': 	true
		}, true);

	});

	casper.then(function() {
		this.echo('Login Complete - Please check the cookie as defined in command line');
		//save the cookie for use by netflix scraper api
		var cookies = JSON.stringify(phantom.cookies);
		fs.write("netflix-cookies.txt", cookies, 644);
	});

	casper.run(function () {
		this.echo('Done - Exiting!');
		casper.exit();
	});
	
}


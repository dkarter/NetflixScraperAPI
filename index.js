var express = require('express');
var request = require('request');
var tough = require('tough-cookie');
var sys = require('sys');
var exec = require('child_process').exec;
var fs = require('fs');
var prompt = require('prompt');

var cookieFile = 'netflix-cookies.txt';
var credentialsFile = 'credentials.json';
var apiDomain = 'api-global.netflix.com';
var apiUrl = 'http://' + apiDomain;

var noop = function () {};

function init () {
	if (!fs.existsSync(cookieFile)) {
		
		if (!fs.existsSync(credentialsFile)) {
			writeCredentialsFile(function () {	runLoginImitator();	});
		} else {
			runLoginImitator();
		}

	} else {
		readCookieFile();
	}
}

function writeCredentialsFile (callback) {
	prompt.get(['username', 'password'], function (err, result) {
			if (err) return callback && callback(err);
			fs.writeFile('credentials.json', JSON.stringify(result), function(err){
				if (err) return callback && callback(err);
				return callback && callback(null);
			});
	});
}
function runLoginImitator () {
	//casper will imitate a login using phantomjs headless webkit
	exec('casperjs netflix-login.js', function (error) {
		if (error) throw error;
		readCookieFile();
	});
}

function readCookieFile () {
	fs.readFile(cookieFile, function(error, data){
		if (error) throw error;
		var jar = new tough.CookieJar();

		var cookies = JSON.parse(data);
		
		console.log(cookies);

		for (var i = 0; i < cookies.length; i++) {
			cookies[i].key = cookies[i].name;
			cookies[i].domain = apiDomain;
			var cookie = tough.Cookie.fromJSON(JSON.stringify(cookies[i]));
			jar.store.putCookie(cookie, noop);
		}
		
		serveAPI(jar);
	});	
}

function serveAPI (cookieJar) {
	//configure roots and serve app
	var app = express();
	app.set('port', (process.env.PORT || 5000));

	app.get('/autocomplete/:query', function (req, res) {
		var autocompleteAPI = apiUrl + '/desktop/search/autocomplete?term=';
		autocompleteAPI += req.params.query;
		request({
			url: autocompleteAPI,
			headers: {
				'Cookie': cookieJar.getCookieStringSync(apiUrl, {secure: false})
			}
		
		}, function (error, response, json) {
			if (error) 
				res.send(error);
			else
				res.json(json);
		});

	});

	app.listen(app.get('port'), function() {
  		console.log("Netflix Scraper is running at localhost:" + app.get('port') + "/autocomplete");
	});

	exports = module.exports = app;	
}

init();

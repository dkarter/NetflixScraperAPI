var express = require('express');
var request = require('request');
var tough = require('tough-cookie');
var sys = require('sys');
var exec = require('child_process').exec;
var fs = require('fs');

var cookieFile = 'netflix-cookies.txt';
var noop = function () {};
var apiDomain = 'api-global.netflix.com';
var apiUrl = 'http://' + apiDomain;

//TODO: add refresh flag to commandline - check it here and erase existing cookie
if (!fs.existsSync(cookieFile)) {
	var netflixLogin = exec('casperjs netflix-login.js', function (error, stdout, stderr) {
		if (error) throw error;
		readCookieFile();
	});
} else {
	readCookieFile();
}

function readCookieFile () {
	fs.readFile(cookieFile, function(error, data){
		if (error) throw error;
		var jar = new tough.CookieJar();

		var cookies = JSON.parse(data);
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


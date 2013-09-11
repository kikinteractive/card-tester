var request = require('request');

exports.testCard = testCard;
exports._crossOrigin = '*';

function testCard(url, callback) {
	
	var childProcess = require('child_process'),
		output       = '',
		phantomjs    = childProcess.spawn('phantomjs', ['--web-security=false', '--disk-cache=false', 'card_tests.js', url]);

	phantomjs.stdout.on('data', function(data) {
		output += data;
	});

	phantomjs.stdout.on('end', function(data) {

		if (output) {

			var cleaned = output.replace("#######CARDTESTER#######", "");
			
			if ( cleaned.length && cleaned != "__FAILEDTOLOAD__" ) {
				try {
				
					var parsedData = JSON.parse(cleaned),
						fetchingTerms = false,
						fetchingPrivacy = false;			

					if ( parsedData.link.terms ) {

						fetchingTerms = true;

						fetchLink(parsedData.link.terms, function(status){

							parsedData.link.termsStatus = status;
							fetchingTerms = false;

							if ( !fetchingTerms && !fetchingPrivacy ) {
								callback(parsedData);
							}
						});
					}

					if ( parsedData.link.privacy ) {

						fetchingPrivacy = true;

						fetchLink(parsedData.link.privacy, function(status){

							parsedData.link.privacyStatus = status;
							fetchingPrivacy = false;

							if ( !fetchingTerms && !fetchingPrivacy ) {
								callback(parsedData);
							}
						});
					}

					if ( !parsedData.link.terms && !parsedData.link.privacy ) {
						callback(parsedData);
					}

				} catch(err) {
					console.log("Error parsing json: " + err);
					callback();
				}
			} else {
				callback();
			}
		} else {
			callback();
		}
	});

	phantomjs.on('exit', function (code) {
		console.log('Child process exited with exit code ' + code + ' for card url: ' + url);
	});

	function fetchLink(url, callback) {
		request(url, function (error, response, body) {
			callback(response.statusCode);
		});
	}
}

exports.testCardAPI = testCardAPI;
exports.testCardAPI.type = 'get';
exports._crossOrigin = '*';

function testCardAPI(params, callback) {
	
	var childProcess = require('child_process'),
		output       = '',
		url          = decodeURIComponent(params.url),
		phantomjs    = childProcess.spawn('phantomjs', ['--web-security=false', '--disk-cache=false', 'card_tests.js', url]);

	phantomjs.stdout.on('data', function(data) {
		output += data;
	});

	phantomjs.stdout.on('end', function(data) {

		if (output) {

			var cleaned = output.replace("#######CARDTESTER#######", "");
			
			if ( cleaned.length && cleaned != "__FAILEDTOLOAD__" ) {
				try {
				
					var parsedData = JSON.parse(cleaned),
						fetchingTerms = false,
						fetchingPrivacy = false;			

					if ( parsedData.link.terms ) {

						fetchingTerms = true;

						fetchLink(parsedData.link.terms, function(status){

							parsedData.link.termsStatus = status;
							fetchingTerms = false;

							if ( !fetchingTerms && !fetchingPrivacy ) {
								callback(200, {
									'Content-Type'  : 'application/json' ,
									'Cache-Control' : 'no-cache'
								}, JSON.stringify(parsedData));
							}
						});
					}

					if ( parsedData.link.privacy ) {

						fetchingPrivacy = true;

						fetchLink(parsedData.link.privacy, function(status){

							parsedData.link.privacyStatus = status;
							fetchingPrivacy = false;

							if ( !fetchingTerms && !fetchingPrivacy ) {
								callback(200, {
									'Content-Type'  : 'application/json' ,
									'Cache-Control' : 'no-cache'
								}, JSON.stringify(parsedData));
							}
						});
					}

					if ( !parsedData.link.terms && !parsedData.link.privacy ) {
						callback(200, {
							'Content-Type'  : 'application/json' ,
							'Cache-Control' : 'no-cache'
						}, JSON.stringify(parsedData));
					}

				} catch(err) {
					console.log("Error parsing json: " + err);
					callback(200, {
						'Content-Type'  : 'application/json' ,
						'Cache-Control' : 'no-cache'
					}, '{}');
				}
			} else {
				callback(200, {
					'Content-Type'  : 'application/json' ,
					'Cache-Control' : 'no-cache'
				}, '{}');
			}
		} else {
			callback(200, {
				'Content-Type'  : 'application/json' ,
				'Cache-Control' : 'no-cache'
			}, '{}');
		}
	});

	phantomjs.on('exit', function (code) {
		console.log('Child process exited with exit code ' + code + ' for card url: ' + url);
	});

	function fetchLink(url, callback) {
		request(url, function (error, response, body) {
			callback(response.statusCode);
		});
	}
}

function runTests(url, callback) {

}
var request = require('request');

exports.testCard = testCard;
exports._crossOrigin = '*';
exports.testCardAPI = testCardAPI;
exports.testCardAPI.type = 'get';
exports._crossOrigin = '*';

function testCard(url, callback) {
	runTests(url, callback);
}

function testCardAPI(params, callback) {

	var url = decodeURIComponent(params.url);

	runTests(url, function(retVal){

		if ( !retVal ) {
			retVal = "{}";
		} else {
			retVal = JSON.stringify(retVal);
		}

		callback(200, {
			'Content-Type'  : 'application/json' ,
			'Cache-Control' : 'no-cache'
		}, retVal);
	});
}

function runTests(url, callback) {
	var childProcess = require('child_process'),
		output       = '',
		phantomjs    = childProcess.spawn('phantomjs', ['--web-security=false', '--ignore-ssl-errors=yes', '--ssl-protocol=any', '--disk-cache=false', 'card_tests.js', url]);

	phantomjs.stdout.on('data', function(data) {
		output += data;
	});

	phantomjs.stdout.on('end', function(data) {
		if (output) {
			try {
				var parsedData = JSON.parse( output.replace('#######CARDTESTER#######', '') ),
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
				// console.log(output);
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

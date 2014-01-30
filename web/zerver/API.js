var request = require('request'),
	tester  = require('cards-tester');

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

	runTests(url, function (retVal) {

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
	tester.run(url, function (data) {
		var fetchingTerms = false,
			fetchingPrivacy = false;

		if ( !data ) {
			callback();
			return;
		}

		if ( !data.link.terms && !data.link.privacy ) {
			callback(data);
			return;
		}

		if ( data.link.terms ) {
			fetchingTerms = true;
			fetchLink(data.link.terms, function(status){
				data.link.termsStatus = status;
				fetchingTerms = false;
				if ( !fetchingTerms && !fetchingPrivacy ) {
					callback(data);
				}
			});
		}
		if ( data.link.privacy ) {
			fetchingPrivacy = true;
			fetchLink(data.link.privacy, function(status){
				data.link.privacyStatus = status;
				fetchingPrivacy = false;
				if ( !fetchingTerms && !fetchingPrivacy ) {
					callback(data);
				}
			});
		}
	});
}

function fetchLink(url, callback) {
	request(url, function (error, response, body) {
		callback(response ? response.statusCode : 0);
	});
}

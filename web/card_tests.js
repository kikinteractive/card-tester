var	system     = require('system'),
	cardTester = require('./card_verification');

if (system.args.length === 1) {
	console.log('Usage: card_tests.js <some URL>');
	phantom.exit(1);
} else {
	url = system.args[1];

	cardTester.runTests(url, function(data){
		cardTester.runTests(url, function(data){
			console.log(data);
			phantom.exit(0);
		});
	});
}
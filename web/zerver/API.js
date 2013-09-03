
var phantom = require('node-phantom');

exports.testCard = testCard;
exports._crossOrigin = '*';

function testCard(url, callback) {

	var childProcess = require('child_process'),
		ls, output;

	ls = childProcess.exec('phantomjs card_verification.js ' + url, function (error, stdout, stderr) {
		if (error) {
			console.log(error.stack);
			console.log('Error code: '+error.code);
			console.log('Signal received: '+error.signal);
		}

		//console.log('Child Process STDOUT: '+stdout);
		//console.log('Child Process STDERR: '+stderr);

		output = stdout;

		console.log("output.length: " + output.length);
		
		if (output) {

			var cleaned = output.replace("#######CARDTESTER#######", "");

			console.log("cleaned: " + cleaned.substr(0, 2000));
			
			try {
				var d = JSON.parse(cleaned);
				callback(d);
			} catch(err) {
				console.log("Error parsing json: " + err);
				callback();
			}

		} else {
			callback();
		}
	});

	ls.on('exit', function (code) {
		console.log('Child process exited with exit code '+code+'for card url: ' + url);
	});
}
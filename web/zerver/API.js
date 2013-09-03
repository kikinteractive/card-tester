
exports.testCard = testCard;
exports._crossOrigin = '*';

function testCard(url, callback) {
	
	var childProcess = require('child_process'),
		output       = '',
    	phantomjs    = childProcess.spawn('phantomjs', ['card_verification.js', url]);

    phantomjs.stdout.on('data', function(data) {
    	output += data;
    });

    phantomjs.stdout.on('end', function(data) {
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

	phantomjs.on('exit', function (code) {
		console.log('Child process exited with exit code '+code+'for card url: ' + url);
	});
}
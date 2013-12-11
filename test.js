exports.run = function (url, callback) {
	var childProcess = require('child_process'),
		output       = '',
		phantomjs    = childProcess.spawn('phantomjs', ['--web-security=false', '--ignore-ssl-errors=yes', '--ssl-protocol=any', '--disk-cache=false', __dirname+'/testPage.js', url]);

	phantomjs.stdout.on('data', function(data) {
		output += data;
	});

	phantomjs.stdout.on('end', function(data) {
		if (output) {
			var parsedData;
			try {
				parsedData = JSON.parse( output.replace('#######CARDTESTER#######', '') );
			} catch(err) {}
			callback(parsedData);
		} else {
			callback();
		}
	});
}


var phantom = require('node-phantom');

exports.testCard = testCard2;
exports._crossOrigin = '*';


function testCard(url, callback) {

	phantom.create(function(err,ph) {

		//console.log("ph: " + JSON.stringify(ph));

		for (var a in ph._phantom ) {
			console.log(a);
		}

		//ph.settings.userAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 5_0 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9A334 Safari/7534.48.3";
		//ph.viewportSize = { width: 320, height : 548 };

		return ph.createPage(function(err,page) {

			//console.log("page: " + JSON.stringify(page));
			//console.log("page: " + JSON.stringify(err));
			
			page.resources = [];

			return page.open(url, function(err,status) {

				//console.log("opened site? ", status);
				//console.log("page: " + JSON.stringify(page));

				page.render('temp/example.png');

				var cardReport = {
					more: {
						includeInMore: false
					},
					load: {
						//time: loadTime
					}
				};

				// var resources = [];
				// var size = 0;

				// page.resources.forEach(function (resource) {
				// 	if ( !resource.request.url.match(/(^data:image\/.*)/i) ) {
				// 		resources.push(resource.request.url);
						
				// 		if ( resource.startReply ) {
				// 			console.log(JSON.stringify(resource.startReply));
				// 			size += resource.startReply.bodySize;
				// 		}
				// 	}
				// });				

				// cardReport.load.resources = resources;
				// cardReport.load.requestCount = resources.length;
				// cardReport.load.cardSize = size;

				// cardReport.more.title = page.evaluate(function(cardReport) {
				// 	return document.title;
				// });

				page.evaluate(function(s){
					return document.querySelector(s).innerText;
				},function(err,title){
					cardReport.more.title = title;
				},'title');

				page.evaluate(function (cardReport) {

					var metaTags = document.head.childNodes;

					for (var i = 0; i < metaTags.length; i++) {
						var tag = metaTags[i];

						if ( tag.tagName == "META" || tag.tagName == "LINK" ) {

							if ((tag.rel === "kik-icon") && (tag.href || '').trim()) {
								cardReport.more.icon = tag.href;
							}

							if ((tag.name === "description") && (tag.content || '').trim()) {
								cardReport.more.description = tag.content;
							}

							if ((tag.name === "kik-more") && (tag.content || '').trim()) {
								cardReport.more.includeInMore = true;
								cardReport.more.hostname = tag.content;
							}

							if ((tag.name === "kik-unsupported") && (tag.content || '').trim()) {
								cardReport.unsupported = tag.content;
							}
						}
					}

					// console.log("-----------------");
					// console.log(JSON.stringify(cardReport));
					// console.log("-----------------");

					return cardReport;

				}, function(err, data){
					cardReport = data;
				}, cardReport);

				callback(cardReport);

				// page.includeJs('http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js', function(err) {
				// 	//jQuery Loaded.
				// 	//Wait for a bit for AJAX content to load on the page. Here, we are waiting 5 seconds.

				// 	callback({pageOpened: true});

				// 	setTimeout(function() {
				// 		return page.evaluate(function() {
				// 			//Get what you want from the page using jQuery. A good way is to populate an object with all the jQuery commands that you need and then return the object.
				// 			var h2Arr = [],
				// 			pArr = [];

				// 			$('h2').each(function() {
				// 				h2Arr.push($(this).html());
				// 			});

				// 			$('p').each(function() {
				// 				pArr.push($(this).html());
				// 			});

				// 			return {
				// 				h2: h2Arr,
				// 				p: pArr
				// 			};
				// 		}, function(err,result) {
				// 			console.log(result);

				// 			ph.exit();
				// 		});
				// 	}, 5000);
				// });

			});
		});
	});
}

function testCard2(url, callback) {

	var childProcess = require('child_process'),
		id = new Buffer(url).toString('base64'),
		ls, output;

	id = id.replace(/=/g, "");

	if ( id.length > 30 ) {
		id = id.substr(0, 30);
	}

	//ls = childProcess.exec('phantomjs card_verification.js ' + url + ' ' + id + ' > ./tmp/' + id + '.txt', function (error, stdout, stderr) {
	ls = childProcess.exec('phantomjs card_verification.js ' + url + ' ' + id, function (error, stdout, stderr) {
		if (error) {
			console.log(error.stack);
			console.log('Error code: '+error.code);
			console.log('Signal received: '+error.signal);
		}

		console.log('Child Process STDOUT: '+stdout);
		console.log('Child Process STDERR: '+stderr);

		output = stdout;
	});

	ls.on('exit', function (code) {
		
		console.log('Child process exited with exit code '+code);
		
		// var fs = require('fs');
		// var text = fs.readFileSync('./tmp/' + id + '.txt','utf8');

		// if ( text ) {
		// 	var d = JSON.parse(text);
		// 	//d.screenshot = "/screens/" + id + ".png";
		// 	//d.screenshot2 = "/screens/" + id + "2.png";
		// 	callback(d);
		// } else {
		// 	callback();
		// }

		if (output) {
			var d = JSON.parse(output);
			callback(d);
		} else {
			callback();
		}
	});
}
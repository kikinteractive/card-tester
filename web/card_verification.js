var fs     = require('fs'),
	page   = require('webpage').create(),
	system = require('system');

var url = "http://cards-image-search-dev.herokuapp.com",
	t   = Date.now(),
	tt  = Date.now(),
	logFilter = "#######CARDTESTER#######";

if (system.args.length === 1) {
    console.log('Usage: card_verification.js <some URL>');
    phantom.exit(1);
} else {
	url = system.args[1];
}

page.settings.localToRemoteUrlAccessEnabled = true;
page.settings.webSecurityEnabled = false;
page.settings.appCache = false;
page.settings.userAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 5_0 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9A334 Safari/7534.48.3";

page.webSecurityEnabled = false;
page.appCache = false;

page.viewportSize = { width: 320, height : 548 };
page.resources = [];

page.onConsoleMessage = function (msg) {
	if ( msg.indexOf(logFilter) === 0 ) {
    	console.log(msg.replace(logFilter, ""));
	}
};

function printArgs() {
    var i, ilen;
    for (i = 0, ilen = arguments.length; i < ilen; ++i) {
        //console.log("    arguments[" + i + "] = " + JSON.stringify(arguments[i]));
    }
}

page.onInitialized = function() {
    //console.log("page.onInitialized");
    printArgs.apply(this, arguments);

	page.evaluate(function(domContentLoadedMsg) {
		document.addEventListener('DOMContentLoaded', function() {
			window.callPhantom('DOMContentLoaded');
		}, false);
	});

	page.evaluate(function(domContentLoadedMsg) {
		document.addEventListener('load', function() {
			window.callPhantom('load');
		}, false);
	});
};

page.onCallback = function(data) {
	tt = Date.now() - tt;
	//console.log('DOMContentLoaded' + data);
	//console.log('Loading time ' + tt + ' msec');
};

page.onLoadStarted = function() {
    //console.log("page.onLoadStarted");
    printArgs.apply(this, arguments);
    page.startTime = new Date();
};

page.onLoadFinished = function() {
    //console.log("page.onLoadFinished");
    printArgs.apply(this, arguments);
};

page.onResourceRequested = function (req) {
	page.resources[req.id] = {
		request: req,
		startReply: null,
		endReply: null
	};
};

page.onResourceReceived = function (res) {
	if (res.stage === 'start') {
		page.resources[res.id].startReply = res;
	}
	if (res.stage === 'end') {
		page.resources[res.id].endReply = res;
	}
};

page.onLoadFinished = function (page, config, status) {
	//console.log(logFilter + "page.onLoadFinished");
};

page.open(url, function (status) {

	var loadTime;

	if (status !== 'success') {
        //console.log('FAIL to load the address');
    } else {
        //console.log('Page.open Loading time ' + loadTime + ' msec');
        loadTime = Date.now() - t;
    }

	var cardReport = {
		more: {
			includeInMore: false
		},
		load: {
			time: loadTime
		},
		link: {
		}
	};
	
    cardReport.screenshot = generateDataURL(page.renderBase64());

	var resources = [];
	var size = 0;

	page.resources.forEach(function (resource) {
		if ( !resource.request.url.match(/(^data:image\/.*)/i) ) {
			resources.push(resource.request.url);
			
			if ( resource.startReply ) {
				//console.log(JSON.stringify(resource.startReply));
				size += resource.startReply.bodySize;
			}
		}
	});

	cardReport.load.resources = resources;
	cardReport.load.requestCount = resources.length;
	cardReport.load.cardSize = size;

	cardReport.more.title = page.evaluate(function(cardReport) {
		return document.title;
	});

	cardReport = page.evaluate(function (cardReport, logFilter) {

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

				if ((tag.rel === "privacy") && (tag.href || '').trim()) {
					cardReport.link.privacy = tag.href;
				}

				if ((tag.rel === "terms") && (tag.href || '').trim()) {
					cardReport.link.terms = tag.href;
				}
			}
		}

		return cardReport;

	}, cardReport, logFilter);
	
	var start = new Date().getTime();

	worstHackEver(2000);

	setTimeout(function(){
		
		cardReport.screenshot2 = generateDataURL(page.renderBase64());
		
		worstHackEver(2000);

		console.log(logFilter + JSON.stringify(cardReport));

		phantom.exit();

	}, 4250);

	function worstHackEver(time) {
		while ( (new Date().getTime()) - start < time ) {
			start = start;
		}
	}

	function generateDataURL(data) {
		return "data:image/png;base64," + data;
	}
});
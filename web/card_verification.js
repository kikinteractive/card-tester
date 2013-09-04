var fs     = require('fs'),
	page   = require('webpage').create(),
	system = require('system');

var beginTime = Date.now(),
	logFilter = "#######CARDTESTER#######",
	domLoaded = false,
	url, domLoadTime, fullLoadTime;

if (system.args.length === 1) {
    console.log('Usage: card_verification.js <some URL>');
    phantom.exit(1);
} else {
	url = system.args[1];
}

page.settings.localToRemoteUrlAccessEnabled = true;
page.settings.webSecurityEnabled = false;
page.settings.clearMemoryCaches = true;
page.settings.appCache = false;
page.settings.userAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 5_0 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9A334 Safari/7534.48.3";

page.resources = [];
page.appCache = false;
page.webSecurityEnabled = false;
page.viewportSize = { width: 320, height : 548 };

page.onConsoleMessage = function (msg) {
	if ( msg.indexOf(logFilter) === 0 ) {
    	console.log(msg.replace(logFilter, ""));
	}
};

page.onInitialized = function() {
    //console.log("page.onInitialized");
    printArgs.apply(this, arguments);

	page.evaluate(function(domContentLoadedMsg) {
		document.addEventListener('DOMContentLoaded', function() {
			window.callPhantom('DOMContentLoaded');
		}, false);
	});

	page.evaluate(function(domContentLoadedMsg) {
		window.addEventListener('load', function() {
			window.callPhantom('load');
		}, false);
	});
};

page.onCallback = function(data) {

	var newDiff = Date.now() - beginTime;

	if ( data === "DOMContentLoaded" ) {
		domLoadTime = newDiff;
		domLoaded = true;
	} else if ( data === "load" ) {
		fullLoadTime = newDiff;
	}

	//console.log(data + ' time ' + newDiff + ' msec');
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

	page.resources[req.id].domLoaded = domLoaded;
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
		// page.injectJs("inject1.js");
		// page.injectJs("inject2.js");
    } else {
        //console.log('Page.open Loading time ' + loadTime + ' msec');
        loadTime = Date.now() - beginTime;
    }

	var cardReport = {
		more: {
			includeInMore: false
		},
		load: {
			time: loadTime,
			domLoad: domLoadTime,
			fullLoad: fullLoadTime
		},
		link: {
		}
	};
	
    cardReport.screenshot = generateDataURL(page.renderBase64());

	cardReport.more.title = page.evaluate(function() {
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

	cardReport.load.manifest = page.evaluate(function(){
		return document.querySelectorAll('html')[0].getAttribute("manifest");
	});

	var resources = [];
	var size = 0;
	var fullSize = 0;

	page.resources.forEach(function (resource) {

		if ( !resource.request.url.match(/(^data:image\/.*)/i) && !resource.request.url.match(/(^http:\/\/cardsbridge.kik.com\/.*)/i) && isFirstFetch(resource.request.url) ) {

			resources.push(resource);

			if ( resource.startReply ) {
				if ( !resource.domLoaded ) {
					size += resource.startReply.bodySize;
					fullSize += resource.startReply.bodySize;
				} else {
					fullSize += resource.startReply.bodySize;
				}
			}
		}

		function isFirstFetch(url) {
			resources.forEach(function(r){
				if( r.request.url == url ) {
					return false;
				}
			});

			return true;
		}
	});

	cardReport.load.resources = resources;
	cardReport.load.requestCount = resources.length;
	cardReport.load.cardSize = size;
	cardReport.load.fullSize = fullSize;

	var start = new Date().getTime();

	worstHackEver(3000);

	//setTimeout(function(){
		
		cardReport.screenshot2 = generateDataURL(page.renderBase64());
		
		worstHackEver(1000);

		console.log(logFilter + JSON.stringify(cardReport));

		phantom.exit();

	//}, 4250);

	function worstHackEver(time) {
		while ( (new Date().getTime()) - start < time ) {
			start = start;
		}
	}

	function generateDataURL(data) {
		return "data:image/png;base64," + data;
	}
});

function printArgs() {
    var i, ilen;
    for (i = 0, ilen = arguments.length; i < ilen; ++i) {
        //console.log("    arguments[" + i + "] = " + JSON.stringify(arguments[i]));
    }
}
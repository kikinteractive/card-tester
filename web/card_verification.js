exports.runTests = function(url, callback) {

	var fs     = require('fs'),
		page   = require('webpage').create();

	var beginTime   = Date.now(),
		logFilter   = "#######CARDTESTER#######",
		domLoaded   = false,
		domLoadTime, fullLoadTime;

	var SWEAR_WORDS = /\sasshole\s|\sbitch\s|\scunt\s|\sdamn\s|\sdick\s|\sdyke\s|\sfaggot\s|\sfuck\s|\sfuckass\s|\snigger\s|\spenis\s|\spussy\s|\sshit\s|\ssex\s|\sspic\s|\sshit\s|\svagina\s|\swhore\s/gi;

	page.settings.localToRemoteUrlAccessEnabled = true;
	page.settings.webSecurityEnabled = false;
	page.settings.clearMemoryCaches = true;
	page.settings.appCache = false;
	page.settings.userAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 5_0 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9A334 Safari/7534.48.3";
	page.settings.userAgent = "Mozilla/5.0 (Linux; U; Android 4.0.2; en-us; Galaxy Nexus Build/ICL53F) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30";

	page.resources = [];
	page.appCache = false;
	page.webSecurityEnabled = false;
	page.viewportSize = { width: 320, height : 548 };

	page.onConsoleMessage = function (msg) {
		if ( msg.indexOf(logFilter) === 0 ) {
	    	console.log(msg.replace(logFilter, ""));
		}
	};

	page.onError = function(msg) {
		return false;
	};

	page.onInitialized = function() {

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
	    page.startTime = new Date();
	    //console.log(logFilter + "page.onLoadStarted");
	};

	page.onLoadFinished = function (page, config, status) {
		//console.log(logFilter + "page.onLoadFinished");
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

	page.open(url, function (status) {

		var loadTime;

		if (status !== 'success') {
			console.log(logFilter + "__FAILEDTOLOAD__");
	    } else {
	        loadTime = Date.now() - beginTime;
	    }

		var cardReport = {
			more: {
				includeInMore: false,
				tagLocations: {}
			},
			load: {
				time: loadTime,
				domLoad: domLoadTime,
				fullLoad: fullLoadTime
			},
			link: {
			},
			layout: {
			}
		};
		
	    cardReport.screenshot = generateDataURL(page.renderBase64());

		cardReport.more.title = page.evaluate(function() {
			return document.title;
		});

		cardReport.more.title_clean = !SWEAR_WORDS.test(cardReport.more.title);

		cardReport.more.canon = page.evaluate(function() {
			var canon = location.href.replace("http://", "").replace(location.search, "");

			if ( location.pathname != "/" ) {
				canon = canon.replace(location.pathname, "");
			} else if ( location.pathname === "/" ) {
				canon = canon.substr(0, canon.length-1);
			}

			return {
				pathname: location.pathname,
				url: location.href,
				search: location.search,
				canon: canon
			};
		});

		cardReport = page.evaluate(function (cardReport, logFilter, SWEAR_WORDS) {

			var metaTags = document.querySelectorAll("meta");

			for (var i = 0; i < metaTags.length; i++) {
				
				var tag = metaTags[i];

				if ((tag.name === "description") && (tag.content || '').trim()) {
					cardReport.more.description = tag.content;
					cardReport.more.description_clean = !SWEAR_WORDS.test(cardReport.more.description);
					cardReport.more.tagLocations["description"] = (tag.parentNode === document.head);
				}

				if ((tag.name === "kik-more") && (tag.content || '').trim()) {
					cardReport.more.includeInMore = true;
					cardReport.more.hostname = tag.content;
					cardReport.more.tagLocations["kik-more"] = (tag.parentNode === document.head);
				}

				if ((tag.name === "kik-unsupported") && (tag.content || '').trim()) {
					cardReport.unsupported = tag.content;
					cardReport.more.tagLocations["kik-unsupported"] = (tag.parentNode === document.head);
				}
			}

			var linkTags = document.querySelectorAll("link");

			for (var j = 0; j < linkTags.length; j++) {
				var tag = linkTags[j];

				if ((tag.rel === "kik-icon") && (tag.href || '').trim()) {
					cardReport.more.icon = tag.href;
					cardReport.more.tagLocations["kik-icon"] = (tag.parentNode === document.head);
				}

				if ((tag.rel === "privacy") && (tag.href || '').trim()) {
					cardReport.link.privacy = tag.href;
					cardReport.more.tagLocations["privacy"] = (tag.parentNode === document.head);
				}

				if ((tag.rel === "terms") && (tag.href || '').trim()) {
					cardReport.link.terms = tag.href;
					cardReport.more.tagLocations["terms"] = (tag.parentNode === document.head);
				}
			}

			return cardReport;

		}, cardReport, logFilter, SWEAR_WORDS);

		cardReport.load.manifest = page.evaluate(function(){
			return document.querySelectorAll('html')[0].getAttribute("manifest");
		});

		cardReport.more.pg13 = page.evaluate(function(SWEAR_WORDS){
			return !SWEAR_WORDS.test(document.querySelector("html").textContent);
		}, SWEAR_WORDS);

		cardReport.layout.topbar_android = page.evaluate(function(){
			var topBar = document.querySelectorAll('.app-topbar');

			if ( topBar.length ) {
				return topBar[0].clientHeight;
			}

			return null;
		});

		cardReport.layout.topbar_ios = page.evaluate(function(){

			var height = null,
				topBar = document.querySelectorAll('.app-topbar'),
				bodyClassList = document.querySelector("body").classList;

			bodyClassList.remove("app-android");
			bodyClassList.add("app-ios");

			if ( topBar.length ) {
				height = topBar[0].clientHeight;
			}

			bodyClassList.add("app-android");
			bodyClassList.remove("app-ios");

			return height;
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

		worstHackEver(2000);

		setTimeout(function(){
			
			cardReport.screenshot2 = generateDataURL(page.renderBase64());
			
			worstHackEver(1200);

			//console.log(logFilter + JSON.stringify(cardReport));

			callback(JSON.stringify(cardReport));

			//phantom.exit();

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
};
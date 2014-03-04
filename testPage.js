var fs      = require('fs'),
	webpage = require('webpage'),
	system  = require('system');

var IOS_5       = 'Mozilla/5.0 (iPhone; CPU iPhone OS 5_0 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9A334 Safari/7534.48.3',
	ANDROID_4_2 = 'Mozilla/5.0 (Linux; U; Android 4.2; en-us; Nexus 4 Build/JOP24G) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30',
	SWEAR_WORDS = /\sasshole\s|\sbitch\s|\scunt\s|\sdamn\s|\sdick\s|\sdyke\s|\sfaggot\s|\sfuck\s|\sfuckass\s|\snigger\s|\spenis\s|\spussy\s|\sshit\s|\ssex\s|\sspic\s|\sshit\s|\svagina\s|\swhore\s/gi;

runTest( system.args[1] );



function runTest(url) {
	if ( !url ) {
		console.log('Usage: card_tests.js <some URL>');
		phantom.exit(1);
		return;
	}

	preparePage(url, function (page) {
		preparePage(url, function (page) {
			if (page) {
				generateReport(page, function (report) {
					console.log( JSON.stringify(report) );
					setTimeout(function () {
						phantom.exit(0);
					}, 1000);
				});
			} else {
				phantom.exit(1);
			}
		});
	});
}

function preparePage(url, callback) {
	var page         = webpage.create(),
		beginTime    = Date.now(),
		logFilter    = '#######CARDTESTER#######',
		domLoaded    = false,
		windowLoaded = false,
		onWindowLoad;

	page.settings.localToRemoteUrlAccessEnabled = true;
	page.settings.webSecurityEnabled = false;
	page.settings.clearMemoryCaches = true;
	page.settings.appCache = false;
	page.settings.userAgent = ANDROID_4_2;

	page.errors = {};
	page.hasCardsJS = false;
	page.resources = [];
	page.appCache = false;
	page.webSecurityEnabled = false;
	page.viewportSize = { width: 320, height : 548 };

	page.onConsoleMessage = function (msg) {
		if (msg.indexOf(logFilter) === 0) {
			console.log(msg.replace(logFilter, ''));
		}
	};

	page.onError = function (msg) {
		return false;
	};

	function setupLoadEvents() {
		(function () {
			sendCardsJS();
			document.addEventListener('DOMContentLoaded', function() {
				window.callPhantom('DOMContentLoaded');
				sendCardsJS();
			}, false);
			if (document.readyState === 'complete') {
				sendEvents();
			} else {
				window.addEventListener('load', function() {
					sendEvents();
				}, false);
			}
			function sendEvents() {
				window.callPhantom('loadTime');
				sendCardsJS();
				setTimeout(function () {
					sendCardsJS();
					window.callPhantom('load');
				}, 1500);
			}
			function sendCardsJS() {
				try {
					if (typeof window.cards._.id === 'string') {
						window.callPhantom('hasCardsJS');
					}
				} catch (err) {}
			}
		})();
	}

	page.onInitialized = function () {
		page.evaluate(setupLoadEvents);
	};

	page.onNavigationRequested = function (url, type, willNavigate, main) {
		if ( !main ) {
			return;
		}
		if (page.navigationLocked && !windowLoaded) {
			page.evaluate(setupLoadEvents);
		}
		page.navigationLocked = true;
	};

	page.onCallback = function (data) {
		var newDiff = Date.now() - beginTime;

		if (data === 'DOMContentLoaded') {
			if ( !page.domLoadTime ) {
				page.domLoadTime = newDiff;
				domLoaded = true;
			}
		} else if (data === 'loadTime') {
			if ( !page.fullLoadTime ) {
				page.fullLoadTime = newDiff;
			}
		} else if (data === 'load') {
			if ( !windowLoaded ) {
				windowLoaded = true;
				if (onWindowLoad) {
					onWindowLoad();
					onWindowLoad = null;
				}
			}
		} else if (data === 'hasCardsJS') {
			if ( !page.hasCardsJS ) {
				page.hasCardsJS = true;
			}
		}
	};

	page.onResourceRequested = function (req) {
		var isRoot    = (page.url === 'about:blank' || req.url === page.url),
			isCardURL = (req.url.substr(0, 4) === 'card');
		if (isCardURL) {
			return;
		}
		page.resources[req.id] = {
			request: req,
			startReply: null,
			endReply: null,
			domLoaded: (isRoot || domLoaded)
		};
	};

	page.onResourceReceived = function (res) {
		if ( !page.resources[res.id] ) {
			return;
		}
		if (res.stage === 'start') {
			page.resources[res.id].startReply = res;
		}
		if (res.stage === 'end') {
			page.resources[res.id].endReply = res;
		}
	};

	page.onResourceError = function (err) {
		page.errors[err.url] = err.errorString;
	};

	page.open(url, function (status) {
		if (status !== 'success') {
			console.log(logFilter + '__FAILEDTOLOAD__');
			console.log(logFilter + JSON.stringify(page.errors));
			callback();
		} else {
			if (windowLoaded) {
				callback(page);
			} else {
				onWindowLoad = function () {
					callback(page);
				};
				setTimeout(function () {
					if (onWindowLoad) {
						onWindowLoad();
						onWindowLoad = null;
					}
				}, 10*1000);
			}
		}
	});
}

function generateReport(page, callback) {
	var cardReport = {
		hasCardsJS: !!page.hasCardsJS,
		more: {
			includeInMore: false,
			tagInHead: {}
		},
		load: {
			domLoad: page.domLoadTime,
			fullLoad: page.fullLoadTime
		},
		link: {},
		layout: {}
	};

	cardReport.screenshot = generateDataURL(page);

	cardReport.more.title = page.evaluate(function () {
		return document.title;
	});

	cardReport.more.title_clean = !SWEAR_WORDS.test(cardReport.more.title);

	cardReport.more.canon = page.evaluate(function () {
		return {
			pathname: location.pathname,
			url: location.href,
			search: location.search,
			canon: location.host
		};
	});

	cardReport = page.evaluate(function (cardReport, SWEAR_WORDS) {
		Array.prototype.forEach.call(
			document.querySelectorAll('meta'),
			function (tag) {
				var content = (tag.content || '').trim(),
					inHead  = (tag.parentNode === document.head);
				if ( !content ) {
					return;
				}
				switch (tag.name) {
					case 'description':
						cardReport.more.description = content;
						cardReport.more.description_clean = !SWEAR_WORDS.test(cardReport.more.description);
						cardReport.more.tagInHead['description'] = inHead;
						break;
					case 'kik-more':
						cardReport.more.includeInMore = true;
						cardReport.more.hostname = content;
						cardReport.more.tagInHead['kik-more'] = inHead;
						break;
					case 'kik-unsupported':
						cardReport.unsupported = content;
						cardReport.more.tagInHead['kik-unsupported'] = inHead;
						break;
				}
			}
		);

		Array.prototype.forEach.call(
			document.querySelectorAll('link'),
			function (tag) {
				var href   = (tag.href || '').trim(),
					inHead = (tag.parentNode === document.head);
				if ( !href ) {
					return;
				}
				switch (tag.rel) {
					case 'kik-icon':
						cardReport.more.icon = href;
						cardReport.more.tagInHead['kik-icon'] = inHead;
						break;
					case 'privacy':
						cardReport.link.privacy = href;
						cardReport.more.tagInHead['privacy'] = inHead;
						break;
					case 'terms':
						cardReport.link.terms = href;
						cardReport.more.tagInHead['terms'] = inHead;
						break;
				}
			}
		);

		return cardReport;
	}, cardReport, SWEAR_WORDS);

	cardReport.load.manifest = page.evaluate(function () {
		return document.querySelectorAll('html')[0].getAttribute('manifest');
	});

	cardReport.more.pg13 = page.evaluate(function (SWEAR_WORDS) {
		return !SWEAR_WORDS.test(document.querySelector('html').textContent);
	}, SWEAR_WORDS);

	cardReport.layout.topbar_android = page.evaluate(function () {
		var topBar = document.querySelector('.app-topbar');
		if (topBar) {
			return topBar.clientHeight;
		} else {
			return null;
		}
	});

	cardReport.layout.topbar_ios = page.evaluate(function () {
		var height = null,
			topBar = document.querySelector('.app-topbar'),
			body   = document.querySelector('body');

		body.classList.remove('app-android');
		body.classList.add('app-ios');

		if (topBar) {
			height = topBar.clientHeight;
		}

		body.classList.add('app-android');
		body.classList.remove('app-ios');

		return height;
	});

	var resources = [],
		size      = 0,
		fullSize  = 0;

	page.resources.forEach(function (resource) {
		if ( !resource.request.url.match(/(^data:image\/.*)/i) && !resource.request.url.match(/(^https?:\/\/cardsbridge.kik.com\/.*)/i) && isFirstFetch(resource.request.url) ) {
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
			resources.forEach(function (r) {
				if (r.request.url == url) {
					return false;
				}
			});
			return true;
		}
	});

	cardReport.load.resources    = resources;
	cardReport.load.requestCount = resources.length;
	cardReport.load.cardSize     = size;
	cardReport.load.fullSize     = fullSize;

	setTimeout(function(){
		cardReport.screenshot2 = generateDataURL(page);
		callback(cardReport);
	}, 3000);
}

function generateDataURL(page) {
	return 'data:image/png;base64,' + page.renderBase64();
}

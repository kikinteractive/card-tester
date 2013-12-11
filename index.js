#!/usr/bin/env node

var url = process.argv[2];
if (typeof url !== 'string' || !url.length) {
	console.error('usage: cards-tester <url>');
	process.exit(1);
}
require('./test').run(url, function (data) {
	if (data) {
		printResults(data);
	} else {
		console.error('failed to complete tests');
	}
});

function printResults(data) {
	var success = true;

	if ( !data.more.title ) {
		success = false;
		console.error('DOCUMENT TITLE');
		console.error('missing, check out http://cards.kik.com/docs/basic/#metadata');
		console.error('');
	} else if ( !data.more.title_clean ) {
		success = false;
		console.error('DOCUMENT TITLE');
		console.error('doesn\'t appear to be pg13');
		console.error('');
	}

	if ( !data.more.description ) {
		success = false;
		console.error('DOCUMENT DESCRIPTION');
		console.error('missing, check out http://moz.com/learn/seo/meta-description');
		console.error('');
	} else if ( !data.more.description_clean ) {
		success = false;
		console.error('DOCUMENT DESCRIPTION');
		console.error('doesn\'t appear to be PG13');
		console.error('');
	}

	if ( !data.more.pg13 ) {
		success = false;
		console.error('DOCUMENT BODY');
		console.error('doesn\'t appear to be PG13');
		console.error('');
	}

	if ( !data.more.icon ) {
		success = false;
		console.error('KIK ICON');
		console.error('missing, check out http://cards.kik.com/docs/basic/#metadata');
		console.error('');
	}

	if (data.load.cardSize > 5*1024*1024) {
		success = false;
		console.error('PAGE SIZE');
		console.error((data.load.cardSize/1024)+'mb, must be less than 5mb');
		console.error('');
	}

	if (data.load.fullLoad > 700) {
		success = false;
		console.error('LOAD TIME');
		console.error(data.load.fullLoad+'ms, must be less than 700ms');
		console.error('');
	}

	if ( !data.load.manifest ) {
		success = false;
		console.error('CACHE MANIFEST');
		console.error('missing, check out http://www.html5rocks.com/en/tutorials/appcache/beginner/');
		console.error('');
	}

	data.load.resources.forEach(function (resource) {
		var isCard     = resource.request.url.indexOf('card://') === 0,
			isCards    = resource.request.url.indexOf('cards://') === 0,
			isManifest = resource.request.url.indexOf(data.load.manifest) !== -1;
		if (!isCard && !isCards && !isManifest && !resource.domLoaded) {
			success = false;
			console.error('BLOCKING DOM LOAD');
			console.error(resource.request.url);
			console.error('');
		}
	});

	if (success) {
		console.log('all tests pass');
	}
}

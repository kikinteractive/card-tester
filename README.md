The Card Tester
===========

An online service that runs many of our QA checklist tests. It cab be used for cards that would like to be included in the more card.


###Heroku Setup

The service is avilible at [cards-tester.herokuapp.com](http://cards-tester.herokuapp.com).

The tester uses phantomjs running on heroku. It requires the builtpack-multi buildback to be configured on the heroku application. Details can be found here [heroku-buildpack-multi](https://github.com/ddollar/heroku-buildpack-multi)


###Results

The results are servered as a JSON object. An example of the Youtube Card output is below:

```js
{
    "data": [
        {
            "layout": {
                "topbar_android": 48,
                "topbar_ios": 44
            },
            "link": {},
            "load": {
                "domLoad": 33,
                "fullLoad": 34,
                "time": 35,
                "manifest": "/cache.manifest",
                "resources": [
                    {
                        "request": {
                            "headers": [
                                {
                                    "name": "User-Agent",
                                    "value": "Mozilla/5.0 (Linux; U; Android 4.0.2; en-us; Galaxy Nexus Build/ICL53F) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30"
                                },
                                {
                                    "name": "Cache-Control",
                                    "value": "max-age=0"
                                },
                                {
                                    "name": "If-None-Match",
                                    "value": "\"e54ca1c4c30811a141fcf45b1a3b029c\""
                                },
                                {
                                    "name": "Accept",
                                    "value": "*/*"
                                }
                            ],
                            "id": 1,
                            "method": "GET",
                            "time": "2013-09-10T19:45:55.465Z",
                            "url": "http://youtube.kik.com/cache.manifest"
                        },
                        "startReply": null,
                        "endReply": {
                            "contentType": "text/cache-manifest",
                            "headers": [
                                {
                                    "name": "Cache-Control",
                                    "value": "private, max-age=0"
                                },
                                {
                                    "name": "Content-Encoding",
                                    "value": "gzip"
                                },
                                {
                                    "name": "Content-Type",
                                    "value": "text/cache-manifest"
                                },
                                {
                                    "name": "Date",
                                    "value": "Tue, 10 Sep 2013 19:45:55 GMT"
                                },
                                {
                                    "name": "Etag",
                                    "value": "\"e54ca1c4c30811a141fcf45b1a3b029c\""
                                },
                                {
                                    "name": "Vary",
                                    "value": "Accept-Encoding"
                                },
                                {
                                    "name": "Connection",
                                    "value": "keep-alive"
                                }
                            ],
                            "id": 1,
                            "redirectURL": null,
                            "stage": "end",
                            "status": 304,
                            "statusText": "Not Modified",
                            "time": "2013-09-10T19:45:55.499Z",
                            "url": "http://youtube.kik.com/cache.manifest"
                        },
                        "domLoaded": false
                    }
                ],
                "requestCount": 1,
                "cardSize": 0,
                "fullSize": 0
            },
            "more": {
                "canon": {
                    "canon": "youtube.kik.com",
                    "pathname": "/",
                    "search": "",
                    "url": "http://youtube.kik.com/"
                },
                "description": "Watch YouTube videos and share them with your friends.",
                "description_clean": true,
                "hostname": "youtube.kik.com",
                "icon": "http://youtube.kik.com/img/icon.png?v=3",
                "includeInMore": true,
                "tagInHead": {
                    "description": true,
                    "kik-icon": true,
                    "kik-more": true
                },
                "title": "YouTube Videos",
                "title_clean": true,
                "pg13": true
            },
            "screenshot": "dataURL",
            "screenshot2": "dataURL"
        }
    ]
}
```
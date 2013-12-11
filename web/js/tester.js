(function(){
		$("form").submit(function(d){

		var data = $("#cardurl").val();

		$(".alert").remove();

		if ( data.indexOf("http") != 0 ) {

			showFormError("URL must start with http or https");
			return false;
		}

		localStorage["lastURL"] = data;

		$("#submitbtn").addClass("disabled").text("Testing...");

		API.testCard(data, function(data){

			$("#submitbtn").removeClass("disabled").text("Run Tests");

			if ( !data ) {
				showFormError("Something went wrong :( Please try again.");
				return;
			}

			$(".testresults").removeClass("hidden");
			$(".moretests, .loadtests, .requests").find("tbody").html("");
			$(".screenshot").remove();

			var count = 0;

			if ( data.more && data.more.title ) {
				if ( data.more.tagInHead['kik-more'] === false ) {
					getTableRow(".moretests", ++count, "Sidebar Title", data.more.title + "<br><br> (Not in document HEAD)", -1);
				} else {
					getTableRow(".moretests", ++count, "Sidebar Title", data.more.title, true);
				}

				if ( data.more.title_clean ) {
					getTableRow(".moretests", ++count, "Sidebar Title PG13", data.more.title + " appears to be PG13", true);
				} else {
					getTableRow(".moretests", ++count, "Sidebar Title PG13", data.more.title + " doesn't look to be PG13", -1);
				}
			} else {
				getTableRow(".moretests", ++count, "Sidebar Title", "", false);
			}

			if ( data.more && data.more.icon ) {
				if ( data.more.tagInHead['kik-icon'] === false ) {
					getTableRow(".moretests", ++count, "Sidebar Icon", "<img style='width: 80px; height: 50px' src='" + data.more.icon + "' />" + "<br><br> (Not in document HEAD)", -1);
				} else {
					getTableRow(".moretests", ++count, "Sidebar Icon", "<img style='width: 80px; height: 50px' src='" + data.more.icon + "' />", true);
				}
			} else {
				getTableRow(".moretests", ++count, "Sidebar Icon", "N/A", false);
			}

			if ( data.more && data.more.description ) {
				if ( data.more.tagInHead['description'] === false ) {
					getTableRow(".moretests", ++count, "More Description", data.more.description + "<br><br> (Not in document HEAD)", -1);
				} else {
					getTableRow(".moretests", ++count, "More Description", data.more.description, true);
				}

				if ( data.more.description_clean ) {
					getTableRow(".moretests", ++count, "More Description PG13", data.more.description + " appears to be PG13", true);
				} else {
					getTableRow(".moretests", ++count, "More Description PG13", data.more.description + " doesn't look to be PG13", -1);
				}
			} else {
				getTableRow(".moretests", ++count, "More Description", "No description found", false);
			}

			if ( data.more && data.more.pg13 ) {
				getTableRow(".moretests", ++count, "PG13 Text", "All text looks to be PG13", true);
			} else {
				getTableRow(".moretests", ++count, "PG13 Text", "All text doesn't to be PG13", false);
			}

			if ( data.unsupported ) {
				if ( data.more.tagInHead['kik-unsupported'] === false ) {
					getTableRow(".moretests", ++count, "Unsupported OS", data.unsupported + "<br><br> (Not in document HEAD)", -1);
				} else {
					getTableRow(".moretests", ++count, "Unsupported OS", data.unsupported, true);
				}
			} else {
				getTableRow(".moretests", ++count, "Unsupported OS", "N/A", true);
			}

			if ( data.link && data.link.terms ) {

				if ( data.link.termsStatus !== 200 ) {
					getTableRow(".moretests", ++count, "T&C provided but couldn't be loaded.", "<a href='" + data.link.terms + "'>" + data.link.terms + "</a>", false);
				} else {
					if ( data.more.tagInHead['terms'] === false ) {
						getTableRow(".moretests", ++count, "T&C Provided", "<a href='" + data.link.terms + "'>" + data.link.terms + "</a>" + "<br><br> (Not in document HEAD)", -1);
					} else {
						getTableRow(".moretests", ++count, "T&C Provided", "<a href='" + data.link.terms + "'>" + data.link.terms + "</a>", true);
					}
				}
			} else {
				getTableRow(".moretests", ++count, "T&C Provided", "Not Provided", true);
			}

			if ( data.link && data.link.privacy ) {

				if ( data.link.privacyStatus !== 200 ) {
					getTableRow(".moretests", ++count, "Privacy Policy provided but couldn't be loaded.", "<a href='" + data.link.privacy + "'>" + data.link.privacy + "</a>", false);
				} else {
					if ( data.more.tagInHead['privacy'] === false ) {
						getTableRow(".moretests", ++count, "Privacy Policy Provided", "<a href='" + data.link.privacy + "'>" + data.link.privacy + "</a>" + "<br><br> (Not in document HEAD)", -1);
					} else {
						getTableRow(".moretests", ++count, "Privacy Policy Provided", "<a href='" + data.link.privacy + "'>" + data.link.privacy + "</a>", true);
					}
				}
			} else {
				getTableRow(".moretests", ++count, "Privacy Policy Provided", "Not Provided", true);
			}

			if ( data.layout && (data.layout.topbar_android == 48) ) {
				getTableRow(".moretests", ++count, "Topbar Height - Android", "Topbar is " + data.layout.topbar_android + "px", true);
			} else {
				getTableRow(".moretests", ++count, "Topbar Height - Android", "Couldn't get height", -1);
			}

			if ( data.layout && (data.layout.topbar_ios == 44) ) {
				getTableRow(".moretests", ++count, "Topbar Height - iOS", "Topbar is " + data.layout.topbar_ios + "px", true);
			} else {
				getTableRow(".moretests", ++count, "Topbar Height - iOS", "Couldn't get height", -1);
			}

			count = 0;

			if ( data.load ) {
				getTableRow(".loadtests", ++count, "Cache Manifest", data.load.manifest ? data.load.manifest : "No manifest found", data.load.manifest ? true : false);
			}

			if ( data.load ) {

				var requestCount = 0;

				data.load.resources.forEach(function(resource){

					if ( resource.request.url.indexOf("card://") >= 0 || resource.request.url.indexOf("cards://") >= 0 || resource.request.url.indexOf(data.load.manifest) >= 0 ) {
						return;
					}

					if ( resource.domLoaded === false ) {
						requestCount++;
					}
				});

				var blocksLoad = (requestCount > 0 ? false : true);

				getTableRow(".loadtests", ++count, "Blocks DOM Load", requestCount > 0 ? requestCount + " extra requests" : "Not blocking DOM Load", blocksLoad);
			}

			if ( data.load && data.load.domLoad ) {
				getTableRow(".loadtests", ++count, "DOMContentLoaded", data.load.domLoad + " ms", (data.load.domLoad < 1250 ? true : false));
			}

			if ( data.load && data.load.fullLoad ) {
				getTableRow(".loadtests", ++count, "Full Load Time", data.load.fullLoad + " ms", (data.load.fullLoad < 1250 ? true : false));
			}

			if ( data.load && data.load.requestCount ) {
				getTableRow(".loadtests", ++count, "# of Requests", data.load.requestCount, (data.load.requestCount < 50 ? true : false));
			}

			if ( data.load ) {
				getTableRow(".loadtests", ++count, "Card Size - Before DOMLoad", (data.load.cardSize/1000) + " kb", (data.load.cardSize < 350000 ? true : false));
			}

			if ( data.load ) {
				getTableRow(".loadtests", ++count, "Card Size - All Requests", (data.load.fullSize/1000) + " kb", (data.load.fullSize < 500000 ? true : false));
			}

			if ( data.screenshot ) {
				$(".screenshotcontainer1").append("<img class='screenshot img-thumbnail' src='" + data.screenshot + "' />");
				$(".screenshotcontainer2").append("<img class='screenshot img-thumbnail' src='" + data.screenshot2 + "' />");
			}

			count = 0;

			if ( data.load && data.load.resources ) {

				data.load.resources.forEach(function(resource){

					if ( resource.request.url.indexOf("card://") >= 0 || resource.request.url.indexOf("cards://") >= 0 ) {
						return;
					}

					if ( resource.startReply && resource.startReply.bodySize ) {
						$(".requests").find("tbody").append(getRequestRow(++count, resource.request.url, ((resource.startReply.bodySize)/1000) + "kb", resource.domLoaded, data.load.manifest));
					} else {
						$(".requests").find("tbody").append(getRequestRow(++count, resource.request.url, "", resource.domLoaded, data.load.manifest));
					}
				});
			}
		}).error(function(){
			$("#submitbtn").removeClass("disabled").text("Run Tests");

			if ( !data ) {
				showFormError("Something went wrong :( Please try again.");
				return;
			}
		});

		return false;
	});

	function getTableRow(elemid, id, testname, value, success) {

		var html = [];

		if ( success === true ) {
			html.push("<tr class='success'>");
		} else {
			if ( success === -1 ) {
				html.push("<tr class='warning'>");
			} else {
				html.push("<tr class='danger'>");
			}
		}

		html.push("<td>");
		html.push(id);
		html.push("</td>");

		html.push("<td>");
		html.push(testname);
		html.push("</td>");

		html.push("<td>");

		if ( value != 0 ) {
			html.push(value);
		} else {
			html.push("N/A");
		}

		html.push("</td>");
		html.push("<td>");
		if ( success === -1 ) {
			html.push("Warn");
		} else {
			html.push( success===true ? "Yes" : "No" );
		}
		html.push("</td>");
		html.push("</tr>");

		$(elemid).find("tbody").append(html.join(""));
	}

	function getRequestRow(id, testname, value, success, manifest) {

		var html = [];

		if ( manifest.length && testname.indexOf(manifest) > -1 ) {
			html.push("<tr class='active'>");
		} else {
			if ( success ) {
				html.push("<tr class='success'>");
			} else {
				html.push("<tr class='danger'>");
			}
		}

		html.push("<td>");
		html.push(id);
		html.push("</td>");

		html.push("<td>");
		html.push(testname);
		html.push("</td>");

		html.push("<td>");

		if ( value != 0 ) {
			html.push(value);
		} else {
			html.push("N/A");
		}

		html.push("</td>");

		html.push("<td>");
		html.push(success);
		html.push("</td>");

		html.push("</tr>");

		return html.join("");
	}

	function showFormError(message) {
		var elem = alertTemplate.clone();
		elem.find('span').text(message);
		$(".alertwrap").append(elem);
	}

	window.alertTemplate = $(".alert").remove().removeClass("hidden");

	if ( localStorage["lastURL"] ) {
		$("#cardurl").val(localStorage["lastURL"]);
	}
})();

var dr = function() {
	chrome.storage.local.get(["matches_v1", "characters_v1"], function(results) {
		console.log("-\ndebugging records...");

		//match records:
		if (results.hasOwnProperty("matches_v1")) {
			console.log("-\nmatch records found\nnumber of match records: " + results.matches_v1.length + "-\n");
			for (var i = 0; i < results.matches_v1.length; i++) {
				var match = results.matches_v1[i];
				console.log("match results: " + match.c1 + " vs " + match.c2 + " ... winner: " + match.w);
			}

		}
		//character records:
		if (results.hasOwnProperty("characters_v1")) {
			console.log("-\ncharacter records found\nnumber of character records: " + results.characters_v1.length + "-\n");
			for (var i = 0; i < results.characters_v1.length; i++) {
				var character = results.characters_v1[i];
				console.log(character.name + "\t\t\t\twins: " + character.wins.length + ",\t\t\t\tlosses: " + character.losses.length);
			}
		}

	});
};

var pr = function() {
	chrome.storage.local.get(["matches_v1", "characters_v1"], function(results) {
		console.log("-\npurifying records...");
		var potentialDuplicates = [];
		if (results.hasOwnProperty("matches_v1") && results.hasOwnProperty("characters_v1")) {
			var correctReverseOdds = true;
			if (correctReverseOdds) {
				for (var i = 0; i < results.matches_v1.length; i++) {
					var odds = results.matches_v1[i].o;
					if (odds != "U") {
						var oddsArr = odds.split(":");
						results.matches_v1[i].o = oddsArr[1] + ":" + oddsArr[0];
					}
				}
				chrome.storage.local.set({
					'matches_v1' : results.matches_v1
				}, function() {
					console.log("-\nrecords purified (correctReverseOdds)");
				});
			}

			var removeTeamMatches = false;
			if (removeTeamMatches) {
				var goodMatches = [];

				for (var i = 0; i < results.matches_v1.length; i++) {
					var match = results.matches_v1[i];
					if (match.c1.toLowerCase().indexOf("team") == -1 && match.c2.toLowerCase().indexOf("team") == -1) {
						goodMatches.push(match);
					}
				}
				chrome.storage.local.set({
					'matches_v1' : goodMatches
				}, function() {
					console.log("-\nrecords purified (checkForFalseAnalysis)");
				});
			}

			var checkForDuplicates = false;
			if (checkForDuplicates) {
				console.log("-\ndetecting potential duplicate matches");
				var goodMatches = [];

				for (var i = 0; i < results.matches_v1.length; i++) {
					var match = results.matches_v1[i];
					var isPotentialDuplicate = 0;
					for (var j = 0; j < results.matches_v1.length; j++) {
						var matchd = results.matches_v1[j];
						if (match.c1 == matchd.c1 && match.c2 == matchd.c2) {
							isPotentialDuplicate += 1;
						}
					}
					if (isPotentialDuplicate == 2) {
						var duplicateAlreadydetected = false;
						for (var k = 0; k < potentialDuplicates.length; k++) {
							var matchd = potentialDuplicates[k];

							if (match.c1 == matchd.c1 && match.c2 == matchd.c2) {
								duplicateAlreadydetected = true;
							}

						}
						if (!duplicateAlreadydetected) {
							potentialDuplicates.push(match);
							console.log("potential duplicate match: " + match.c1 + " vs " + match.c2 + " ... winner: " + match.w);
						} else {
							goodMatches.push(match);
						}
					} else {
						goodMatches.push(match);
					}

				}
				//remove all duplicates, then rebuild character records from match records

				chrome.storage.local.set({
					'matches_v1' : goodMatches//,
					// 'characters_v1' : characters_v1
				}, function() {
					console.log("-\nrecords purified");
				});

			}

			//examine character records:
			var examineCharacterRecords = false;
			if (examineCharacterRecords) {
				var characters = results.characters_v1;
				for (var ii = 0; ii < potentialDuplicates.length; ii++) {
					// check wins of characters involved
					var pdmatch = potentialDuplicates[ii];
					var c1Object = null;
					var c2Object = null;
					for (var j = 0; j < characters.length; j++) {
						if (characters[j].name == pdmatch.c1) {
							c1Object = characters[j];
						}
						if (characters[j].name == pdmatch.c2) {
							c2Object = characters[j];
						}
					}
					// now get total wins and losses of involved characters
					var c1totalWins = 0;
					var c1totalLosses = 0;
					var c2totalWins = 0;
					var c2totalLosses = 0;
					console.log("-\ninvestigating match: " + pdmatch.c1 + " vs " + pdmatch.c2 + " ... winner: " + pdmatch.w);
					console.log("-\nprocessing...");
					for (var k = 0; k < results.matches_v1.length; k++) {
						var match = results.matches_v1[k];

						if (match.w == 0) {
							c1totalWins += 1;
							c2totalLosses += 1;
							console.log("-\n in match" + k + ": " + match.c1 + " vs " + match.c2 + " ... winner: " + match.w);
						}
						if (match.w == 1) {
							c2totalWins += 1;
							c1totalLosses += 1;
							console.log("-\n in match" + k + ": " + match.c1 + " vs " + match.c2 + " ... winner: " + match.w);
						}

					}
					console.log("-\nprocessing complete");
					console.log("mr: " + pdmatch.c1 + " has " + c1totalWins + " wins, " + c1totalLosses + " losses; cr: " + c1Object.wins + " wins, " + c1Object.losses + " losses");
					console.log("mr: " + pdmatch.c2 + " has " + c2totalWins + " wins, " + c2totalLosses + " losses; cr: " + c2Object.wins + " wins, " + c2Object.losses + " losses");
				}
			}
		}

	});
};

var er = function() {
	chrome.storage.local.get(["matches_v1", "characters_v1"], function(results) {
		var lines = [];
		for (var i = 0; i < results.matches_v1.length; i++) {
			var match = results.matches_v1[i];

			var record = match.c1 + "," + match.c2 + "," + match.w + "," + match.sn + "," + match.pw + ",";
			record += (match.hasOwnProperty("t")) ? match.t : "U";
			record += ",";
			record += (match.hasOwnProperty("m")) ? match.m : "U";
			record += ",";
			record += (match.hasOwnProperty("o")) ? match.o : "U";
			record += ",";
			record += (match.hasOwnProperty("ts")) ? match.ts : 0;
			record += "\n";
			lines.push(record);
		}

		var time = new Date();
		var blob = new Blob(lines, {
			type : "text/plain;charset=utf-8"
		});
		saveAs(blob, "saltyRecords--" + time.getFullYear() + "-" + time.getMonth() + "-" + time.getDate() + "-" + time.getHours() + "." + time.getMinutes() + ".txt");
	});
};

var ir = function(f) {
	var matchRecords = [];
	var characterRecords = [];
	var namesOfCharactersWhoAlreadyHaveRecords = [];
	var getCharacter = function(cname) {
		var cobject = null;
		if (namesOfCharactersWhoAlreadyHaveRecords.indexOf(cname) == -1) {
			cobject = {
				"name" : cname,
				"wins" : [],
				"losses" : [],
				"winTimes" : [],
				"lossTimes" : [],
				"odds" : []
			};
			characterRecords.push(cobject);
			namesOfCharactersWhoAlreadyHaveRecords.push(cname);
		} else {
			for (var k = 0; k < characterRecords.length; k++) {
				if (cname == characterRecords[k].name) {
					cobject = characterRecords[k];
				}
			}
		}
		return cobject;
	};
	//numberOfProperties refers to c1, c2, w, sn, etc.
	var numberOfProperties = 9;

	var lines = f.split("\n");
	for (var i = 0; i < lines.length; i++) {
		var match = lines[i].split(",");
		var c1 = null;
		var c2 = null;
		var w = null;
		var sn = null;
		var pw = null;
		var t = null;
		var m = null;
		var o = null;
		var ts = null;
		for (var j = 0; j < match.length; j++) {
			switch(j % numberOfProperties) {
			case 0:
				c1 = match[j];
				break;
			case 1:
				c2 = match[j];
				break;
			case 2:
				w = parseInt(match[j]);
				break;
			case 3:
				sn = match[j];
				break;
			case 4:
				pw = match[j];
				break;
			case 5:
				t = match[j];
				break;
			case 6:
				m = match[j];
				break;
			case 7:
				o = match[j];
				break;
			case 8:
				ts = parseInt(match[j]);
				var mObj = {
					"c1" : c1,
					"c2" : c2,
					"w" : w,
					"sn" : sn,
					"pw" : pw,
					"t" : t,
					"m" : m,
					"o" : o,
					"ts" : ts
				};
				matchRecords.push(mObj);

				var c1Obj = getCharacter(c1);
				var c2Obj = getCharacter(c2);
				if (mObj.w == 0) {
					c1Obj.wins.push(mObj.t);
					c2Obj.losses.push(mObj.t);
					if (mObj.time != 0) {
						c1Obj.winTimes.push(mObj.time);
						c2Obj.lossTimes.push(mObj.time);
					}
				} else if (mObj.w == 1) {
					c2Obj.wins.push(mObj.t);
					c1Obj.losses.push(mObj.t);
					if (mObj.time != 0) {
						c2Obj.push(mObj.time);
						c1Obj.lossTimes.push(mObj.time);
					}
				}
				if (mObj.odds != null && mObj.odds != "U") {
					var oc1 = parseFloat(mObj.odds.split(":")[0]);
					var oc2 = parseFloat(mObj.odds.split(":")[1]);
					c1Obj.odds.push((oc1 / oc2).toFixed(2));
					c2Obj.odds.push((oc2 / oc1).toFixed(2));
				}

				break;
			}
		}
	}
	var nmr = matchRecords.length;
	var ncr = characterRecords.length;
	//All records have been rebuilt, so update them
	chrome.storage.local.set({
		'matches_v1' : matchRecords,
		'characters_v1' : characterRecords
	}, function() {
		console.log("-\nrecords imported:\n" + nmr + " match records\n" + ncr + " character records");
	});
};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	switch(request.type) {
	case "dr":
		dr();
		break;
	case "pr":
		pr();
		break;
	case "er":
		er();
		break;
	case "ir":
		ir(request.text);
		break;
	}
});


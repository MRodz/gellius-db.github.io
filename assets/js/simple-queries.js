/**
 * @file Simple Queries
 * @author Michelle Rodzis (www.github.com/MRodz)
 * @version 1.0
 */

/**
 * Loads a JSON object from the Wikidata Query service.
 * Which JSON is retrieved depends on the key which is passed by the page that calls this function.
 * @param {string} key - The key which determines, what JSON is loaded from Wikidata. Possible values: keywords, persons, places, commentarii, quotes.
 */
function loadJSON(key) {
  var queryURL;
  var queryHeader = "https://query.wikidata.org/sparql?query=SELECT%20DISTINCT%20%3FitemLabel%20%3Fitem%20WHERE%20%7B%0A%3FNoctes_Atticae%20wdt%3AP361*%20wd%3AQ660519.%0A%3FNoctes_Atticae%20";
  var queryTail = "%20%3Fitem.%20%0A%20%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22en%22%20%7D%0A%7D%0AORDER%20BY%20ASC(UCASE(str(%3FitemLabel)))&format=json";

  queryURL = buildQuery(key, queryHeader, queryTail);
  if (key == 'commentarii') {
      getJSON(key, queryURL, 'commentarii');
  } else {
      getJSON(key, queryURL, 'results');
  }
};

/**
 * Displays all available keywords, persons, or places (depending on which key is passed to this function) by pushing the results into a container element.
 * @param {Object} json - The JSON object that stores the query results.
 * @param {string} key - The key that has to be passed to getCommentarii() to determine which commentarii fit a selected keyword, person, place, or cited work.
 */
function displayResults(json, key) {
  var object = json.response;
  var result = object.results.bindings;
  var container = "<div/>";
  for (var iii in result) {
    if (result.hasOwnProperty(iii)) {
      var www = result[iii].item.value;
      var uri = String(www.match(/Q\d+/g));
      var button = "<button onclick=\x27getCommentarii(\x22" + uri + "\x22, \x22" + key + "\x22)\x27>";
      var value = result[iii].itemLabel.value;
        button += value + "</button>";
        container += button;
        document.getElementById("keywords").innerHTML = container;
    }
  }
};

/**
 * Displays all commentarii that are (a) available or (b) that fit a selected keyword, person, place, or cited work by pushing the results into a container element.
 * Note: (a) will be deprecated as soon as all commentarii have an item in Wikidata.
 * @param {Object} json - The JSON object with all commentarii that satisfy the query made in getCommentarii().
 */
function displayCommentarii(json) {
  var object = json.response;
  var result = object.results.bindings;
  var container = "<div/>";
  for (var iii in result) {
    if (result.hasOwnProperty(iii)) {
      var div = "<div>";
      var value = result[iii].itemLabel.value;
        div += value + "</button>";
        container += div;
        document.getElementById("commentarii").innerHTML = container;
    }
  }
}

/**
 * Sends a query to determine all commentarii that fit a selected keyword, person, place, or cited work.
 * @param {string} uri - The Wikidata uri of a selected keyword, person, or place.
*  @param {string} key - The key that determines which Wikidata property is selected in buildQuery().
 */
function getCommentarii(uri, key) {
  var queryURL;
  var queryHeader = "https://query.wikidata.org/sparql?query=SELECT%20%3FitemLabel%20WHERE%20%7B%0A%20%20%3Fitem%20wdt%3AP31%20wd%3AQ1980247.%0A%20%20%3Fitem%20wdt%3AP361*%20wd%3AQ660519.%0A%20%20%3Fitem%20";
  var queryTail = "%20wd%3A" + uri + ".%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22en%22.%20%7D%0A%7D&format=json";

  queryURL = buildQuery(key, queryHeader, queryTail);
  getJSON(key, queryURL, 'commentarii');
};

/**
 * Makes an HTTP request to Wikidata in order to retrieve a JSON object and calls a function that displays the result.
 * @param {string} key - The key which is passed to displayResults().
 * @param {string} queryURL - The URL to which the HTTP request is made.
 * @param {string} display - The key that determines which display funtion is called.
 */
function getJSON(key, queryURL, display) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200 &&
    display == 'results') {
      displayResults(this, key);
    } else if (this.readyState == 4 && this.status == 200 &&
    display == 'commentarii') {
      displayCommentarii(this);
    }
  };

  xmlhttp.open("GET", queryURL, true);
  xmlhttp.responseType = "json";
  xmlhttp.send();
};

/**
 * Builds the URL to which an HTTP request is send based on a key.
 * @param {string} key - The key that determines which Wikidata property is selected.
 * @param {string} queryHeader - The first part of the URL before the Wikidata property is selected.
 * @param {string} queryTail - The second part of the URL after the Wikidata property is selected.
 * @returns {string} The complete query URL.
 */
function buildQuery(key, queryHeader, queryTail) {
  if (key == 'keywords') {
    //wdt:P921: main subject
    queryURL = queryHeader + "wdt%3AP921" + queryTail;
  } else if (key == 'persons') {
    // wdt:P3342: significant person
    queryURL = queryHeader + "wdt%3AP3342" + queryTail;
  } else if (key == 'places') {
    // wdt:P840: narrative location
    queryURL = queryHeader + "wdt%3AP840" + queryTail;
  } else if (key == 'quotes') {
    queryURL = queryHeader + "wdt%3AP2860" + queryTail;
  } else if (key == 'commentarii') {
    queryURL = "https://query.wikidata.org/sparql?query=SELECT%20%3FitemLabel%20WHERE%20%7B%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22%5BAUTO_LANGUAGE%5D%2Cen%22.%20%7D%0A%20%20%3Fitem%20wdt%3AP361*%20wd%3AQ660519.%0A%20%20%3Fitem%20wdt%3AP31%20wd%3AQ1980247.%0A%7D&format=json";
  }
  return queryURL;
}

/**
 * HummingBird search module
 * returns the title description and some stats
 *
 * Written By: Paras D. Pain
 * Date Written: 10/02/2016
 */

var request = require.safe('request');

/*
* Paths
*/
var HUMMINGBIRD_HOST = "hummingbird.me/api/v1";
var HUMMINGBIRD_SEARCH = "/search/anime/";

exports.match = function(text, commandPrefix) {
    return text.startsWith(commandPrefix + 'humming');
};

/*
	Method that provides help strings for use with this module.
*/
exports.help = function(commandPrefix) {
    return [[commandPrefix + 'humming <query>','Searches Anime or Manga when you are too lazy to make a few clicks']];
};

/*
	The main entry point of the module. This will be called by Kassy whenever the match function
	above returns true.
*/
exports.run = function(api, event) {
        var query = event.body.substr(8);
        
        search(query, function(error, response){
            // Callback calls the parser if no errors were registered
            if(!error){
                api.sendMessage(parse(response), event.thread_id);
            } else{
                console.debug(error);
            }
        });
};

function parse(query){
    // testing
    console.debug(JSON.stringify(query, ['url', 'title', 'episode_count', 'synopsis', 'show_type', 'genres'], '\t'));
    return JSON.stringify(query, ['url', 'title', 'episode_count', 'synopsis', 'show_type', 'genres'], '\t');
    // return 'parser reached';
}

/**
 * Retrieves information about an anime as a JSON object.
 *
 * query:       string to search
 * callback:    takes the error, and data
 */
function search(query, callback) {
    request.get({
        url: "https://" + HUMMINGBIRD_HOST + 
             HUMMINGBIRD_SEARCH + "?query=" + query,
        headers: {
                 "Content-Type": "application/x-www-form-urlencoded"
             }
    }, function(err, res, body) {
        
        if(err) {
            if(res) {
                callback("Request error: " + err + ", " + res.statusCode, body);
            }
            else {
                callback("Connection error: not connected to internet", body);
            }
        }
        else {
            callback(null, body);
        }
    });
}

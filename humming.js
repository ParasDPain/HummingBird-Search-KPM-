/**
 * HummingBird search module
 * returns the title description and some stats
 *
 * Written By: Paras D. Pain
 * Date Written: 10/02/2016
 * 
 * Many thanks to Matthew Knox and Awarua- for the immense advice on my first JS project
 * Many thanks to JSFiddle for making debugging a piece of cake :) Ooooh cake... > o >
 */

var request = require.safe("request");

/*
* Paths
*/
var HUMMINGBIRD_HOST = "hummingbird.me/api/v1";
var HUMMINGBIRD_SEARCH = "/search/anime/";
var RESULT_LIMIT = 3; // Default

exports.match = function(text, commandPrefix) {
    return text.startsWith(commandPrefix + "humming " || commandPrefix + "humming " + commandPrefix + "limit ");
};

/*
	Method that provides help strings for use with this module.
*/
exports.help = function(commandPrefix) {
    return [[commandPrefix + "humming <query>","Searches Anime or Manga when you are too lazy to make a few clicks"],
            [commandPrefix +  "humming " + commandPrefix + "limit <number of results> <query>", "Searches for the query and returns the desired number of results"]];
};

/*
	The main entry point of the module. This will be called by Kassy whenever the match function
	above returns true.
*/
exports.run = function(api, event) {
    var command = event.body,
        commandPrefix = api.commandPrefix,
        query;
        
    if(command.startsWith(commandPrefix + "humming ")){
        query = event.body.substr(8);
    } else{
        // remove command keyword and assign values
        command =  command.replace(commandPrefix + "humming " + commandPrefix + "limit ", "");
        RESULT_LIMIT = command.substr(0, command.indexOf(" ")); // substr length is exclusive
        query = event.body.substr(command.indexOf(" ")); // start reading from where the whitespace occured
    }
        
        search(query, function(error, response){
            // Callback calls the parser if no errors were registered
            if(error == null){
                api.sendMessage(parse(response), event.thread_id);
            } else{
                console.debug(error);
            }
        });
};

/* Each JSON object in the returned will be of this form
{
  "id": 7622,
  "mal_id": 17265,
  "slug": "log-horizon",
  "status": "Finished Airing",
  "url": "https://hummingbird.me/anime/log-horizon",
  "title": "Log Horizon",
  "alternate_title": "",
  "episode_count": 25,
  "episode_length": 25,
  "cover_image": "https://static.hummingbird.me/anime/poster_images/000/007/622/large/b0012149_5229cf3c7f4ee.jpg?1408461927",
  "synopsis": "The story begins when 30,000 Japanese gamers are trapped in the fantasy online game world Elder Tale...)",
  "show_type": "TV",
  "started_airing": "2013-10-05",
  "finished_airing": "2014-03-22",
  "community_rating": 4.16741419054807,
  "age_rating": "PG13",
  "genres": [
    { "name": "Action" },
    { "name": "Adventure" },
    { "name": "Magic" },
    { "name": "Fantasy" },
    { "name": "Game" }
  ]
}
*/
function parse(res){
    var response = JSON.parse(res);
    // Response is already an array of JSON/JS objects
    // Check for null objects in it
    if(response.length <= 0){
        return "Sorry no results found";
    }
    
    // Result limit set-up; Use the lowest of the two as the limit
    var limit = RESULT_LIMIT <= response.length? RESULT_LIMIT : response.length;
    console.debug("RESULT_LIMIT: " + RESULT_LIMIT + ", response.length: " + response.length);
    var final = "---Search Results---";
    
    // Selective string creation from JSON attributes
    for (var i = 0; i < limit; i++) {
    final += "\n\n------[" + (i + 1) + "]";
    
  	final += "\nTitle: ";
    final += response[i].title;
  
    /* final += "\n\t URL: ";
    final += response[i].url; */

    final += "\nEpisodes: ";
    final += response[i].episode_count;

    final += "\nSynopsis: ";
    final += response[i].synopsis.replace(/\r?\n|\r/g,""); // Remove new lines to sustain output format

    final += "\nType: ";
    final += response[i].show_type;

    final += "\nRating (0-10): ";
    final += new Number(response[i].community_rating * 2).toFixed(2);

    final += "\nGenres: ";
    var gen = response[i].genres;
    for(var j = 0; j < gen.length; j++){
    	final += gen[j].name + "; ";
    }
  }
  return final;
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

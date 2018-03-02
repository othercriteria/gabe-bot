var Twitter = require('twitter');

var credentials = require('./credentials');
var client = new Twitter(credentials);

// XXX: starting with just "is bad" for now
var query_bad = '"is bad" -filter:retweets';

// Being particular about capitalization and punctutation, since
// I'll want to be able to easily reverse the statement.
var rgx_bad = /^([A-Z])([a-z]*) (\w+ )*is bad.$/

function searchAndTweet(succeed, fail) {
    console.log('search and tweet');

    client.get('search/tweets', { q: query_bad, count: 50 },
	       function(err, tweets, response) {
		   if (~tweets.statuses) {
		       fail(err);
		   }

		   tweets.statuses.forEach(function(tweet) {
		       var match = tweet.text.match(rgx_bad);
		       if (match) {
			   var tweetId = tweet.id_str;

			   console.log(tweetId + ' ' + tweet.text);
		       } else {
			   console.log('Regex failed.');
		       }
		   });

		   succeed('success');
	       });
}

searchAndTweet(console.log, console.log);

setInterval(function() {
    searchAndTweet(console.log, console.log);
}, 5 * 60 * 1000);

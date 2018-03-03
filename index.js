const Twitter = require('twitter');

const credentials = require('./credentials');
const client = new Twitter(credentials);

// XXX: starting with just "is good" for now
const query_good = '"is good" -filter:retweets';

// Being particular about capitalization and punctutation, since
// I'll want to be able to easily reverse the statement.
const re_good = /([A-Z])(([a-z]+) (\w+ ))*is good\./

const to_bad = (match =>
		'What if ' + match[1].toLowerCase() + match[2] + 'is bad?');

function searchAndTweet(succeed, fail) {
    client.get('search/tweets',
	       { q: query_good, count: 100 },
	       function(err, tweets, response) {
		   if (!tweets.statuses) {
		       fail(err);
		   }

		   tweets.statuses.forEach(function(tweet) {
		       const match = tweet.text.match(re_good);
		       if (match) {
			   const tweetId = tweet.id_str;
			   const userId = tweet.user.id_str;
			   const userName = tweet.user.screen_name;

			   const newTweet = to_bad(match);

			   const qtUrl = ('https://twitter.com/' +
					  userName +
					  '/status/' +
					  tweetId);

			   // console.log(qtUrl, newTweet);

			   client.post('statuses/update',
				       { status: newTweet,
					 attachment_url: qtUrl },
				       function(err, tweet, response) {
					   console.log(err || tweet.text);
				       });
		       } else {
			   // do nothing
		       }
		   });

		   succeed('success');
	       });
}

searchAndTweet(console.log, console.log);

setInterval(function() {
    searchAndTweet(console.log, console.log);
}, 5 * 60 * 1000);

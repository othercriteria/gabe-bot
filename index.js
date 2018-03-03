const optionDefinitions = [
    { name: 'dry-run', alias: 'd', type: Boolean, defaultValue: false },
    { name: 'num-matches', alias: 'm', type: Number, defaultValue: 20 },
    { name: 'interval', alias: 'i', type: Number, defaultValue: 5 }
];
const commandLineArgs = require('command-line-args');
const options = commandLineArgs(optionDefinitions, { camelCase: true });
console.log('Options:', options);

const Twitter = require('twitter');
const credentials = require('./credentials');
const client = new Twitter(credentials);

// XXX: starting with just "is good" for now
const query_good = '"is good" -filter:retweets';

// Being particular about capitalization and punctutation, since
// I'll want to be able to easily reverse the statement.
const re_good = /^(@\w+\s+)*.*\s([A-Z])(\w+(\s\w+)+\s)is good\./

const toBad = (match =>
	       'What if ' + match[2].toLowerCase() + match[3] + 'is bad?');

const doTweet = ((message, url) => {
    client.post('statuses/update',
		{ status: message,
		  attachment_url: url },
		function(err, tweet, response) {
		    console.log(err || tweet.text);
		});
});

function searchAndTweet(succeed, fail) {
    client.get('search/tweets',
	       { q: query_good, count: options.numMatches },
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

			   const newTweet = toBad(match);

			   const qtUrl = ('https://twitter.com/' +
					  userName +
					  '/status/' +
					  tweetId);

			   if (options.dryRun) {
			       console.log('dry', tweet.text, newTweet, qtUrl);
			   } else {
			       console.log(tweet.text, newTweet, qtUrl);
			       doTweet(newTweet, qtUrl);
			   }
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
}, options.interval * 60 * 1000);

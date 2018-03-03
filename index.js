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
const re_good = /([A-Z])(\w+(\s\w+)+\s)is good\./

const to_bad = (match =>
		'What if ' + match[1].toLowerCase() + match[2] + 'is bad?');

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
			   console.log(tweet.text)

			   const tweetId = tweet.id_str;
			   const userId = tweet.user.id_str;
			   const userName = tweet.user.screen_name;

			   const newTweet = to_bad(match);

			   const qtUrl = ('https://twitter.com/' +
					  userName +
					  '/status/' +
					  tweetId);

			   if (options.dryRun) {
			       console.log(qtUrl, newTweet);
			   } else {
			       client.post('statuses/update',
					   { status: newTweet,
					     attachment_url: qtUrl },
					   function(err, tweet, response) {
					       console.log(err || tweet.text);
					   });
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

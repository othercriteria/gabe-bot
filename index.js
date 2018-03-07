// Command-line option handling
const optionDefinitions = [
    { name: 'dry-run', alias: 'd', type: Boolean, defaultValue: false },
    { name: 'num-matches', alias: 'm', type: Number, defaultValue: 20 },
    { name: 'interval', alias: 'i', type: Number, defaultValue: 5 },
    { name: 'safe-only', alias: 's', type: Boolean, defaultValue: false },
    { name: 'verified-only', alias: 'b', type: Boolean, defaultValue: false },
];
const commandLineArgs = require('command-line-args');
const options = commandLineArgs(optionDefinitions, { camelCase: true });
console.log('Options:', options);

// Twitter client
const Twitter = require('twitter');
const credentials = require('./credentials');
const client = new Twitter(credentials);

// Part-of-speech tagging
const pos = require('pos');
const tagger = new pos.Tagger()
const doTagging = (sentence => {
    const words = new pos.Lexer().lex(sentence);
    return taggedWords = tagger.tag(words);
});

const query_base = ('-filter:retweets ' +
		    (options.safeOnly ? 'filter:safe ' : '') +
		    (options.verifiedOnly ? 'filter:verified ' : ''));
const query_good = query_base + '"is good" OR "are good"';
const query_bad = query_base + '"is bad" OR "are bad"';

/* Being particular about capitalization and punctutation, since
   I want to be able to easily reverse the statement.

   Structure of match:
   (1): full matching sentence (for POS tagging)
   (2): (capital) letter at beginning of first word in matching sentence
   (3): rest of matching sentence, except for valence, e.g., "good."
   (4): internal words of matching sentence
   (5): "is" or "are"
*/
const re_good = /(([A-Z])(\w+(,?\s\w+)+\s(is|are)\s)good\.)/
const re_bad = /(([A-Z])(\w+(,?\s\w+)+\s(is|are)\s)bad\.)/

const flip = (flipTo =>
    (match => {
	const tagging = doTagging(match[1]);
	const first = ((tagging[0][1] == 'NNP' || tagging[0][1] == 'NNPS') ?
		       match[2] :
		       match[2].toLowerCase());
	const rest = match[3];

	return 'What if ' + first + rest + flipTo + '?';
    })
);

const doTweet = ((message, url) => {
    client.post('statuses/update',
		{ status: message,
		  attachment_url: url },
		function(err, tweet, response) {
		    console.log(err || tweet.text);
		});
});

function searchAndTweet(succeed, fail, query, re, flipper) {
    client.get('search/tweets',
	       { q: query, count: options.numMatches },
	       function(err, tweets, response) {
		   if (!tweets.statuses) {
		       fail(err);
		   }

		   tweets.statuses.forEach(function(tweet) {
		       const clean = tweet.text.replace(/^(@\w+\s?)*/, '');
		       const match = clean.match(re);
		       if (match) {
			   const tweetId = tweet.id_str;
			   const userId = tweet.user.id_str;
			   const userName = tweet.user.screen_name;

			   const newTweet = flipper(match);

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

const doBoth = (() => {
    searchAndTweet(console.log, console.log, query_good, re_good, flip('bad'));
    searchAndTweet(console.log, console.log, query_bad, re_bad, flip('good'));
});

doBoth()
setInterval(() => doBoth(), options.interval * 60 * 1000);

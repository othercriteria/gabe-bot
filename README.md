# gabe-bot

Turn 'is bad' into 'is good', and vice versa, on Twitter.

(Following Joel Grus' [Twitter bot
tutorial](http://joelgrus.com/2015/12/29/polyglot-twitter-bot-part-1-nodejs/),
and seeing what I'll need to change to get this to work cleanly in
NixOS.)

### Credentials

The bot requires Twitter app credentials that should not show up in
public!

These can be provided by filling in and saving the template below in
the project's root directory as `credentials.js`:

```
module.exports = {
  consumer_key: "...",
  consumer_secret: "...",
  access_token_key: "...",
  access_token_secret: "..."
};
```

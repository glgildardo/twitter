'use strict'

var mongoose = require('mongoose');
var schema = mongoose.Schema;

let replytweetSchema =({
    name: String,
    text: String,
    date: Date,
    user: String
});

module.exports = mongoose.model('replyTweet', replytweetSchema);

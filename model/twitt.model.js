'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var twitterSchema =({
    text: String,
    like: {
        users: [],
        likes: Number
    },
    replytweet: [{
        text: String,
        name: String,
        date: Date 
    }],
    retweets:[ {
        user: String,
        text: String,
    }],
    date: Date,
    retweet: Boolean
});

module.exports = mongoose.model('twitter', twitterSchema);
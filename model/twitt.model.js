'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var twitterSchema =({
    text: String,
    likes: Number,
    date: Date
});

module.exports = mongoose.model('twitter', twitterSchema);
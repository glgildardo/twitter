'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = Schema({
    name: String,
    phone: Number,
    username: String,
    password: String,
    email: String,
    follow: [{type: Schema.Types.ObjectId, ref: 'user'}],
    followers:[{type: Schema.Types.ObjectId, ref: 'user'}],    
    tweets:[{type: Schema.Types.ObjectId, ref: 'twitter'}]
})

module.exports = mongoose.model('user', userSchema);
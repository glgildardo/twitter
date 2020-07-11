'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var key = 'clave_supersicreta';

exports.createToken = (user)=>{
    var payload = {
        sub: user._id,
        name: user.name,
        age: user.age,
        phone: user.phone,
        username: user.username,
        password: user.password,
        email: user.email,
        iat: moment().unix(),
        exp: moment().add(15, "days").unix
    }

    return jwt.encode(payload,key);

}
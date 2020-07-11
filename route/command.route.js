'use strict'

var express = require('express');
var authenticated = require('../middleware/authenticated');
var userController = require('../controller/user.contoller');

//RUTAS
var api = express.Router();
api.all('/command', authenticated.ensureAuth,userController.commands);

module.exports = api;
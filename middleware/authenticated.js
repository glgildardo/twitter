'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var key = 'clave_supersicreta';

exports.ensureAuth = (req,res,next) =>{
    var paramsBody = req.body;
    var separador = paramsBody.command.split('|');
    
    if(separador[0]== "LOGIN" || separador[0]== "REGISTER"){
        next();
    }else{
        if(!req.headers.authorization){
            return res.status(403).send({message:"Petición sin autorizacion"});
        }else{
            var token = req.headers.authorization.replace(/['"]+/g,'');
            try{
                var payload = jwt.decode(token,key);
                if(payload.exp <= moment().unix()){
                    return res.status(401).send({message:"Token expirado"});
                }
            }catch(Exception){
                return res.status(404).send({message:"Token no valido"});
            }
    
            req.user = payload;
            next();
        }
    }
    
}
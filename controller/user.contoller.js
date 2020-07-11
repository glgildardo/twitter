'use strict'

let User = require('../model/user.model');
let Tweet = require('../model/twitt.model');
var jwt = require('../services/jwt');
var bcrypt = require('bcrypt-nodejs');
var moment = require('moment');

function commands(req,res) {
    var paramsBody = req.body;
    var separador = paramsBody.command.split('|');


//------------ Registrarse ---------------------    
    if(separador[0] == "REGISTER"){
        var user = new User();

        /*
        separador 0 = tipo de operacion
        separador 1 = nombre
        separador 2 = usuario
        separador 3 = contrasena
        separador 4 = numero
        separador 5 = email
        */

        if(separador.length == 6){
            if(separador[1].trim() != '' && separador[2].trim() != '' && separador[3].trim() != '' && separador[4].trim() != '' && separador[5].trim() != ''){

                user.name = separador[1];
                user.username = separador[2];
                user.phone = separador[4];
                user.email = separador[5];

                User.findOne({$or:[{username:user.username},{email:user.email}]},(err,userfind)=>{
                    if(err){
                        res.status(400).send({message:"Se produjo un error al verificar si el usuario es existente ",err});
                    }else if(userfind){
                        res.status(200).send({message:"El nombre de usuario o correo que desea ingresar ya esta registrado"});
                    }else{
                        bcrypt.hash(separador[3],null,null,(err,passwordEncrypt)=>{
                            if(err){
                                res.status(500).send({message:"Error general del servidor: ", err});
                            }else if(passwordEncrypt){
                                user.password = passwordEncrypt;
                                
                                user.save((err, save)=>{
                                    if(err){
                                        res.status(400).send({message:"No se logro registrar el usuario, intentelo más tarde", err});
                                    }else if(save){
                                        res.status(200).send({message: "usuario registrado, Hola " + user.name});
                                    }else{
                                        res.send("No se ha podido registrar por problemas desconocidos");
                                    }
                                });     
                            }else{
                                res.status(404).send({message:"No se encontro contraseña la cual incriptar"});
                            }
                        });
                    }
                });
            }else{
                res.status(404).send({message:"Ingrese todos los parametros"});
            }
        }else{
            res.status(400).send({message:"Ingrese bien los parametros especificados"});
        }    
    }

// ----------- Logearse -------------------------    
    else if(separador[0] == "LOGIN"){
        if(separador.length == 3){
            let usuario = String(separador[1]);
            var contrasena = String(separador[2]);
            
            User.findOne({$or:[{username:usuario},{email:usuario}]},(err,userlogin)=>{
                if(err){
                    res.status(500).send({message:"Error en el servidor: ",err});
                }else if(userlogin){
                    bcrypt.compare(separador[2], userlogin.password, (err, passwordcheck)=>{
                        if(err){
                            res.status(500).send({message:"Se produjo un error en le servidor: ",err});
                        }else if(passwordcheck){
                            res.status(200).send({message:"Bienvenido " + userlogin.username, token: jwt.createToken(userlogin)})
                        }else{
                            res.send({message:"La contraseña que ingreso es incorrecta"});
                        }
                    });
                }else{
                    res.status(404).send({message:"Este usuario no existe"});
                }
            });
        }else{
            res.status(400).send({message:"Ingrese todos los parametros"});
        }
    }

// ----------- Ver nuestro perfil ----------------   
    else if(separador[0] == "PERFIL"){
        if(separador.length == 2){
            if(req.user.username == separador[1]){
                if(separador[1].trim() != ''){
                    User.findOne({$or:[{username:separador[1]},{email:separador[1]}]},{_id:0,__v:0},(err,perfiluser)=>{
                        if(err){
                            res.status(500).send({message:"Error del servidor: ", err});
                        }else if(perfiluser){
                            res.status(200).send({Perfil: perfiluser})
                        }else{
                            res.send({message:"No se encontro el perfil del usuario"});
                        }
                    }).populate({path:'tweets', select: "date && text"}).populate({path:'follow', select:"username"}).populate({path:'followers', select:"username"});
                }else{
                    res.status(404).send({message:"No dejes parametros vacios"});
                } 
            }else{
                res.status(400).send({message:"Este perfil no te pertenece"});
            }
        }else{
            res.status(400).send({message:"Ingrese todos los parametros"});
        }
    }

// ----------- Publicar un Tweet -----------------  
    
    else if(separador[0] == "ADD_TWEET"){
        
        /*
        separador[0] = comando
        separador[1] = id de usuario
        separador[2] = texto del tweet    
        */

        var tweet = new Tweet();
        let date = new Date(moment().format('YYYY MM DD'));
        if(separador.length == 2){
            if(req.user.sub){
                if(separador[1].trim() != ''){
                    User.findById(req.user.sub,(err,userCorrect)=>{
                        if(err){
                            res.status(500).send({message:"Error general del servidor: ",err});
                        }else if(userCorrect){
                            tweet.text = separador[1];
                            tweet.date = date;
                            tweet.likes = 0;
        
                            tweet.save((err,tweetsave)=>{
                                if(err){
                                    res.status(500).send({message:"No se pudo guardar al usuario, error del sistema: ", err});
                                }else if(tweetsave){
                                    User.findByIdAndUpdate(req.user.sub,{$push:{tweets:tweetsave._id}},(err, usertweet)=>{
                                        if(err){
                                            res.status(400).send({message:"No se pudo agregar el tweet al USUARIO, error del servidor: ", err});
                                        }else if(usertweet){
                                            res.status(200).send({Tweet: tweetsave});
                                        }else{
                                            res.status(404).send({message:"No se encontro usuario al cual asignarle el tweet"});
                                        }
                                    });
                                }else{
                                    res.status({message:"No se logro guardar al usuario"});
                                }
                            });     
                        }else{
                            res.status(400).send({message:"No esta logeado por lo que no podra realizar esta acción"});
                        }
                    });
                }else{
                    res.status(400).send({message:"Ingrese el texto del tweet y sus parametros"});
                }
            }else{
                res.status(400).send({message:"No tiene permisos para esta ruta"});
            }
        }else{
            res.status(404).send({message:"Ingrese todos los parametros"});
        }

    }

// ----------- Editar un Tweet -------------------    
    else if(separador[0] == "EDIT_TWEET"){
        if(req.user.sub){
            if(separador.length == 3){
                if(separador[1].trim() != '' && separador[2].trim() != ''){
                    User.findOne({_id:req.user.sub, 'tweets':separador[1]}, (err,userFind_Edittweet)=>{
                        if(err){
                            res.status(500).send({message:"Error general del servidor", err});
                        }else if(userFind_Edittweet){
                            let fecha = new Date(moment().format('YYYY MM DD'));
    
                            Tweet.findByIdAndUpdate(separador[1],{text:separador[2], date:fecha},{new:true},(err,tweetUpdate)=>{
                                if(err){
                                    res.status(500).send({message:"Error general en el servidor: ", err});
                                }else if(tweetUpdate){    
                                    res.status(200).send({message:"Tweet Actualizado: ", tweetUpdate});
                                }else{
                                    res.send({message:"No se encontro el tweet que deseaba actualizar"});
                                }
                            });
                        }else{
                            res.status(404).send({message:"No esta logeado para realizar esta acción o este tweet ya no existe en la base de datos"});
                        }
                    });
                }else{
                    res.status(400).send({message:"Algunos parametros estan vacios"});
                }
            }else{
                res.status(400).send({message:"No se ingresaron todos los parametros"});
            }
        }else{
            res.status(400).send({message:"No tiene permisos para esta ruta"});
        }
    }
    
// ----------- Eliminar un Tweet -----------------    
    else if(separador[0] == "DELETE_TWEET"){
        if(req.user.sub){
            if(separador.length == 2){
                if(separador[1].trim() != ''){
                    User.findOneAndUpdate({_id:req.user.sub,'tweets':separador[1]},{$pull:{'tweets':separador[1]}},{new:true},(err,tweetDelete)=>{
                        if(err){
                            res.status(500).send({message:"Error general del servidor: ",err});
                        }else if(tweetDelete){
                            Tweet.findByIdAndRemove(separador[1],(err,deleteTweet)=>{
                                if(err){
                                    res.status(500).send({message:"Error general del servidor al eliminar el tweet: ", err});
                                }else if(deleteTweet){
                                    res.status(200).send({message:"Tweet eliminado"});
                                }else{
                                    res.status(404).send({message:"No se encontro el tweet porque este no le pertenece"});
                                }
                            });
                        }else{
                            res.status(404).send({message:"Tweet no encontrado en este usuario"});
                        }
                    });
                }else{
                    res.status(404).send({message:"No deje paramtros vacios"});
                }
            }else{
                res.status(404).send({message:"Ingrese el numero de parametros correctos: 3"});
            }
        }else{
            res.status(400).send({message:"No esta logeado"});
        }
        
    
// ----------- Mirar los Tweets ------------------    
    

    }

// ----------- Seguir a una persona --------------   

    else if(separador[0] == "FOLLOW"){
        
        /*
        separador[0] = comando a ejecutar
        separador[1] = id del usuario logiado
        separador[2] = id del usuario al que se desea seguir
        */

        if(req.user.sub){
            if(separador.length == 2){
                if(separador[1].trim() != ''){
                    User.findOne({username:separador[1]},(err,followExist)=>{
                        if(err){
                            res.status(500).send({message:"Error general del servidor"});
                        }else if(followExist){
                            if(separador[1] == req.user.username){
                                res.status(400).send({message:"No puedes seguirte a ti mismo"});
                            }else{
                                User.findOne({_id:req.user.sub,'follow':followExist._id},(err,followRepeats)=>{
                                    if(err){del
                                        res.status(500).send({message:"Error general del servidor: ", err});
                                    }else if(followRepeats){
                                        res.status(400).send({message:"Usted ya sigue a esta persona"});
                                    }else{
                                        User.findByIdAndUpdate(req.user.sub,{$push:{follow:followExist._id}},{new:true},(err,followCreate)=>{
                                            if(err){
                                                res.status(500).send({message:"Error general del servidor: ", err});
                                            }else if(followCreate){
                                                User.findOneAndUpdate({username:separador[1]},{$push:{followers:req.user.sub}},{new:true},(err,followerUpdate)=>{
                                                    if(err){
                                                        res.status(500).send({message:"Error general del servidor: ", err});
                                                    }else if(followerUpdate){
                                                        let nombredeusuario = followExist.username;
                                                        res.status(200).send({message:"Usted comenzo a seguir a: ", nombredeusuario});
                                                    }else{
                                                        res.status(400).send({message:"No se logro registrar a la persona que usted sigue que la comenzo a seguir"});
                                                    }
                                                });
                                            }else{
                                                res.status(400).send({message:"No se logro completar la funcion de seguir: ",followCreate});
                                            }
                                        });
                                    }
                                });
                            }    
                        }else{
                            res.status(400).send({message:"No se encontro el usuario al que desea seguir"});
                        }
                    });
                }else{
                    res.status(404).send({message:"Ingrese todos los parametros"});
                }
            }else{
                res.status(400).send({message:"Ingrese el numero correcto de parametros"});
            }
        }else{
            res.status(400).send({message:"No se encuentra logeado"});
        }    
    }

// ----------- Dejar de seguir a un usuario ------    
    else if(separador[0] == "UNFOLLOW"){
        if(req.user.sub){
            if(separador.length == 2){
                if(separador[1].trim() != ''){
                    User.findOne({username:separador[1]},(err,followExist)=>{
                        if(err){
                            res.status(500).send({message:"Error general del servidor"});
                        }else if(followExist){
                            if(separador[1]== req.user.username){
                                res.status(400).send({message:"No puedes seguirte a ti mismo por lo que tampoco te puedes dejar de seguir"});
                            }else{
                                User.findOne({_id:req.user.sub,'follow':followExist._id},(err,followRepeats)=>{
                                    if(err){del
                                        res.status(500).send({message:"Error general del servidor: ", err});
                                    }else if(followRepeats){
                                        User.findByIdAndUpdate(req.user.sub,{$pull:{'follow':followExist._id}},{new:true},(err,followCreate)=>{
                                            if(err){
                                                res.status(500).send({message:"Error general del servidor: ", err});
                                            }else if(followCreate){
                                                User.findOneAndUpdate({username:separador[1]},{$pull:{'followers':req.user.sub}},{new:true},(err,followerUpdate)=>{
                                                    if(err){
                                                        res.status(500).send({message:"Error general del servidor: ", err});
                                                    }else if(followerUpdate){
                                                        let nombredeusuario = followExist.username;
                                                        res.status(200).send({message:"Usted dejo de seguir a: ", nombredeusuario});
                                                    }else{
                                                        res.status(400).send({message:"No se quito este usuario de la lista de seguidores del otro usuario"});
                                                    }
                                                });
                                            }else{
                                                res.status(400).send({message:"No se pudo dejar de seguir a este usuario",followCreate});
                                            }
                                        });
                                    }else{
                                        res.status(400).send({message:"Usted no sigue a esta persona para dejar de seguirla"});
                                    }
                                });
                            }    
                        }else{
                            res.status(400).send({message:"No se encontro ningun usuario con este nombre"});
                        }
                    });
                }else{
                    res.status(404).send({message:"Ingrese todos los parametros"});
                }
            }else{
                res.status(400).send({message:"Ingrese el numero correcto de parametros"});
            }
        }else{
            res.status(400).send({message:"No se encuentra logeado"});
        }
    }

// ----------- Mirar tweets ----------------------
    else if(separador[0] == "VIEW_TWEETS"){
        if(req.user.sub){
            if(separador.length == 2){
                if(separador[1].trim() != ''){
                    if(separador[1] == req.user.username){
                        res.status(400).send({message:"No puede buscarse usted mismo. Si quiere ver sus tweets vaya a su perfil"})
                    }else{
                        User.findOne({username:separador[1]},{_id:0,follow:0,followers:0,phone:0,email:0,password:0,__v:0},(err,userView)=>{
                            if(err){
                                res.status(500).send({message:"Error general del servidor: ",err});
                            }else if(userView){
                                if(userView.tweets == ''){
                                    res.status(200).send({Busqueda:"Este usuario no tiene ningun tweet publicado"});
                                }else{
                                    res.status(200).send({Busqueda:userView});
                                }
                            }else{
                                res.status(404).send({message:"No se encontro a este usuario en la base de datos"});
                            }
                        }).populate({path:"tweets",select:'text'});
                    }
                }else{
                    res.status(400).send({message:"Ingrese todos los parametros"});
                }
            }else{
                res.status(400).send({message:"Ingrese el numero correcto de parametros: 2"});
            }
        }else{
            res.status(400).send({message:"Usuario no logeado"});
        }    
    }
    
}


module.exports ={
    commands
}
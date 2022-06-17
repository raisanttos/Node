//É aqui que eu vou estruturar todo nosso sistema de autentificação
    //configurando o passport
const localStrategy = require("passport-local").Strategy //baixei o model
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs") //chamei de novo

//model de usuario
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")

    module.exports = function(passport){

        passport.use(new localStrategy({usernameField: 'email', passwordField: "senha"}, (email, senha, done) => {

            Usuario.findOne({email: email}).then((usuario) => {
                if(!usuario){ //se ele não encontrou
                    return done (null, false, { 
                        message: "Esta conta não existe"
                    })
                }

                bcrypt.compare(senha, usuario.senha, (erro, batem) => {

                    if(batem){ //se as senhas batem
                        return done (null, usuario)

                    }else{ //se as senhas não batem
                        return done(null, false, {message: "Senha incorreta"})
                    }
                })
            })
        }))

        //salvar dados de usuario em uma sessão

        passport.serializeUser((usuario, done) => {
            done(null, usuario.id)
        })

        passport.deserializeUser((id, done) => {
            Usuario.findById(id, (err, usuario) => { //procura usuario pelo id dele
                done(err, usuario)
            })
        })
    }





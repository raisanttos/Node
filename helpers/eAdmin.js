//verificar se o usuario está autenticado e se ele é admin

    module.exports = {
                            //só admin entrar
        eAdmin: function(req, res, next){ //se o usuario está autenticado

            if(req.isAuthenticated() && req.user.eAdmin == 1){ //meu model tem um campo eAdmin
                return next()
            }
                //se o usuario está autenticado

            req.flash("error_msg", "Você precisar ser um admin")
            res.redirect("/")

        }
    }
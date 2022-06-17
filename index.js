const express = require("express");
const app = express();
const port = 8081;

const handlebars = require("express-handlebars");
const admin = require("./routes/admin");
const path = require("path");//modulo padrão
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const flash = require("connect-flash");
const session = require("express-session");

require("./models/Postagem");
const Postagem = mongoose.model("postagens");

require("./models/Categoria");
const Categoria = mongoose.model("categorias");

const usuarios = require("./routes/usuario");

const passport = require("passport")
require("./config/auth")(passport)


//Configurações

    //Handlebars
        app.engine('handlebars', handlebars.engine({defaultLayout: 'main'}));
        app.set('views engine', 'handlebars');

    //sessão
        app.use(session({
            secret: "cursodenode",
            resave: true,
            saveUninitialized: true
        }));

        app.use(passport.initialize())
        app.use(passport.session())

        app.use(flash());

    //Middleware
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash("success_msg");
            res.locals.error_msg = req.flash("error_msg");
            res.locals.error = req.flash("error") //variaveis globais 
            res.locals.user = req.user || null;
            next();
        });

    //mongoose
        mongoose.Promise = global.Promise;
        mongoose.connect("mongodb://localhost/tapp", {
            useNewUrlParser: true, useUnifiedTopology: true // para evitar erros futuros
        }).then(() => {
            console.log(" Conectado ao Mongo...");
        }).catch((err) => {
            console.log("houve um erro ao se conectar ao mongoDB: "+err);
        });

        //body parser

        app.use(bodyParser.urlencoded({extended: true}));
        app.use(bodyParser.json());

    //public
        app.use(express.static(path.join(__dirname, "public")));

    
    //criando home page
    app.get("/", (req, res) => {
        Postagem.find().lean().populate("categoria").sort({data: "desc"}).then((postagens) => {
           res.render("index.handlebars", {postagens: postagens}); 
        }).catch((err) => {
            req.flash("error_msg", "Erro interno");
            res.redirect("/404");
        });       
    });

    app.get("/postagem/:slug", (req, res) => {
        Postagem.findOne({slug: req.params.slug}).lean().then((postagem) => {
            if(postagem){
                res.render("postagem/index.handlebars", {postagem: postagem}) //se vc achou alguma coisa
            }else{
                req.flash("error_msg", "Essa postagem não existe")
                res.redirect("/")
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno!")
            res.redirect("/")
        })
    })

    app.get("/404", (req, res) => {
        res.send("Erro 404");
    });

    //listando categorias no meu navbar
    app.get("/categorias", (req, res) => {
        Categoria.find().lean().then((categorias) => {
            res.render("categorias/index.handlebars", {categorias: categorias});
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno ao lista categorias");
            res.redirect("/");
        });
    });

    app.get("/categorias/:slug", (req, res) => { //aula 52
        Categoria.findOne({slug: req.params.slug}).lean().then( (categoria) => {
            if(categoria){
                Postagem.find({categoria: categoria._id}).lean().then((postagens) => {

                    res.render("categorias/postagens.handlebars", {postagens: postagens, categoria: categoria});

                }).catch((err) => {
                    req.flash("error_msg", "houve um erro ao listar os posts!");
                    res.redirect("/")
                })
            }else{
                req.flash("error_msg", "Esta categoria não existe");
                res.redirect("/")
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno ao carregar a páginadesta categoria");
            res.redirect("/")
        });
    });

    //Rotas, pré fixo
    app.use('/admin', admin);
    app.use('/usuarios', usuarios);

//Outros
app.listen(port, (req, res) => {
    console.log("Servidor rodando na porta "+port);
});
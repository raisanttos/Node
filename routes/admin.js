const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");
require("../models/Categoria");
const Categoria = mongoose.model("categorias");

require("../models/Postagem");
const Postagem = mongoose.model("postagens");

const {eAdmin} = require("../helpers/eAdmin")


    router.get("/", eAdmin, (req, res) => {
        res.render("admin/teste.handlebars");
    });

    router.get('/categorias', eAdmin, (req, res) => {
        Categoria.find().sort({date: 'desc'}).lean().then((categorias) => {
            res.render("admin/categorias.handlebars",{categorias: categorias})  //chamei categorias lá no arquivo 
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar as categorias");
            res.redirect("/admin")
        })       
    })


    router.get("/categorias/add", eAdmin, (req, res) => {
        res.render("admin/addcategorias.handlebars")
    })

    router.post("/categorias/nova", eAdmin, (req, res) => {
        var erros = [];

        if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
            erros.push({texto: "Nome inválido"});
        }

        if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
            erros.push({texto: "Slug inválido"});
        }

        if(req.body.nome.length < 2){
            erros.push({texto: "Nome muito pequeno"});
        }

        if(erros.length > 0){
            res.render("admin/addcategorias.handlebars", {erros: erros});
        }else{

            const novaCategoria = {
                nome: req.body.nome,
                slug: req.body.slug
            }

            new Categoria(novaCategoria).save().then(() => {
                req.flash("success_msg", "Categoria criada com sucesso!");
                res.redirect("/admin/categorias");
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro ao salvar categoria, tente novamente!");
                res.redirect("/admin");
            });
        }
    });
    
router.get("/categorias/edit/:id", eAdmin, (req, res) => {
    Categoria.findOne({_id: req.params.id}).lean().then((categoria) => {
        res.render("admin/editcategorias.handlebars", {categoria: categoria});
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao editar categoria");
        res.redirect("/admin/categorias");
    });
});

//ele tem um input hidden, esse id é do input
router.post("/categorias/edit", eAdmin, (req, res) => {
    Categoria.findOne({_id: req.body.id}).then((categoria) => {

        categoria.nome = req.body.nome
        categoria.slug = req.body.slug
        //ele vai pegar o campo nome da categoria que a gente quer editar, e vai atribuir a esse campo exatamente o valor que tá vindo lá do formulario
        
        categoria.save().then(() => {
            req.flash("success_msg", "Categoria editada com sucesso!");
            res.redirect("/admin/categorias");
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao salvar a edição da categoria");
            res.redirect("/admin/categorias");
        });
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao editar a categoria");
        res.redirect("/admin/categorias");
    });
});

router.post("/categorias/deletar", eAdmin, (req, res) => {
    Categoria.deleteOne({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Categoria deletada com sucesso!");
        res.redirect("/admin/categorias");
    }).catch((err) => {
        req.flash("error_msg", "Erro ao deletar categoria");
        res.redirect("/admin/categorias");
    });
});



router.get("/postagens", eAdmin, (req, res) => {
    Postagem.find().lean().populate("categoria").sort({data: "desc"}).then((postagens) => {
        res.render("admin/postagens.handlebars", {postagens: postagens});
    }).catch((err) => {
        req.flash("error_msg", "Erro ao acessar página de postagem");
        res.redirect("/admin");
    });  
});

router.get("/postagens/add", eAdmin, (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render("admin/addpostagens.handlebars", {categorias: categorias});
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar formulário!");
        res.redirect("/admin");
    });
});

router.post("/postagens/nova", eAdmin, (req, res) => {
    //addpostagem mandou pra ca os dados do formulário
        var erros = []
    
        if(req.body.categoria == "0"){
            erros.push({texto: "Categoria inválida, registre uma categoria"});
        }
    
        if(erros.length > 0){
            res.render("admin/addpostagens.handlebars", {erros: erros});
        }else{
            const novaPostagem = {
                titulo: req.body.titulo,
                descricao: req.body.descricao,
                conteudo: req.body.conteudo,
                categoria: req.body.categoria,
                slug: req.body.slug
            }
    
            new Postagem(novaPostagem).save().then(() => {
                req.flash("success_msg", "Postagem criada com sucesso!");
                res.redirect("/admin/postagens");
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro durante salvamento da postagem");
                res.redirect("/admin/postagens");
            });
        }
    });
    

router.get("/postagens/edit/:id", eAdmin, (req, res) => {
    Postagem.findOne({_id: req.params.id}).lean().then((postagem) => {

        Categoria.find().lean().then((categorias) => {
            res.render("admin/editpostagens.handlebars", {categorias: categorias, postagem: postagem});    
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar as categorias");
            res.redirect("/admin/postagens")
        })

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário de edição");
        res.redirect("/admin/postagens");
    })
});

router.post("/postagem/edit", eAdmin, (req, res) => {
    
    Postagem.findOne({_id: req.body.id}).then((postagem) => {

        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

        postagem.save().then(() => {
            req.flash("success_msg", "Postagem editada com sucesso!");
            res.redirect("/admin/postagens");
        }).catch((err) => {
            req.flash("error_msg", "Erro interno!")
            res.redirect("/admin/postagens");
        })

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao salvar edição!");
        res.redirect("/admin/postagens");
    });

});

router.post("/postagens/deletar", eAdmin,   (req, res) => {
    Postagem.deleteOne({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Postagem deletada com sucesso!");
        res.redirect("/admin/postagens");
    }).catch((err) => {
        req.flash("error_msg", "Erro ao deletar postagem");
        res.redirect("/admin/postagens");
    });
});

module.exports = router;
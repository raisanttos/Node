const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const usuario = new Schema({

    nome: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    eAdmin: {
        type: Number,//campo é admin ou não é
        default: 0 //se n for admin é 0                  
    },
    senha: {
        type: String,
        required: true
    }
});

mongoose.model("usuarios", usuario);
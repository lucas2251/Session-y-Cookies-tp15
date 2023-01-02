const fs = require('fs');
const path = require ('path');
const {validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const users = require('../data/user.json');
const { emitWarning } = require('process')

const guardar = (dato) => fs.writeFileSync(path.join(__dirname, '../data/user.json')
, JSON.stringify(dato, null, 4), 'utf-8')

module.exports = {
    register: (req, res) => {
        let colores = ["Blanco", "Verde", "Azul", "Violeta"];
        res.render('register',{colores, texto: 'Completar'});
    },
    processRegister:  (req, res) => {
        const {name, email, edad, pass, colors, recordarme} = req.body
        let colores = ["Blanco", "Verde", "Azul", "Violeta"];
        let errors = validationResult(req);
        // return res.status(200).send(req.body)
        if (errors.isEmpty()) {
            let usuarioNuevo = {
                id:users[users.length - 1].id + 1,
                name,
                email,
                edad,
                pass: bcrypt.hashSync(pass, 12),
                colors,
                rol: "usuario"
            };
            users.push(usuarioNuevo);
            guardar(users)
    
            res.redirect('/')
        }else {
            return res.render('register', { 
                colores,
                errors: errors.mapped(),
                old: req.body
            });
        };
        // res.send(`Hola ${name}, elegiste el color: ${colors}, tu email es:
        // ${email} y tu edad es: ${edad}`);
    },
    login: (req, res) => {
        let colores = ["Blanco", "Verde", "Azul", "Violeta"];
        res.render('login',{colores});
    },
    processLogin: (req, res) => {
        let errors = validationResult(req)
        if (errors.isEmpty()) {
        
            const {email,recordarme} = req.body
            let usuario = users.find(user => user.email === email)

            req.session.userLogin = {
                id : usuario.id,
                nombre : usuario.name,
                color : usuario.colors,
                email:usuario.email,
                edad:usuario.edad,
                rol : usuario.rol
            }
            if(recordarme){
                res.cookie('Login',req.session.userLogin,{maxAge: 1000 * 60 * 60})
            }

            return res.redirect('/')
            /* return res.send(req.body) */
        } else {
            /* return res.send(errors.mapped()) */
            return res.render('login', {
                errors: errors.mapped(),
                old: req.body
            })
        }
    },
    logout: (req,res) => {
        req.session.destroy();
        if(req.cookies.Login){
            res.cookie('Login', "",{maxAge: -1 })
        }
        return res.redirect('/')
    },
}
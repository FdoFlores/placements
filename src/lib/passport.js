const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const pool = require('../database');
const helpers = require('../lib/helpers');
const {specialchars} = require('../lib/helpers');
const nodemailer = require('nodemailer');
require('dotenv').config();

passport.use('local.signin', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, username, password, done) => {
    if(specialchars(username)){
        console.log('intento de sql injection');
    }else{
        const rows = await pool.query('SELECT * FROM Clientes WHERE Usuario_Cliente = ?', [username]);
        const rows2 = await pool.query('SELECT * FROM Boosters WHERE Usuario_Booster = ?', [username]);
        if(rows.length > 0){
            const user = rows[0];
            console.log(user);
            const validPassword = await helpers.matchPassword(password, user.Contrasena_Cliente);
            if(validPassword){
                console.log("1");
                done(null, user, req.flash('success','Welcome '+user.Usuario_Cliente));
            }else{
                console.log("2");
                done(null, false, req.flash('message','Incorrect Password'));
            }
        }else if(rows2.length > 0){
            const user = rows2[0];
            console.log(user, user.Contrasena_Booster);
            if(password == user.Contrasena_Booster){
                console.log("3");
                done(null, user, req.flash('success','Welcome booster '+user.Usuario_Booster));
            }else{
                console.log("4");
                done(null, false, req.flash('message','Incorrect Password'));
            }
        }else{
                console.log("5");
                return done(null, false, req.flash('message','The username does not exists'));
        }
    }
}));

passport.use('local.signup', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password1',
    passReqToCallback: true
}, async (req, username, password, done)=>{
    const {name} = req.body;
    const {email} = req.body;
    const {password2} = req.body;
    const newUser = {
        Nombre_Cliente: name,
        Usuario_Cliente: username,
        Contrasena_Cliente: password2,
        Correo_Cliente: email,        
    };
    if(password == password2){
        newUser.Status_Cliente = 'Noverif';
        newUser.Contrasena_Cliente = await helpers.encryptPassword(password);

        if(specialchars(newUser.Nombre_Cliente) || specialchars(newUser.Usuario_Cliente) || specialchars(newUser.Correo_Cliente)){
            console.log('intento de sql injection');
        }else{
            console.log(newUser);
            const crypto = require("crypto");
            const hashcr = crypto.randomBytes(20).toString('hex');
            //const result = await pool.query('CALL Registrar_Cliente (?,?,?,?,?)', [newUser.name, newUser.username,newUser.password,newUser.password,newUser.email], function(err, result){
            const result = await pool.query('INSERT INTO Clientes SET ?', [newUser]);
            console.log(result);
            console.log('Created HASH: '+hashcr);
            newUser.ID_Cliente = result.insertId;
            const newHash = {
                ID_Cliente: newUser.ID_Cliente,
                Hashcode: hashcr
            }
            const resultverif = await pool.query('INSERT INTO Verif SET ?', [newHash]);
            console.log('1');
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.PASSWORD
                }
            });

            let mailOptions = {
                from:'elo.hotline@gmail.com',
                to: newUser.Correo_Cliente,
                subject: 'VERIFY ACCOUNT EMAIL - ELO-HOTLINE',
                text: 'Click the link below to verify your account.'+
                'http://www.elo-hotline.com/auth/verify/'+newHash.Hashcode
            }

            transporter.sendMail(mailOptions, function(err, data){
                if(err){
                    console.log(err.message);
                }else{
                    console.log('Email sent.');
                }
            });
            return done(null, newUser, req.flash('verifyour','Welcome we sent you an email to verify your account, this is optional but will make your account safe.'));
        }
    }else{
        return done(null, false);
    }
}));

passport.serializeUser(function(user, done) {

    if(user.ID_Cliente >= 0){
        try{
            done(null, user.ID_Cliente);
        }catch(er){
            console.log(er);
        }
    }else{
        try{
            done(null, user.ID_Booster);
        }catch(er){
            console.log(er);
        }
    }
});

passport.deserializeUser(async (id, done) => {
    const rows = await pool.query('SELECT * FROM Clientes WHERE ID_Cliente = ?',[id]);
    const rows2 = await pool.query('SELECT * FROM Boosters WHERE ID_Booster = ?',[id]);
    if (rows[0]) {
        done(null, rows[0]);
    } else if(rows2[0]){
        done(null, rows2[0]);
    }else{
        done(null, false);
    }
    
    
});
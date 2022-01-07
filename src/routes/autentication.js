const express = require('express');
const router = express.Router();
const passport = require('passport');
const pool = require('../database');
const {isLoggedIn} = require('../lib/auth');


router.get('/', async (req,res) =>{
    res.render('auth/signin');
});

router.post('/', async (req,res, next) =>{
    passport.authenticate('local.signin', {
        successRedirect: '/auth/mainuser',
        failureRedirect: '/auth/',
        failureFlash: true
    })(req, res, next);
});

router.get('/signup', async (req,res) =>{
    res.render('auth/signup');
});

router.post('/signup', passport.authenticate('local.signup', {
    successRedirect: '/auth/mainuser',
    failureRedirect: '/auth/signup',
    failureFlash: true
}));

router.get('/verify/:hsh', async (req,res) =>{
    const hashcode = req.params.hsh;
    verifsql = await pool.query('SELECT ID_Cliente FROM Verif WHERE Hashcode = ?', [hashcode]);
    if(verifsql[0]){
        const clienteverif = verifsql[0].ID_Cliente;
        const cambio = await pool.query('UPDATE Clientes SET Status_Cliente = ? WHERE ID_Cliente = ?',['Activo', clienteverif]);
        const borra = await pool.query('DELETE FROM Verif WHERE ID_Cliente = ?',[clienteverif]);
    }else{
        console.log('No coincide con ningun verificar...');
        res.redirect('/auth/');
    }
    res.render('users/main-user-log',{msj: 'Your email was verified.'});
});

router.get('/mainuser', isLoggedIn, async (req,res) =>{

    if(req.user.ID_Cliente >= 0){//Parte de los clientes.            
        allorders = await pool.query('SELECT * FROM Pedidos_Activos WHERE Cliente_Activo = ? AND Status_Activo = ?',[req.user.ID_Cliente, 'Activo']);
        allfinished = await pool.query('SELECT * FROM Pedidos WHERE Estado = ? AND Cliente = ?', ['Finished', req.user.ID_Cliente]);
        allinprogress = await pool.query('SELECT * FROM Pedidos WHERE Estado = ? AND Cliente = ?', ['En progreso', req.user.ID_Cliente]);
        console.log('Normal user');
        if (allorders.length>0 || allfinished.length > 0 || allinprogress.length > 0) {
            res.render('users/main-user-log', {allorders, allfinished, allinprogress});
        } else {
            req.flash('ordermsg','You have no orders yet.');
            res.render('users/main-user-log', {empty: true});
        }
    }else{//Parte de los boosters.    
        allorders = await pool.query('SELECT * FROM Pedidos_Activos WHERE Status_Activo = ?', ['Activo']);
        allfinished = await pool.query('SELECT * FROM Pedidos WHERE Estado = ? AND Booster = ?', ['Finished', req.user.ID_Booster]);
        allinprogress = await pool.query('SELECT * FROM Pedidos WHERE Estado = ? AND Booster = ?', ['En progreso', req.user.ID_Booster]);
        res.render('boosters/main-booster', {allorders, allfinished, allinprogress});
    }
});

router.post('/takeorder', isLoggedIn, async (req,res) =>{
    const {idatomar} = req.body;
    const takeOrder = {
        ID_Pedido : idatomar
    }
    const takenorder = await pool.query('SELECT * FROM Pedidos_Activos WHERE ID_Pedido_Activo = ?',[idatomar]);
        if(takenorder[0]){
        console.log(takenorder[0]);
        takeOrder.Cliente = takenorder[0].Cliente_Activo;
        takeOrder.Booster = req.user.ID_Booster;
        takeOrder.Rango_Actual = takenorder[0].Rango_Actual_Activo;
        takeOrder.Rango_Deseado = takenorder[0].Rango_Deseado_Activo;
        takeOrder.LP_Actuales = takenorder[0].LP_Actuales_Activo;
        takeOrder.Servidor = takenorder[0].Servidor_Activo;
        takeOrder.Modalidad = takenorder[0].Modalidad_Activo;
        takeOrder.Rol = takenorder[0].Rol_Activo;
        takeOrder.Campeones = takenorder[0].Campeones_Activo;
        takeOrder.Precio = takenorder[0].Precio_Activo;
        takeOrder.Estado = 'En progreso';
        takeOrder.Status_Activo = takenorder[0].Status_Activo;
        takeOrder.DuoQ = 1; //Aqui falta ponerle si sí o si no.
    }
    const result = await pool.query('INSERT INTO Pedidos SET ?', [takeOrder]);
    console.log(result);
    if(result){
        const takenorder = await pool.query('DELETE FROM Pedidos_Activos WHERE ID_Pedido_Activo = ?',[idatomar]);
    }
    res.render('boosters/ordertake');
});

router.get('/logout', isLoggedIn, (req,res) =>{
    req.logOut();
    res.redirect('/auth');
});

router.post('/request', isLoggedIn, async(req,res) =>{
    const {idatomar} = req.body;
    const pedido = await pool.query('SELECT * FROM Pedidos WHERE ID_Pedido = ?',[idatomar]);
    if(pedido.length > 0){
        if(pedido[0].Cliente == req.user.ID_Cliente){
            res.render('users/current-req', {pedido: pedido[0]});
        }else{
            console.log('errrr');
            res.redirect('/auth/mainuser');
        }
    }else{
        res.redirect('/auth/mainuser');
    }
});

router.post('/datainp', isLoggedIn, async(req,res) =>{
    console.log(req.body);
    let {usercl} = req.body;
    let {id} = req.body;
    let {pedidoid} = req.body;
    let {pw} = req.body;
    let newID = "";
    for(let i = 0; i < id.length; i++){
        newID += '---'+id[i];
    }
    let newpw = "";
    for(let i = 0; i < pw.length; i++){
        newpw += '---'+pw[i];
    }
    console.log(newID);
    console.log(newpw);
    const pedido = await pool.query('SELECT * FROM Clientes WHERE Usuario_Cliente = ?',[usercl]);
    const userconf = pedido[0].ID_Cliente;
    console.log(pedidoid+' asdasd '+userconf);
    const cambio = await pool.query('UPDATE Pedidos SET Id_ig = ?, Pw_ig = ? WHERE ID_Pedido = ? AND Cliente = ?',[newID, newpw, pedidoid, userconf]);
    res.redirect('/auth/mainuser');
});

router.post('/orderchange/:id', isLoggedIn, async(req,res) =>{
    //Vamos a mandar la info del pedido id.
    const {LP_Actuales} = req.body;
    const {Rango_Actual} = req.body;
    console.log(LP_Actuales, "asdasd", Rango_Actual);
    const cambio = await pool.query('UPDATE Pedidos SET Rango_Actual = ? , LP_Actuales = ? WHERE ID_Pedido = ?',[Rango_Actual, LP_Actuales, req.params.id]);
    if(cambio){
        console.log('Exitoso');
    }
    res.redirect('/auth/ordertake/'+req.params.id);
});

function replaceAll(string, search, replace) {
    return string.split(search).join(replace);
}

router.get('/ordertake/:id', isLoggedIn, async(req,res) =>{
    //Vamos a mandar la info del pedido id.
    const pedido = await pool.query('SELECT * FROM Pedidos WHERE ID_Pedido = ?',[req.params.id]);
    let idig = pedido[0].Id_ig+'';
    let pwig = pedido[0].Pw_ig+'';

    let idz = replaceAll(idig,'---', '');
    let pwz = replaceAll(pwig,'---', '');
    console.log(idz, "asdasdasd");

    res.render('boosters/ordertake', {pedido: pedido[0], idz: idz, pwz:pwz});
    
});

router.post('/finishorder/:id', isLoggedIn, async(req,res) =>{
    //Vamos a mandar la info del pedido id.
    const pedido = await pool.query('UPDATE Pedidos SET Estado = ? WHERE ID_Pedido = ?',['Finished',req.params.id]);
    res.render('boosters/ordertake', pedido[0]);
});

module.exports = router;
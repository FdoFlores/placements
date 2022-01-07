const express = require('express');
const router = express.Router();
const {isLoggedIn} = require('../lib/auth');
const {specialchars} = require('../lib/helpers');
const {verifrank} = require('../lib/helpers');
const pool = require('../database');
const cors = require('cors');
const request = require('request');

const CLIENT = 'AZWAroaBzAtoG6ZaKCpHKgpa4Ejt-Rutai4EDJvxEMq4qiBtevRM0JSdSNawXOOmYlhLOAQa5J8wICjy';
const SECRET = 'EDB47cIcwlplIO7aUOleU8oIBipXIfBDEVwL55M0GwtxFEUCcezz6wOQaWH36X2Mp9OvO9Po8tMlKuIG';
const PAYPAL_API = 'https://api-m.paypal.com';
const auth = {user: CLIENT, pass: SECRET};

router.get('/:id/create-payment', async(req, res) =>{
    const resultado = await pool.query('SELECT Precio_Activo FROM Pedidos_Activos WHERE ID_Pedido_Activo = ?', [req.params.id]);
    console.log(resultado[0].Precio_Activo);
    const body = {
        intent: 'CAPTURE',
        purchase_units: [{
            amount: {
                currency_code: 'USD',
                value: `${resultado[0].Precio_Activo}`
            }
        }],
        application_context: {
            brand_name: 'Elo-hotline.com',
            landing_page: 'NO_PREFERENCE',
            user_action: 'PAY_NOW',
            return_url: `http://www.elo-hotline.com/users/${req.params.id}/execute-payment`,
            cancel_url: `http://www.elo-hotline.com/users/${req.params.id}/cancel-payment`  
        }
    }
    
    request.post(`${PAYPAL_API}/v2/checkout/orders`, {
        auth,
        body,
        json: true
    }, (err, response) =>{
        res.redirect(response.body.links[1].href);
        //console.log(response.body.links[1].href);
    })
});

router.get('/:id/execute-payment', async(req, res)=>{
    const token = req.query.token;
    request.post(`${PAYPAL_API}/v2/checkout/orders/${token}/capture`, {
        auth,
        body: {},
        json:true
    }, async(err, response)=> {
        const cambio = await pool.query('UPDATE Pedidos_Activos SET Status_Activo = ? WHERE ID_Pedido_Activo = ?',['Activo', req.params.id]);
        res.redirect('/auth/mainuser');
    });
});

router.get('/:id/cancel-payment', async(req, res)=>{
    const resultado = await pool.query('DELETE FROM Pedidos_Activos WHERE ID_Pedido_Activo = ?', [req.params.id]);
    res.redirect('/auth/mainuser');
});


router.get('/placements', (req,res) => {
    res.render('users/placements');
});

router.get('/placements/:games/:actual/:server/:modality/:role/:champions/:duo', isLoggedIn, async(req,res) => {
    console.log("Ticket hecho.............................................................................");
    const desired = "placements";
    const actual = req.params.actual;
    console.log("Actual: "+actual);
    const lps = req.params.games;
    const server = req.params.server;
    const modality = req.params.modality;
    const DuoQ = req.body.duo;

    let rol = 'rol-';
    if(req.body.checktop){
        const { checktop } = req.body;
        rol+=checktop+', ';
    }
    if(req.body.checkjg){
        const { checkjg } = req.body;
        rol+=checkjg+', ';
    }
    if(req.body.checkmid){
        const { checkmid } = req.body;
        rol+=checkmid+', ';
    }
    if(req.body.checkadc){
        const { checkadc } = req.body;
        rol+=checkadc+', ';
    }
    if(req.body.checksup){
        const { checksup } = req.body;
        rol+=checksup+', ';
    }

    console.log(actual,lps,server,modality,rol);
    
    const newPedido = {
        Rango_Actual_Activo: actual,
        Rango_Deseado_Activo: desired,
        LP_Actuales_Activo: lps,
        Servidor_Activo: server,
        Modalidad_Activo: modality,
        Rol_Activo: rol
    }
    console.log("duoo: "+req.body.duo);

    if(DuoQ == "duo"){
        newPedido.DuoQ = 1;
    }
    if(req.body.champions){
        newPedido.Campeones_Activo = 'Si';
        newPedido.champs = 1;
    }
    if(req.body.live){
        newPedido.Campeones_Activo += ' ,Livestream Seleccionado';
        newPedido.live = 1;
    }else{
        newPedido.Campeones_Activo += ' ,Livestream NO Seleccionado';
    }
    
    if(req.body.checktop){
        newPedido.checktop = 1;
    }
    if(req.body.checkjg){
        newPedido.checkjg = 1;
    }
    if(req.body.checkmid){
        newPedido.checkmid = 1;
    }
    if(req.body.checkadc){
        newPedido.checkadc = 1;
    }
    if(req.body.checksup){
        newPedido.checksup = 1;
    }
    
    if(req.user){
        newPedido.Cliente_Activo = req.user.ID_Cliente;
    }
    
    let act = 0;
    let des = 0;

    if(actual.includes("Iron")){
        act = 0;
    }else if(actual.includes("Bronze")){
        act = 1;
    }else if(actual.includes("Silver")){
        act = 2;
    }else if(actual.includes("Gold")){
        act = 3;
    }else if(actual.includes("Platinum")){
        act = 4;
    }else if(actual.includes("Diamond")){
        act = 5;
    }else if(actual.includes("Master")){
        act = 6;
    }else{
        act = 6;
    }


    let tipo = 0;
    
    if(newPedido.champs == 1){
        tipo = 1;
    }

    if(newPedido.DuoQ == 1){
        tipo = 2;
    }
    let matrix;

    matrix = [[2.1,3.57],
            [2.42,4.11],
            [3.68,6.25],
            [4.2,7.14],
            [5.25,8.93],
            [8.4,14.28],
            [12.6,21.42]];
    console.log(matrix);
    
    let price = 0;
    if(tipo == 2){
        price += matrix[act][1];
    }else{
        price += matrix[act][0];
    }

    price*= lps;
    
    price = price.toFixed(2);
    
    newPedido.Status_Activo = "Unpaid";

    newPedido.Precio_Activo = price;
    //Cuando selecciona campeones el precio se aumenta en un 25%.
    //Cuando selecciona DuoQ el precio se aumenta en un 70%.
    //Cada 25lp restan 15% a la primera división que se suba.
    console.log(newPedido);
    if(lps > 0){
        if(specialchars(newPedido.Rango_Actual_Activo)|| specialchars(newPedido.Rango_Deseado_Activo) || specialchars(newPedido.LP_Actuales_Activo)
        || specialchars(newPedido.Servidor_Activo) || specialchars(newPedido.Modalidad_Activo)
        || specialchars(newPedido.DuoQ) || specialchars(newPedido.Precio_Activo) || specialchars(newPedido.Cliente_Activo)){
            console.log('intento de sql injection');
        }else{
            console.log('Se registra un pedido de placements......');
            const resultado = await pool.query('INSERT INTO Pedidos_Activos SET ?', [newPedido]);
            res.redirect('/users/'+resultado.insertId+'/create-payment');
        }
    }else{
        res.redirect('/users/placements');
    }
});
////////////////
router.post('/placements/', (req,res) => {
    const {games} = req.body;
    const desired = "Any";
    const {actual} = req.body;
    const { lps } = req.body;
    const { server } = req.body;
    const { modality } = req.body;
    const DuoQ = req.body.duo;

    let rol = 'rol-';
    if(req.body.checktop){
        const { checktop } = req.body;
        rol+=checktop+', ';
    }
    if(req.body.checkjg){
        const { checkjg } = req.body;
        rol+=checkjg+', ';
    }
    if(req.body.checkmid){
        const { checkmid } = req.body;
        rol+=checkmid+', ';
    }
    if(req.body.checkadc){
        const { checkadc } = req.body;
        rol+=checkadc+', ';
    }
    if(req.body.checksup){
        const { checksup } = req.body;
        rol+=checksup+', ';
    }

    console.log(games,actual,lps,server,modality,rol);

    
    const newPedido = {
        Rango_Actual_Activo: actual,
        Rango_Deseado_Activo: desired,
        LP_Actuales_Activo: lps,
        Servidor_Activo: server,
        Modalidad_Activo: modality,
        Rol_Activo: rol
    }
    console.log("duoo: "+req.body.duo);

    if(DuoQ == "duo"){
        newPedido.DuoQ = 1;
    }
    if(req.body.champions){
        newPedido.Campeones_Activo = 'Si';
        newPedido.champs = 1;
    }
    if(req.body.live){
        newPedido.Campeones_Activo += ' ,Livestream Seleccionado';
        newPedido.live = 1;
    }else{
        newPedido.Campeones_Activo += ' ,Livestream NO Seleccionado';
    }
    
    if(req.body.checktop){
        newPedido.checktop = 1;
    }
    if(req.body.checkjg){
        newPedido.checkjg = 1;
    }
    if(req.body.checkmid){
        newPedido.checkmid = 1;
    }
    if(req.body.checkadc){
        newPedido.checkadc = 1;
    }
    if(req.body.checksup){
        newPedido.checksup = 1;
    }
    
    if(req.user){
        newPedido.Cliente_Activo = req.user.ID_Cliente;
    }
    
    let act = 0;
    let des = 0;

    if(actual.includes("Iron")){
        act = 0;
    }else if(actual.includes("Bronze")){
        act = 1;
    }else if(actual.includes("Silver")){
        act = 2;
    }else if(actual.includes("Gold")){
        act = 3;
    }else if(actual.includes("Platinum")){
        act = 4;
    }else if(actual.includes("Diamond")){
        act = 5;
    }else if(actual.includes("Master")){
        act = 6;
    }else{
        act = 6;
    }


    let tipo = 0;
    
    if(newPedido.champs == 1){
        tipo = 1;
    }

    if(newPedido.DuoQ == 1){
        tipo = 2;
    }
    let matrix;

    matrix = [[2.1,3.57],
            [2.42,4.11],
            [3.68,6.25],
            [4.2,7.14],
            [5.25,8.93],
            [8.4,14.28],
            [12.6,21.42]];
    console.log(matrix);
    
    let price = 0;
    if(tipo == 2){
        price += matrix[act][1];
    }else{
        price += matrix[act][0];
    }

    price*= games;
    
    price = price.toFixed(2);
    
    newPedido.Status_Activo = "Unpaid";

    newPedido.Precio_Activo = price;
    console.log(newPedido);

    if(price>0){
        console.log("si se manda");
        res.render('users/placements', {precio: price, newPedido, games: games});
    }else{
        console.log("no se manda");
        res.redirect('placements');
    }

});


router.get('/', (req,res) => {
    res.render('users/cotizacion');
});

router.post('/', (req,res) => {

    const {actual} = req.body;
    const { desired } = req.body;
    const { lps } = req.body;
    const { server } = req.body;
    const { modality } = req.body;
    
    let Campeones_Activo1 = 'no';
    
    let DuoQ = 0;
    if(req.body.duo){
        DuoQ = 1;
    }

    let rol = 'rol-';
    if(req.body.checktop){
        const { checktop } = req.body;
        rol+=checktop+', ';
    }
    if(req.body.checkjg){
        const { checkjg } = req.body;
        rol+=checkjg+', ';
    }
    if(req.body.checkmid){
        const { checkmid } = req.body;
        rol+=checkmid+', ';
    }
    if(req.body.checkadc){
        const { checkadc } = req.body;
        rol+=checkadc+', ';
    }
    if(req.body.checksup){
        const { checksup } = req.body;
        rol+=checksup+', ';
    }

    const newPedido = {
        Rango_Actual_Activo: actual,
        Rango_Deseado_Activo: desired,
        LP_Actuales_Activo: lps,
        Servidor_Activo: server,
        Modalidad_Activo: modality,
        Rol_Activo: rol
    }
    if(DuoQ == 1){
        newPedido.DuoQ = 1;
    }
    if(req.body.champions){
        newPedido.Campeones_Activo = 'Si';
        newPedido.champs = 1;
    }
    if(req.body.live){
        newPedido.Campeones_Activo += ' ,Livestream Seleccionado';
        newPedido.live = 1;
    }else{
        newPedido.Campeones_Activo += ' ,Livestream NO Seleccionado';
    }
    
    if(req.body.checktop){
        newPedido.checktop = 1;
    }
    if(req.body.checkjg){
        newPedido.checkjg = 1;
    }
    if(req.body.checkmid){
        newPedido.checkmid = 1;
    }
    if(req.body.checkadc){
        newPedido.checkadc = 1;
    }
    if(req.body.checksup){
        newPedido.checksup = 1;
    }
    
    if(req.user){
        newPedido.Cliente_Activo = req.user.ID_Cliente;
    }
    
    let act = verifrank(actual);
    let des = verifrank(desired);
    let tipo = 0;
    
    if(newPedido.champs == 1){
        tipo = 1;
    }

    if(newPedido.DuoQ == 1){
        tipo = 2;
    }
    let matrix;

    if(des - act < 2){
        matrix = [[9,11.25,15.3],
        [9,11.25,15.3],
        [9,11.25,15.3],
        [11.25,12.25,16.3],
        [10,12.49,16.99],
        [10,12.49,16.99],
        [10,12.49,16.99],
        [13.74,13.49,17.99],
        [10.99,13.74,18.68],
        [10.99,13.74,18.68],
        [10.99,13.74,18.68],
        [18.74,14.74,19.68],
        [17.99,22.49,30.59],
        [17.99,22.49,30.59],
        [17.99,22.49,30.59],
        [31.24,23.49,31.59],
        [28.99,36.24,49.28],
        [28.99,36.24,49.28],
        [28.99,36.24,49.28],
        [53.74,37.24,50.28],
        [74.99,93.74,127.48],
        [84.99,106.24,144.48],
        [129.99,162.49,220.98],
        [172,215,292.39]];
    }else{
        matrix = [[9,11.25,15.3],
        [9,11.25,15.3],
        [9,11.25,15.3],
        [11.25,12.25,16.3],
        [10,12.49,16.99],
        [10,12.49,16.99],
        [10,12.49,16.99],
        [13.74,13.49,17.99],
        [10.99,13.74,18.68],
        [10.99,13.74,18.68],
        [10.99,13.74,18.68],
        [18.74,14.74,19.68],
        [19.99,22.49,30.59],
        [20.99,23.49,31.59],
        [21.99,24.49,32.59],
        [31.24,25.49,33.59],
        [32.99,36.24,49.28],
        [33.99,37.24,50.28],
        [34.99,38.24,51.28],
        [53.74,39.24,52.28],
        [74.99,93.74,127.48],
        [84.99,106.24,144.48],
        [129.99,162.49,220.98],
        [172,215,292.39]];
    }
    console.log(matrix);
    
    let price = 0;
    for(let i = (act-1); i < (des-1);i++){
        console.log(matrix[i][tipo]);
        price += matrix[i][tipo];
    }
    price = price.toFixed(2);
    
    newPedido.Status_Activo = "Unpaid";

    newPedido.Precio_Activo = price;
    console.log(price);
    //asdasdasdasdasdadasdasd
    if(act < des){
        
        res.render('users/cotizacion', {precio: price, newPedido});
    }else{
        res.render('users/cotizacion');
    }
    
});


router.get('/:actual/:desired/:lp/:server/:modality/:role/:champions/:duo', isLoggedIn, async(req,res) => {
    const newPedido = {
        Rango_Actual_Activo: req.params.actual,
        Rango_Deseado_Activo: req.params.desired,
        LP_Actuales_Activo: req.params.lp,
        Servidor_Activo: req.params.server,
        Modalidad_Activo: req.params.modality,
        Rol_Activo: req.params.role,
    }
    const champs = req.params.champions;
    if(champs.includes('undefined')){
        newPedido.Campeones_Activo = 'No incluye';
    }else{
        newPedido.Campeones_Activo = 'Sí incluye';
    }

    if(req.params.duo == 1){
        newPedido.DuoQ = 1;
    }else{
        newPedido.DuoQ = 0;
    }
    newPedido.Status_Activo = 'Unpaid';

    let act = verifrank(req.params.actual);
    let des = verifrank(req.params.desired);
    let tipo = 0;
    
    if(newPedido.Campeones_Activo != 'No incluye'){
        tipo = 1;
    }

    if(newPedido.DuoQ == 1){
        tipo = 2;
    }
    let matrix;

    if(des - act < 2){
        matrix = [[9,11.25,15.3],
        [9,11.25,15.3],
        [9,11.25,15.3],
        [11.25,12.25,16.3],
        [10,12.49,16.99],
        [10,12.49,16.99],
        [10,12.49,16.99],
        [13.74,13.49,17.99],
        [10.99,13.74,18.68],
        [10.99,13.74,18.68],
        [10.99,13.74,18.68],
        [18.74,14.74,19.68],
        [17.99,22.49,30.59],
        [17.99,22.49,30.59],
        [17.99,22.49,30.59],
        [31.24,23.49,31.59],
        [28.99,36.24,49.28],
        [28.99,36.24,49.28],
        [28.99,36.24,49.28],
        [53.74,37.24,50.28],
        [74.99,93.74,127.48],
        [84.99,106.24,144.48],
        [129.99,162.49,220.98],
        [172,215,292.39]];
    }else{
        matrix = [[9,11.25,15.3],
        [9,11.25,15.3],
        [9,11.25,15.3],
        [11.25,12.25,16.3],
        [10,12.49,16.99],
        [10,12.49,16.99],
        [10,12.49,16.99],
        [13.74,13.49,17.99],
        [10.99,13.74,18.68],
        [10.99,13.74,18.68],
        [10.99,13.74,18.68],
        [18.74,14.74,19.68],
        [19.99,22.49,30.59],
        [20.99,23.49,31.59],
        [21.99,24.49,32.59],
        [31.24,25.49,33.59],
        [32.99,36.24,49.28],
        [33.99,37.24,50.28],
        [34.99,38.24,51.28],
        [53.74,39.24,52.28],
        [74.99,93.74,127.48],
        [84.99,106.24,144.48],
        [129.99,162.49,220.98],
        [172,215,292.39]];
    }
    console.log(matrix);
    
    let price = 0;
    for(let i = (act-1); i < (des-1);i++){
        console.log(matrix[i][tipo]);
        price += matrix[i][tipo];
    }
    price = price.toFixed(2);

    newPedido.Precio_Activo = price;
    newPedido.Cliente_Activo = req.user.ID_Cliente;

    //Cuando selecciona campeones el precio se aumenta en un 25%.
    //Cuando selecciona DuoQ el precio se aumenta en un 70%.
    //Cada 25lp restan 15% a la primera división que se suba.
    
    console.log(act, des, 'Actual y deseado :]')
    console.log(newPedido);
    if(des > act){
        if(specialchars(newPedido.Rango_Actual_Activo)|| specialchars(newPedido.Rango_Deseado_Activo) || specialchars(newPedido.LP_Actuales_Activo)
        || specialchars(newPedido.Servidor_Activo) || specialchars(newPedido.Modalidad_Activo)
        || specialchars(newPedido.DuoQ) || specialchars(newPedido.Precio_Activo) || specialchars(newPedido.Cliente_Activo)){
            console.log('intento de sql injection');
        }else{
            console.log('Se registraría');
            const resultado = await pool.query('INSERT INTO Pedidos_Activos SET ?', [newPedido]);
            res.redirect('/users/'+resultado.insertId+'/create-payment');
        }
    }else{
        res.redirect('/users/');
    }
});


module.exports = router;
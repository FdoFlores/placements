const express = require('express');
const router = express.Router();

router.get('/', async (req,res) =>{
    console.log('entra aqui');
    res.render('index');
    console.log('b');
});

router.get('/contact', async (req,res) =>{
    res.render('contact');
});

module.exports = router;
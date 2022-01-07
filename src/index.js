const express = require('express');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const path = require('path');
const { nextTick } = require('process');
const flash = require('connect-flash');
const  session = require('express-session');
const MySQLStore = require('express-mysql-session');
const {database} = require('./keys');
const passport = require('passport');
const http = require('http');

// initializations Me quedé instalando la base de datos. :3
const app = express();
const server = http.createServer(app);
const {Server} = require('socket.io');
const io = new Server(server);

require('./sockets')(io);

require('./lib/passport');
// settings
app.set('port', process.env.PORT || 8000);
app.set('views', path.join(__dirname, 'views')); //Ruta de views.
app.engine('.hbs', exphbs({//Configuramos el handlebars.
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    helpers: require('./lib/handlebars')
}));
app.set('view engine', '.hbs');

// Middlewares

app.use(session({
    secret: 'elohlsession',
    resave: false,
    saveUninitialized: false,
    store: new MySQLStore(database)
}));

app.use(flash());
app.use(morgan('dev'));
app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());


// Global Variables
app.use((req,res,next) =>{
    app.locals.success = req.flash('success');
    app.locals.message = req.flash('message');
    app.locals.ordermsg = req.flash('ordermsg');
    app.locals.verif = req.flash('verifyour');
    app.locals.user = req.user;
    next();
});

// Routes
app.use(require('./routes'));
app.use('/users',require('./routes/users'));
app.use('/auth',require('./routes/autentication'));


// Public
app.use(express.static(path.join(__dirname, '/public')));

// Starting the server
server.listen(app.get('port'), () =>{
    console.log('Server on port', app.get('port'));
});
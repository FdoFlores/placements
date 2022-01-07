const mysql = require('mysql');
const { promisify } = require('util');

const {database} = require('./keys');//Agarra la info de la base de datos desde keys

const pool = mysql.createPool(database);//Crea el pool(Conexión)

pool.getConnection((err,connection) =>{
    if(err){
        if(err.code === 'PROTOCOL_CONNECTION_LOST'){
            console.error('DATABASE CONNECTION WAS CLOSED');
        }
        if(err.code === 'ER_CON_COUNT_ERROR'){
            console.error('DATABASE HAS TOO MANY CONNECTIONS');
        }
        if(err.code === 'ECONNREFUSED'){
            console.error('DATABASE CONNECTION WAS REFUSED');
        }
    }

    if(connection) connection.release();
    console.log('DB is connected');
    return;
});

// Promisify Pool Querys. Convierte a promesas las consultas.
pool.query = promisify(pool.query);

module.exports = pool;//Exporta la conexión.
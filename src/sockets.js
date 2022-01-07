//Servidor
const pool = require('./database');

module.exports = function(io){
    io.on('connection', async socket => {
        io.sockets.emit('loado');
        const chat = await pool.query('SELECT * FROM Mensajes ORDER BY Sent ASC',[]);
        
        socket.on('cargar', async(data) =>{
            if(chat.length>0){
                console.log(data.chat+' CHAT')
                const chatcheck = data.chat;
                const chat2 = await pool.query('SELECT * FROM Mensajes WHERE Chat = ? ORDER BY Sent ASC',[chatcheck]);
                if(chat2.length){
                    console.log(chat2+'Chat 2');
                    const exists = await pool.query('SELECT * FROM Chats WHERE Orden_ID = ?',[chat2[0].Chat]);
                    console.log(exists[0]+'Exists');
                    if(exists.length){
                        if(exists[0].ID_Cliente == data.userid || exists[0].ID_Booster == data.userid){
                            for(let i = 0; i<chat2.length; i++){
                                io.sockets.emit('appe', {userid: chat2[i].Envia, Mensaje: chat2[i].Mensaje});
                            }
                        }
                    }
                }
            }
        });

        socket.on('send message', async(data) =>{
            console.log('El usuario que envió es: '+data.userid+' Numero de pedido: '+data.pedidoid);
            
            if(data.userid < 0){
                chat3 = await pool.query('SELECT * FROM Chats WHERE Orden_ID = ? AND ID_Booster = ?', [data.pedidoid, data.userid]);
                console.log('chat: ', chat3, 'data: ',data);
                if(chat3.length>0){
                    chatfinal = chat3[0];
                    io.sockets.emit('new message', data, chatfinal);
                }
            }else{
                chat3 = await pool.query('SELECT * FROM Chats WHERE Orden_ID = ? AND ID_cliente = ?', [data.pedidoid, data.userid]);
                console.log('chat: ', chat3, 'data: ',data);
                if(chat3.length > 0){
                    chatfinal = chat3[0];
                    io.sockets.emit('new message', data, chat3);
                }
            }

            let newMessage = {
                Chat: data.pedidoid,
                Envia: data.userid,
                Mensaje: data.message
            }
            newMessage.Status_Mensaje = 'Activo';
            try{
                //INSERT INTO `boosting`.`Mensajes` (`Chat`, `Envia`, `Mensaje`, `Status_Mensaje`) VALUES ('4', '-1', 'zzz', 'asdf');
                const insertbd = await pool.query('INSERT INTO Mensajes SET ?', [newMessage]);
                console.log(insertbd);
            }catch(e){
                console.log(e);
            }
        });
    });
}
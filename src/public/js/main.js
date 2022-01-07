//Cliente
$(function(){
    const socket = io();
    
    //obtaining DOM elements from the interface
    const $messageForm = $('#message-form');
    const $messageBox = $('#message');
    const $chat = $('#chat');
    const $user = $('#user');
    const $pedidoid = $('#pedidoid');
    let $mss = $('#mss');
    let cargado = true;
    //events
    

    $messageForm.submit(e=>{
        e.preventDefault();
        socket.emit('send message', {message: $messageBox.val(), userid: $user.val(), pedidoid: $pedidoid.val()});
        $messageBox.val('');
    });

    socket.on('loado', (data)=>{
        //socket.emit('cargar',{chat: $pedidoid.val(), userid: $user.val()});
    });

    socket.on('appe', (data)=>{
        if($user.val() < 0){//Si el mensaje fue enviado por un booster...
            if($user.val() == data.userid){
                $chat.append('<div class="incoming_msg" id="message1">'+
                '<div class="incoming_msg_img"> <img src="https://ptetutorials.com/images/user-profile.png" alt="sunil"> </div>'+
                '<div class="received_msg">'+
                '<div class="received_withd_msg">'+
                '<span class="time_date"> Booster </span><p>'+data.Mensaje+'</p>'+
                '</div>'+
                '</div>'+
                '</div>');
            }else{
                $chat.append('<div class="outgoing_msg">'+
                '<div class="sent_msg">'+
                '<span class="time_date"> Customer </span>'+
                '<p>'+data.Mensaje+'</p>'+
                '</div>'+
                '</div>');
            }
        }else{//Si fue mandado por un cliente...
            if($user.val() != data.userid){
                $chat.append('<div class="incoming_msg" id="message1">'+
                '<div class="incoming_msg_img"> <img src="https://ptetutorials.com/images/user-profile.png" alt="sunil"> </div>'+
                '<div class="received_msg">'+
                '<div class="received_withd_msg">'+
                '<span class="time_date"> Booster </span><p>'+data.Mensaje+'</p>'+
                '</div>'+
                '</div>'+
                '</div>');
            }else{
                $chat.append('<div class="outgoing_msg">'+
                '<div class="sent_msg">'+
                '<span class="time_date"> Customer </span>'+
                '<p>'+data.Mensaje+'</p>'+
                '</div>'+
                '</div>');
            }
        }
        $('#chat').stop ().animate ({
            scrollTop: $('#chat')[0].scrollHeight
        });
        
    });

    socket.on('new message', (data, chat) =>{
            if(data.userid < 0){//Si el mensaje fue enviado por un booster...
                if(chat.ID_Booster != data.userid){
                    $chat.append('<div class="outgoing_msg">'+
                    '<div class="sent_msg">'+
                    '<span class="time_date"> Customer </span>'+
                    '<p>'+data.message+'</p>'+
                    '</div>'+
                    '</div>');
                    
                }else{
                    $chat.append('<div class="incoming_msg" id="message1">'+
                    '<div class="incoming_msg_img"> <img src="https://ptetutorials.com/images/user-profile.png" alt="sunil"> </div>'+
                    '<div class="received_msg">'+
                    '<div class="received_withd_msg">'+
                    '<span class="time_date"> Booster </span><p>'+data.message+'</p>'+
                    '</div>'+
                    '</div>'+
                    '</div>');
                    
                }
            }else{
                if(chat.ID_Cliente == data.userid){
                    $chat.append('<div class="incoming_msg" id="message1">'+
                    '<div class="incoming_msg_img"> <img src="https://ptetutorials.com/images/user-profile.png" alt="sunil"> </div>'+
                    '<div class="received_msg">'+
                    '<div class="received_withd_msg">'+
                    '<span class="time_date"> Booster </span><p>'+data.message+'</p>'+
                    '</div>'+
                    '</div>'+
                    '</div>');
                    
                }else{
                    $chat.append('<div class="outgoing_msg">'+
                    '<div class="sent_msg">'+
                    '<span class="time_date"> Customer </span>'+
                    '<p>'+data.message+'</p>'+
                    '</div>'+
                    '</div>');
                }
            }
            $('#chat').stop ().animate ({
                scrollTop: $('#chat')[0].scrollHeight
            });
        
    });
}); 




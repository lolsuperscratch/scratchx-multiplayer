(function(ext) {
    // Cleanup function when the extension is unloaded
    ext._shutdown = function() {};
        // Create WebSocket connection.
var socket = new WebSocket("wss://node2.wsninja.io");
var new_message = false;
var userid = Math.floor(Math.random() * 9000)
var can_send_messages = false;
var messages = { m:'',msgvalue:'',msgtype:'',from:'',servname:'',private:false,to:'' };

console.log('[Multiplayer] Connecting to wsninja server')
var servername = "public";
socket.addEventListener('open', function(event) {
    // Connection opened, send client GUID to autenticate with wsninja server.
    socket.send(JSON.stringify({ guid: "86681008-1189-4c46-89d5-0afadeff3a4f" }));
});

// Listen for websocket messages.
socket.addEventListener('message', function(event) {
    var message = JSON.parse(event.data);
    messages = message
    console.log('[Multiplayer] new message',message)
    new_message = true;
});
    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function() {
        if (!WebSocket) return {status: 0, msg: 'Not Supported'};
        return {status: 2, msg: 'Ready'};
    };

    ext.broadcast_message = function(a,b,c) {
        socket.send(JSON.stringify( { m:a,msgvalue:b,msgtype:c,from:userid,servname:servername,private:false,to:"" } ))
    };
    ext.broadcast_private = function(a,b,c) {
        socket.send(JSON.stringify( { m:a,msgvalue:b,msgtype:"everyone",from:userid,servname:servername,private:true,to:c } ))
    };
    ext.when_message = function(a) {
        if (new_message == true && messages.servname == servername) {
            if (messages.m == a) {
            if (messages.msgtype == "others" && messages.from == userid) {new_message = false;return false;}
            if (messages.private == true && messages.to == userid) {console.log('[Multiplayer] receiving to client');new_message = false;return true;}
            if (messages.private == true && messages.to !== userid) {new_message = false;return false;}
            console.log('[Multiplayer] receiving to client');
            new_message = false;
            return true;
            }
        }
        return false;
    };
    ext.get_from = function() {
        return messages.from;
    };
    ext.get_server = function() {
        return servername;
    };
    ext.set_server = function(a) {
        servername = a;
    };
    ext.get_msgvalue = function() {
        return messages.msgvalue;
    };
    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            // Block type, block name, function name
            [' ', 'broadcast %s with value %s to %m.msgtype','broadcast_message','chat','hello','others'],
            [' ', 'broadcast %s with value %s to user id %s','broadcast_private','serect','is the serect...',''],
            ['h', 'when i receive message %s','when_message','chat'],
            ['r', 'from user id','get_from'],
            ['r', 'server name','get_server'],
            ['r', 'message value','get_msgvalue'],
            [' ', 'set server name to %s','set_server','public'],
        ],
        menus: {
           msgtype: ['everyone', 'others']
        },
    };

    // Register the extension
    ScratchExtensions.register('Multiplayer', descriptor, ext);
})({});

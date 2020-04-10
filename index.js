var mysql = require('mysql');
// var con = mysql.createConnection({
//     host: "localhost",
//     database: 'hidroponik',
//     user: "root",
//     password: ""
//   });

//   con.connect(function(err) {
//     if (err) throw err;
//     console.log("Connected!");
//   }); 

//   con.query("SELECT * FROM table_users", function (err, result, fields) {  
//     if (err) throw err;
//     console.log(result);
//   });

////this is how to query

//App setup
var express = require('express');
var socket = require('socket.io');
var app = express();
bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
// var router = require('express').Router();

var routes = require('./Routes/Routes');

var server = app.listen(4000, function () {
    console.log('listening to request on port 4000')
});

routes(app)
//static files
// app.use(express.static('public'));

//socket setup
var io = socket(server);
var clients = [];
io.on('connection', function (socket) {
    console.log('made socket connection', socket.id);
    // socket.on('join', function (data) {

    //     socket.join(data.email); // We are using room of socket io
    //     var clients = io.sockets.adapter.rooms[data.email].sockets; 
    //     console.log(clients);
    //   });
    // socket.on('storeClientInfo', function (data) {
    //     var clientInfo = new Object();
    //     clientInfo.customId = data.customId;
    //     clientInfo.clientId = socket.id;
    //     if (clients.find(x => x.customId === data.customId)) {
    //         // console.log('true');
    //         for (var i = 0, len = clients.length; i < len; ++i) {
    //             var c = clients[i];

    //             if (c.customId == data.customId) {
    //                 clients.splice(i, 1);
    //                 // break;
    //             }
    //         }

    //         clients.push(clientInfo);
    //     } else {
    //         clients.push(clientInfo);
    //     }
    //     console.log(clients);
    // });
    socket.on('new user',function(data){
        if(data in clients){
            delete clients[data];
            socket.nickname = data;
            clients[socket.nickname] = socket;
        }
        else{
            socket.nickname = data;
            clients[socket.nickname] = socket;
        }
        // console.log(clients);
    })

    socket.on('chat', function (data) {
        io.sockets.emit('chat', data);
        console.log(data);
    });
    socket.on('typing', function (data) {
        socket.broadcast.emit('typing', data);
    })
    socket.on("chat message", msg => {
        console.log(msg);
        io.emit("chat message", msg);
    });
    socket.on('temp', function (id, data) {
    //  io.sockets.to(id_user).emit('temp',data);
    io.to(clients[id]['id']).emit('temp',data);
       console.log(clients[id]['id']);
  
        
    });
    socket.on('disconnect', function (data) {

        // for (var i = 0, len = clients.length; i < len; ++i) {
        //     var c = clients[i];

        //     if (c.clientId == socket.id) {
        //         clients.splice(i, 1);
        //         break;
        //     }
        // }
       delete clients[socket.nickname];
        // console.log(clients);

    });
    socket.on('tds', function (data) {
        io.sockets.emit('tds', data);
        // console.log(socket.adapter.nickname);
    });
    socket.on('wl', function (data) {
        io.sockets.emit('wl', data);
        // console.log(data);
    });
});
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
process.on('uncaughtException', function(ex) {
    console.log(""+ex);
});
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
    console.log('\nmade socket connection', socket.id);
 
    socket.on('new user', function (data) {
        if (data in clients) {
            delete clients[data];
            socket.nickname = data;
            clients[socket.nickname] = socket;
        } else {
            socket.nickname = data;
            clients[socket.nickname] = socket;
        }
        // console.log(clients[socket.nickname]);
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
       
        if (clients.hasOwnProperty(id)) {
            io.to(clients[id]['id']).emit('temp', data);
            console.log(clients[id]['id']);
        } else {
            console.log("\nTarget Device Is Offline or Doesn't exist ");
        }

   
    });
    socket.on('disconnect', function (data) {

        delete clients[socket.nickname];

    });
    socket.on('tds', function (id,data) {
        if (clients.hasOwnProperty(id)) {
            io.to(clients[id]['id']).emit('tds', data);
            console.log(clients[id]['id']);
        } else {
            console.log("\nTarget Device Is Offline or Doesn't exist ");
        }
      
    });
    socket.on('wl', function (id,data) {
        io.sockets.emit('wl', data);
        if (clients.hasOwnProperty(id)) {
            io.to(clients[id]['id']).emit('wl', data);
            console.log(clients[id]['id']);
        } else {
            console.log("\nTarget Device Is Offline or Doesn't exist ");
        }
     
    });
});


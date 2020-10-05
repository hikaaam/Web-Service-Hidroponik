var mysql = require('mysql');
var db = "ta20hidroponik";
var user = "ta20ucup";
var pw = "naruto654321";
var moment = require("moment");
const fetch = require("node-fetch");
var firebase = require("firebase")
var https = require('https')

var firebaseConfig = {
    apiKey: "AIzaSyCCET55bZ2ZklUZ1zsoQAZkuFcocwhx4xc",
    authDomain: "hidroponik-f9170.firebaseapp.com",
    databaseURL: "https://hidroponik-f9170.firebaseio.com",
    projectId: "hidroponik-f9170",
    storageBucket: "hidroponik-f9170.appspot.com",
    messagingSenderId: "923110173321",
    appId: "1:923110173321:web:405b36232a817bbc86f458",
    measurementId: "G-B00F6D1FQX"
};
firebase.initializeApp(firebaseConfig);

var { google } = require('googleapis');
var MESSAGING_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';
var SCOPES = [MESSAGING_SCOPE];

function getAccessToken() {
    return new Promise(function (resolve, reject) {
        var key = require('./service-account.json');
        var jwtClient = new google.auth.JWT(
            key.client_email,
            null,
            key.private_key,
            SCOPES,
            null
        );
        jwtClient.authorize(function (err, tokens) {
            if (err) {
                reject(err);
                return;
            }
            resolve(tokens.access_token);
        });
    });
}


var PROJECT_ID = "hidroponik-f9170";
var HOST = 'fcm.googleapis.com';
var PATH = '/v1/projects/' + PROJECT_ID + '/messages:send';
function sendFcmMessage(fcmMessage) {
    getAccessToken().then(function (accessToken) {
        var options = {
            hostname: HOST,
            path: PATH,
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
            // … plus the body of your notification or data message
        };
        var request = https.request(options, function (resp) {
            resp.setEncoding('utf8');
            resp.on('data', function (data) {
                console.log('Message sent to Firebase for delivery, response:');
                console.log(data);
            });
        });
        request.on('error', function (err) {
            console.log('Unable to send message to Firebase');
            console.log(err);
        });
        request.write(JSON.stringify(fcmMessage));
        request.end();
    });
}


var link = "https://fcm.googleapis.com/v1/projects/hidroponik-f9170/messages:send";
var Fcm_id = "AAAA1u2naok:APA91bGze_11sY51Ra7dFs0wCW_yCGA3P6hOHXnH6Nfk6k-6pmlFfsVR9m8eZt7hDQ1td2wfmBfDL7d0Pack0cZdgUSnCpSZA5DCsd4Buwpeoavlp1gCJOxDt6rzLa75viEkIIAn8c8x";

function buatData(token, title, body, image) {
    if (image.length > 1) {
        var data = {
            "message": {
                "token": token,
                "notification": {
                    "title": title,
                    "body": body,
                    "image": image
                }
            }
        };
    }
    else {
        var data = {
            "message": {
                "token": token,
                "notification": {
                    "title": title,
                    "body": body
                }
            }
        };
    }
    return data;
}




var con = mysql.createConnection({
    host: "localhost",
    database: 'hidroponik',
    user: "root",
    password: ""
});

con.connect(function (err) {
    if (err) throw err;
    console.log("\nDB Connected!");
});

//   con.query("SELECT * FROM table_users", function (err, result, fields) {  
//     if (err) throw err;
//     console.log(result[0].full_name);
//   });

function checkNotif(id,val,callback){
        var query = "SELECT COUNT(*) as count FROM `notifications` WHERE id_prototype ='"+id
        +"' and status = '"+val+"' and (now()-created_at)<10000";
        con.query(query, function (err, result, fields) {  
            if (err) throw err;
            return callback(result[0].count);
        });
}
function updateTanaman(nama,value,id){
    if(nama == "nama"){
       let query = "UPDATE `prototype` SET `nama`='"+value+"' WHERE `prototype_id` = '"+id+"'";
       con.query(query, function (err, result, fields) {  
        if (err) throw err;
      
    });
    }
    else if(nama == "jenis"){
        let query = "UPDATE `prototype` SET `id_kategori`='"+value+"' WHERE `prototype_id` = '"+id+"'";
        con.query(query, function (err, result, fields) {  
            if (err) throw err;
       
        });
    }
    else{
        let query = "UPDATE `prototype` SET `created_at`=CURRENT_TIMESTAMP() WHERE `prototype_id` = '"+id+"'";
        con.query(query, function (err, result, fields) {  
            if (err) throw err;
       
        });
    }
}
function notifpanen(id,token){
    
        var query = "SELECT p.created_at as created_at, c.panen as panen, p.nama as nama FROM prototype as p inner join categories as c ON c.id = p.id_kategori where p.prototype_id = '"+id+"'";
        con.query(query, function (err, result, fields) {  
            if (err) throw err;
        var created_at = moment(result[0].created_at).format("YYYY-MM-DD");
        var panen = result[0].panen;
        var nama = result[0].nama;
        var tanggal_panen = moment(created_at).add(panen,'days').format("YYYY-MM-DD");
        var topanen = moment(tanggal_panen).diff(moment().format("YYYY-MM-DD"),'day');
        console.log("kirim notifikasi panen");  
        if((panen-topanen)>=(panen-1)){
            sendFcmMessage(buatData(token,"Hidroponiks Apps","Tanaman "+nama+" sudah saatnya panen!!","http://www.sha.edu.in/wp-content/uploads/2017/08/congratulations_4-600x390.png"))
        }
        });
    
}
function getToken(id,callback){
    var query = "SELECT u.token as token, u.id as id FROM `table_users` as u inner join prototype as p WHERE p.prototype_id = '"+id+"'";
    con.query(query, function (err, result, fields) {  
        if (err) throw err;
        return callback(result[0]);
    });
}
function tambahData(idp,uid,isi,status){
    var query = "INSERT INTO notifications (id_prototype,id_user,isi,status) values ('"+idp+"','"+uid+"','"+isi+"','"+status+"')";
    con.query(query, function (err, result, fields) {  
        if (err) throw err;
    });
}
function LastCheck(id,isi,status,image){
    checkNotif(id,status,function(result){
        if(result<1){
            getToken(id,function(result){
                tambahData(id,result.id,isi,status);
                sendFcmMessage(buatData(result.token,"Hidroponik Apps",isi,image));
                if(status=="temp"){
                notifpanen(id,result.token);
                }
            })
        }
    });
}

////this is how to query

//App setup
var express = require('express');
var socket = require('socket.io');
var app = express();

// var subdomain = require('express-subdomain');
// app.use(subdomain('hidroponik', router));

// bodyParser = require('body-parser');
// app.use(bodyParser.urlencoded({
//     extended: true
// }));
// app.use(bodyParser.json());
// var router = require('express').Router();



// var routes = require('./Routes/Routes');

process.on('uncaughtException', function (ex) {
    console.log("" + ex);
});
var server = app.listen(4000, function () {
    console.log('listening to request on port 4000')
});

// routes(app)
// static files
// app.use(express.static('public'));



//socket setup
var io = socket(server);
//io.origins('*:*');
io.set('origins', '*:*');
var clients = [];
var currentData = [];
var RelayTemp = [];
var RelayWl = [];
var Mode = [];
var NilaiWl = [];
var NilaiTemp = [];
var NilaiTds = [];
var NilaiHum = [];
io.on('connection', function (socket) {
    console.log('\nmade socket connection', socket.id);

    socket.on('new user', function (data) {
        console.log('new user : ' + data);
        if (data in clients) {
            delete clients[data];
            socket.nickname = data;
            clients[socket.nickname] = socket;
        } else {
            socket.nickname = data;
            clients[socket.nickname] = socket;
            NilaiWl[data] = 30;
            NilaiTemp[data] = 27;
            NilaiTds[data] = 500;
            NilaiHum[data] = 70;
        }
        // console.log(clients)
        // setTimeout(function () {
        // if (currentData.hasOwnProperty('P' + socket.nickname)) {
        //     io.to(clients[socket.nickname]['id']).emit('temp', {
        //         _val: currentData['P' + socket.nickname]['temp']['data'],
        //         _msg: 'Current Data',
        //     });
        //     io.to(clients[socket.nickname]['id']).emit('tds', {
        //         _val: currentData['P' + socket.nickname]['tds']['data'],
        //         _msg: 'Current Data',
        //     });
        //     io.to(clients[socket.nickname]['id']).emit('wl', {
        //         _val: currentData['P' + socket.nickname]['wl']['data'],
        //         _msg: 'Current Data',
        //     });
        //     io.to(clients[socket.nickname]['id']).emit('hum', {
        //         _val: currentData['P' + socket.nickname]['hum']['data'],
        //         _msg: 'Current Data',
        //     });
        //     console.log('\nupdate for user\n');
        // }
        // else {
        //     console.log("\noffline\n");
        //     console.log(currentData);
        // }
        // }, 1000);  

    })

    socket.on('chat', function (data) {
        socket.emit("chat", "hi from server :P aaa");
        console.log("connected : " + data + " \n")
    });

    socket.on('typing', function (data) {
        socket.broadcast.emit('typing', data);
    })
    socket.on("chat message", msg => {
        console.log(msg);
        io.emit("chat message", msg);
    });

    socket.on('temp', function (data) {
        console.log(data);
        var id = data._id;
        console.log('\n\n' + id);
        if (data._val > 26) {
            console.log("panas"); 
            try { 
                LastCheck(id,"Temperatur Saat Ini adalah "+data._val+"°C","temp","");
            } catch (error) {
                console.log(error)
            }
        }
        else {
            // if (Mode[id]) {
            //     if (RelayTemp[id]) {
            //         io.to(clients["P" + id]['id']).emit('rtemp', false);
            //     }
            // }
        }
        if (clients.hasOwnProperty(id)) {
            //  // otomatisasi
            io.to(clients[id]['id']).emit('temp', data);
        } else {
            console.log("\nTarget Device (" + id + ") Is Offline or Doesn't exist ");
        }
    });
    socket.on('tds', function (data) {
        console.log(data);
        var id = data._id;
        if (data._val <= 4500) {
            try {
                console.log("Status Pupuk Cair Anda Hampir Habis.\n")
                LastCheck(id,"Status Pupuk Cair Anda Hampir Habis. ("+data._val+"PPM)","tds","");
              
            } catch (error) {
                console.log(error)
            }
        }
        else {
 
        }

        if (clients.hasOwnProperty(id)) {
            io.to(clients[id]['id']).emit('tds', data);
            console.log(clients[id]['id']);
        } else {
            console.log("\nTarget Device Is Offline or Doesn't exist ");
        }

    });
    socket.on('wl', function (data) {
        console.log(data);
        var id = data._id;
        data._val = parseInt(data._val);

        if (data._val < 180) {
            console.log("panas");
    
            try {  
                LastCheck(id,"Bak Air Hampir Habis!! "+data._val+"%","wl","");
            } catch (error) {
                console.log(error)
            }
  
        }
        else {

        }

        if (clients.hasOwnProperty(id)) {


            io.to(clients[id]['id']).emit('wl', data);
            console.log(clients[id]['id']);
        } else {
            console.log("\nTarget Device (" + data.id + ") Is Offline or Doesn't exist ");
        }

    });
    socket.on('hum', function (data) {
        var id = data._id;
        if (clients.hasOwnProperty(id)) {

            io.to(clients[id]['id']).emit('hum', data);
            console.log(clients[id]['id']);
        } else {
            console.log("\nTarget Device Is Offline or Doesn't exist ");
        }

    });
    socket.on('createData', function (data) {
        if (currentData.hasOwnProperty(socket.nickname)) {
            currentData.push(data);
            console.log('\ndata Created');
        } else {
            currentData[socket.nickname] = data[socket.nickname];
            console.log('\ndata Updated\n');
        }
    });
    socket.on('currentData', function (data) {
        console.log(data);
        var id = data._id;
        var name = data._name;
        if (currentData.hasOwnProperty(id)) {
            currentData[id][name] = data;
            console.log('\ndata ' + name + ' updated\n');
        } else {
            console.log("\nTarget Device Is Offline or Doesn't exist ");
        }

    });
    socket.on('disconnect', function (data) {

        delete clients[socket.nickname];
        delete currentData[socket.nickname];

    });


    socket.on('rtemp', function (data) {
        console.log("\nkirim")
        console.log(data);
        console.log('\n\n' + "kirim ke arduino \n");
        if (data._val) {
            var boolean = true;
        }
        else if (!data._val) {
            var boolean = false;
        }
        socket.emit('rtemp', boolean);
        id = data._id;
        if (clients.hasOwnProperty(id)) {
            io.to(clients[id]['id']).emit('rtemp', boolean);
            console.log(clients[id]['id']);
        } else {
            console.log("\nTarget Device Is Offline or Doesn't exist ");
        }

    });
    
    socket.on('rwl', function (data) {
        console.log("\nkirim")
        console.log(data);
        console.log('\n\n' + "kirim ke arduino \n");
        if (data._val) {
            var boolean = true;
        }
        else if (!data._val) {
            var boolean = false;
        }
        socket.emit('rwl', boolean);
        id = data._id;
        if (clients.hasOwnProperty(id)) {
            io.to(clients[id]['id']).emit('rwl', boolean);
            console.log(clients[id]['id']);
        } else {
            console.log("\nTarget Device Is Offline or Doesn't exist ");
        }

    });

    // socket.on('resTemp', function (data) {
    //     console.log("response : " + data._val);
    //     var id = data._id;
    //     if (data._val == "true") {
    //         var Bolean = true;
    //     }
    //     else {
    //         var Bolean = false;
    //     }
    //     if (id in RelayTemp) {
    //         delete RelayTemp[id];
    //         RelayTemp[id] = Bolean;
    //         console.log("masuk if ini")
    //         console.log("lihat status : " + RelayTemp[id])

    //     } else {
    //         RelayTemp[id] = Bolean;
    //         console.log("masuk else ini")
    //         console.log("lihat status : " + RelayTemp[id])
    //     }

    //     console.log('\n\n');
    //     console.log(RelayTemp)
    //     console.log('\n\n' + id);
    //     if (data._val == "true") {
    //         var Bolean = true;
    //     }
    //     else {
    //         var Bolean = false;
    //     }
    //     if (clients.hasOwnProperty(id)) {
    //         io.to(clients[id]['id']).emit('resTemp', Bolean);
    //     } else {
    //         console.log("\nTarget Device Is Offline or Doesn't exist ");
    //     }
    // });

    socket.on('resTemp', function (data) {
        console.log("***************************\nTempppp");
        console.log("response : " + data._val);
        var id = data._id;
        if (data._val == "true") {
            var Bolean = true;
        }
        else {
            var Bolean = false;
        }
        if (id in RelayTemp) {
            delete RelayTemp[id];
            RelayTemp[id] = Bolean;
            console.log("masuk if ini")
            console.log("lihat status : " + RelayTemp[id])

        } else {
            RelayTemp[id] = Bolean;
            console.log("masuk else ini")
            console.log("lihat status : " + RelayTemp[id])
        }

        console.log('\n\n');
        console.log(RelayTemp)
        console.log('\n\n' + id);
        if (data._val == "true") {
            var Bolean = true;
        }
        else {
            var Bolean = false;
        }
        if (clients.hasOwnProperty(id)) {
            io.to(clients[id]['id']).emit('resTemp', Bolean);
        } else {
            console.log("\nTarget Device Is Offline or Doesn't exist ");
        }
    });

    socket.on('resWl', function (data) {
        console.log("response : " + data._val);
        var id = data._id;
        if (data._val == "true") {
            var Bolean = true;
        }
        else {
            var Bolean = false;
        }
        if (id in RelayWl) {
            delete RelayWl[id];
            RelayWl[id] = Bolean;
            console.log("masuk if ini")
            console.log("lihat status : " + RelayWl[id])

        } else {
            RelayWl[id] = Bolean;
            console.log("masuk else ini")
            console.log("lihat status : " + RelayWl[id])
        }

        console.log('\n\n');
        console.log(RelayWl)
        console.log('\n\n' + id);
        if (data._val == "true") {
            var Bolean = true;
        }
        else {
            var Bolean = false;
        }
        if (clients.hasOwnProperty(id)) {
            io.to(clients[id]['id']).emit('resWl', Bolean);
        } else {
            console.log("\nTarget Device Is Offline or Doesn't exist ");
        }
    });
 

    socket.on("checktemp", function (data) {
        console.log("checktemp : " + console.log(RelayTemp[id]));
        var id = data;

        //    console.log('\n\n' + id);
        if (clients.hasOwnProperty(id)) {
            io.to(clients[id]['id']).emit('checktemp', RelayTemp[id]);
            console.log("send to : " + id);
            console.log("status : " + RelayTemp[id]);
        } else {
            console.log("\nTarget Device Is Offline or Doesn't exist ");
        }
    });
    socket.on("checkwl", function (data) {
        console.log("checkwl : " + console.log(RelayWl[id]));
        var id = data;

        //    console.log('\n\n' + id);
        if (clients.hasOwnProperty(id)) {
            io.to(clients[id]['id']).emit('checkwl', RelayWl[id]);
            console.log("send to : " + id);
            console.log("status : " + RelayWl[id]);
        } else {
            console.log("\nTarget Device Is Offline or Doesn't exist ");
        }
    });
    socket.on("Mode", function (data) {
        var id = data._id;
        var val = '';
        console.log("\n\n" + val + "\n\n")
        if (data._val == "true") {
            val = true;
        }
        else {
            val = false;
        }
        // if (id in Mode) {
        //     console.log("masuk if mode");
        //     delete Mode[id];
            if (val) {
                io.to(clients['P' + id]['id']).emit('UbahMode', val);
                // io.to(clients['P' + id]['id']).emit('rtemp', false);
                // io.to(clients['P' + id]['id']).emit('rwl', false);
                // io.to(clients[id]['id']).emit('resWl', false);
                // io.to(clients[id]['id']).emit('resTemp', false);
                console.log("\nMode : ")
                console.log("********************")
                console.log("val : " + Mode[id] + " | SendUbahMode :" + val);
                console.log("********************")
            }
            else {
                // Mode[id] = false;
                // RelayWl[id] = false;
                // RelayTemp[id] = false;
                io.to(clients['P' + id]['id']).emit('UbahMode', val);
                console.log("\nMode : ")
                console.log("********************")
                console.log("val : " + Mode[id] + " | SendUbahMode :" + val);
                console.log("********************")

            }
           
        // }
        // else {
        //     console.log("masuk else mode");

        //     Mode[id] = val;

        // }
        if (clients.hasOwnProperty('P'+id)) {
            // io.to(clients[id]['id']).emit('checkmode', Mode[id]);
            console.log("send to : " +'P'+ id);
        } else {
            console.log("\nTarget Device Is Offline or Doesn't exist ");
        }
    });
    socket.on("ModeProto", function (data) {
        
        var id = data._id;
        console.log("\nmodeProto : ")
        console.log("********************")
        console.log(id)
        var val = '';
        console.log("\n\n" + data._val+ "\n\n")
        console.log("********************")
        if (data._val == "true") {
            val = true;
        }
        else {
            val = false;
        }
        if (id in Mode) {
            console.log("masuk if mode");
            delete Mode[id];
            Mode[id] = val;
            // if (val) {
            //     Mode[id] = val;
            //     io.to(clients[id]['id']).emit('checkmode', Mode[id]);
            //     // io.to(clients['P'+id]['id']).emit('UbahMode', true);
            // }
            // else {
            //     Mode[id] = val;
            //     io.to(clients[id]['id']).emit('checkmode', Mode[id]);
            //     // RelayWl[id] = false;
            //     // RelayTemp[id] = false;
            //     // io.to(clients['P'+id]['id']).emit('UbahMode', false);
            //     // io.to(clients['P'+id]['id']).emit('rtemp', false);
            //     // io.to(clients["P" + id]['id']).emit('resWl', false);
            //     // io.to(clients["P" + id]['id']).emit('resTemp', false);

            // }
            console.log("val : " + val + " | Mode :" + Mode[id]);
        }
        else {
            console.log("masuk else mode");
            Mode[id] = val;
            console.log("val : " + val + " | Mode :" + Mode[id]);
        }
        if (clients.hasOwnProperty(id)) {
            io.to(clients[id]['id']).emit('checkmode', Mode[id]);
            console.log("send to : " + id);
        } else {
            console.log("\nTarget Device Is Offline or Doesn't exist ");
        }
    });
    socket.on('NilaiWl', function (data) {
        console.log("\nkirim")
        console.log(data);
        console.log('\n\n' + "Ganti Nilai Wl \n");
        var id = data._id;
        if (clients.hasOwnProperty(id)) {
            NilaiWl[id] = data._val;
            console.log(NilaiWl[id])
            io.to(clients['P'+id]['id']).emit('NilaiWl', data._val);
        } else {
            console.log("\nTarget Device Is Offline or Doesn't exist ");
        }
    });
    socket.on('NilaiTemp', function (data) {
        console.log("\nkirim")
        console.log(data);
        console.log('\n\n' + "Ganti Nilai Temp \n"+data._val);
        var id = data._id;
        if (clients.hasOwnProperty(id)) {
            NilaiTemp[id] = data._val;
            console.log(NilaiTemp[id])
            io.to(clients['P'+id]['id']).emit('NilaiTemp', data._val);
        } else {
            console.log("\nTarget Device Is Offline or Doesn't exist ");
        }
    });
    socket.on('NilaiTds', function (data) {
        console.log("\nkirim")
        console.log(data);
        console.log('\n\n' + "Ganti Nilai Tds \n");
        var id = data._id;
        if (clients.hasOwnProperty(id)) {
            // io.to(clients['P'+id]['id']).emit('NilaiWl', data._val);
            NilaiTds[id] = data._val;
        } else {
            console.log("\nTarget Device Is Offline or Doesn't exist ");
        }
    });
    socket.on('NilaiHum', function (data) {
        console.log("\nkirim")
        console.log(data);
        console.log('\n\n' + "Ganti Nilai Hum \n");
        var id = data._id;
        if (clients.hasOwnProperty(id)) {
            // io.to(clients['P'+id]['id']).emit('NilaiTemp', data._val);
            NilaiHum[id] = data._val;
        } else {
            console.log("\nTarget Device Is Offline or Doesn't exist ");
        }
    });

    socket.on('Tanaman', function (data) {
        console.log('\n\n' + "Update Tanaman \n");
        var id = data._id;
        var nama = data.nama;
        var value = data.value;
        updateTanaman(nama,value,id);
        if (clients.hasOwnProperty(id)) {
            // io.to(clients['P'+id]['id']).emit('NilaiTemp', data._val);
        } else {
            console.log("\nTarget Device Is Offline or Doesn't exist ");
        }
    });

    socket.on("checkmode", function (data) {

        var id = data;
        console.log("checkmode : " + console.log(Mode[id]));
        //    console.log('\n\n' + id);
        if (clients.hasOwnProperty(id)) {
            io.to(clients[id]['id']).emit('checkmode', Mode[id]);
            console.log("send to : " + id);
        } else {
            console.log("\nTarget Device Is Offline or Doesn't exist ");
        }
    });
    
    socket.on("setting", function (data) {

        var id = data;
        if (clients.hasOwnProperty(id)) {
            io.to(clients[id]['id']).emit('setting', {
                Wl:NilaiWl[id],
                Temp:NilaiTemp[id],
                Tds:NilaiTds[id],
                Hum:NilaiHum[id]
            } );
            console.log("send to : " + id);
            console.log(NilaiWl[id])
            console.log(NilaiTemp[id])
        } else {
            console.log("\nTarget Device Is Offline or Doesn't exist ");
        }
    });

});


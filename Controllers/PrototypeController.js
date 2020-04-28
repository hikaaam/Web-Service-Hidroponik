'use strict';
var db = 'ta20_Hidroponik';
var uname = 'ta20_lulusbareng';
var pw = 'Kudululus2020';
var TableName = 'prototype';
var mysql= require('mysql');
  var con = mysql.createConnection({
    host: "localhost",
    database: 'hidroponik',
    user: "root",
    password: ""
  });
  
  con.connect(function(err) {
    if (err) throw err;
    // console.log("Connected!");
  }); 

function msg(message){
    var status=[
        {
            'email':message,
        }
      ]
      return status;
}


//code start here

var fs = require('fs');

exports.find = function(req,res) {
  try {

    con.query('select * FROM '+TableName+" where prototype_id = ? ",req.query.id, function (err, result) {  
      if (err) throw err;
  
  res.json(result);
    });
  } catch (error) {
    console.log(error)
  }

};

exports.create = function(req, res) {
    var data= [
        'prototype_id',
        'status'
    ];
    var reqData=[
        "'"+req.body.prototype_id+"'",
        "'"+req.body.status+"'"
    ]
    var id = req.body.prototype_id;
    var msge = ''
    con.query('select protoype_id from prototype where protoype_id = '+id,
    function(err,result){
      if(err){
        msge = 'Error su'
      }
      msge = result;
    }
    )
    // if(req.body.prototype_id === '' || req.body.full_name === '' 
    // || req.body.phone_number === '' || req.body.address === '' 
    // || req.body.email === '' || req.body.password === '' 
    // ){
    //   res.send(msg('Please Fill Your Regestration Form'))
    // }
    // else if(msge === ''){
    //   res.send(msg('Your Prototype Id Is Not Recognized'))
    // }
    // else{
    var query= 'insert into '+TableName+' ('+data+') values ('+reqData+')';
con.query(query, function (err, result) {  
    if (err) throw err;
res.json(result);
  });
// }
// res.send(query);
};


exports.index = function(req,res) {
   fs.readFile('public/prototype.html',null,function(err,data){
    if(err){
      res.write(err);
    }
    else{
     res.write(data);
    }
    res.end();
   });

    };


exports.update_a_task = function(req, res) {
  Task.findOneAndUpdate({_id: req.params.taskId}, req.body, {new: true}, function(err, task) {
    if (err)
      res.send(err);
    res.json(task);
  });
};


exports.delete_a_task = function(req, res) {


  Task.remove({
    _id: req.params.taskId
  }, function(err, task) {
    if (err)
      res.send(err);
    res.json({ message: 'Task successfully deleted' });
  });
};
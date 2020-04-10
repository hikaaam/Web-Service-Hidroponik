'use strict';

var TableName = 'Table_users';
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

exports.all = function(req,res) {
con.query('select * FROM '+TableName, function (err, result) {  
    if (err) throw err;

res.json(result);
  });
};

exports.create = function(req, res) {
    var data= [
        'prototype_id',
        'full_name',
        'phone_number',
        'address',
        'email',
        'password',
    ];
    var reqData=[
        "'"+req.body.prototype_id+"'",
        "'"+req.body.full_name+"'",
        "'"+req.body.phone_number+"'",
        "'"+req.body.address+"'",
        "'"+req.body.email+"'",
        "'"+req.body.password+"'"
    ]
    var id = req.body.prototype_id;
  
    
    if(req.body.prototype_id === '' || req.body.full_name === '' 
    || req.body.phone_number === '' || req.body.address === '' 
    || req.body.email === '' || req.body.password === '' 
    ){
      res.send(msg('Please Fill Your Regestration Form'));
    }    
    else{
      con.query("select prototype_id from prototype where prototype_id = '"+id+"'",
      function(err,result){
        if(err){
         res.send(msg(err));
        }
       if(result.length < 1){
         res.send(msg('Prototype Id Doesnt exist'))
       }
      else{
      var query1 = 'select email from '+TableName+" where email = '"+req.body.email+"'";
      con.query(query1,function(err,result){
        if (err){
          res.send(msg(err));
        }
        else{
          if(result.length < 1){
            var query= 'insert into '+TableName+' ('+data+') values ('+reqData+')';
            con.query(query, function (err, result) {  
                if (err) throw err;
            res.send(req.body)
              });
        
          }
          else{
            res.send(msg('there is an account with this email'))
          } 
        }
      });
    }
  }

  );
}

};


exports.find = function(req,res) {
 
    var query= "select * FROM "+TableName+" where email = '"+req.params.id+"'";
    con.query(query, function (err, result) {  
        if (err) throw err;
    if(result.length>0){ 
    res.json(result);
    }
    else{
        res.send(msg('There is no account with this email'))
    }
      });
    // res.send(msg(query)); 
    };

 exports.login = function(req,res) {
      var id = req.body.id;
      var pw = req.body.pw;
      var query= "select * FROM "+TableName+" where email = '"+id+"' and password = '"+pw+"'";
      con.query(query, function (err, result) {  
          if (err) throw err;
      if(result.length>0){ 
      // res.json(result);
      res.redirect('../prototype/'+id);
      }
      else{
        res.redirect('back');
          // res.send(msg('There is no account with this email'))
      }
        });
      // res.send(msg(query)); 
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
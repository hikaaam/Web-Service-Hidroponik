'use strict';

var TableName = 'Table_users';
var mysql = require('mysql');
var con = mysql.createConnection({
  host: "localhost",
  database: 'hidroponik',
  user: "root",
  password: ""
});

con.connect(function (err) {
  if (err) throw err;
  // console.log("Connected!");
});

function msg(message) {
  var status = [{
    'email': message,
  }]
  return status;
}
var dateFormat = require('dateformat');
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'hidroponikapps@gmail.com',
    pass: 'cbyllupwoiukkyxm'
  }
});



//code start here

var fs = require('fs');

exports.all = function (req, res) {
  con.query('select * FROM ' + TableName, function (err, result) {
    if (err) throw err;

    res.json(result);
  });
};

exports.create = function (req, res) {
  var data = [
    'full_name',
    'phone_number',
    'address',
    'email',
    'password',
  ];
  var reqData = [
    "'" + req.body.full_name + "'",
    "'" + req.body.phone_number + "'",
    "'" + req.body.address + "'",
    "'" + req.body.email + "'",
    "'" + req.body.password + "'"
  ];

  if (req.body.full_name === '' ||
    req.body.phone_number === '' || req.body.address === '' ||
    req.body.email === '' || req.body.password === ''
  ) {
    res.send(msg('Please Fill Your Regestration Form'));
  } else {
    var query1 = 'select email from ' + TableName + " where email = '" + req.body.email + "'";
    con.query(query1, function (err, result) {
      if (err) {
        res.send(msg(err));
      } else {
        if (result.length < 1) {
          var query = 'insert into ' + TableName + ' (' + data + ') values (' + reqData + ')';
          con.query(query, function (err, result) {
            if (err) throw err;
            res.send(req.body)
          });

        } else {
          res.send(msg('there is an account with this email'))
        }
      }
    });

  }

};


exports.find = function (req, res) {

  var query = "select * FROM " + TableName + " where email = '" + req.params.id + "'";
  con.query(query, function (err, result) {
    if (err) throw err;
    if (result.length > 0) {
      res.json(result);
    } else {
      res.send(msg('There is no account with this email'))
    }
  });
  // res.send(msg(query)); 
};

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
exports.otp = function (req, res) {
 
  var code = getRandomInt(99999);
  var target = req.body.email;
  console.log('asking for otp...');
  console.log(target)
  let date_ob = new Date();
  var datefrmt = dateFormat(date_ob, "dd, mmmm yyyy HH:MM");
  var mailOptions = {
    from: 'hidroponikapps@gmail.com',
    // from: 'noreply@hidropnik.com',
    to: target,
    subject: 'Hidroponik App '+"["+code+"]",
    html: '<html lang="en">  <head>    <meta charset="UTF-8"> <meta name="viewport" content="width=device-width, initial-scale=1.0">  <title>Kirim Email</title>    <style> body{   margin-left: auto;  margin-right: auto; text-align: center; background-color: #eee;  } p{  font-family: monospace; font-size: large; color:#111;  }   h1{font-family: monospace;color: blue;  }</style> </head> <body><p>'+datefrmt+'</p> <p>Your OTP Password Is :</p>    <h1>' + code + '</h1>  <p>Do not Share This Password To Anyone!!</p> </body>  </html> '
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      res.json({
        'error': error,
        'code': code,
        'target': target
      });
    } else {
      // console.log('Email sent: ' + info.response);
      res.json(code);
    }
  });
  // res.json(datefrmt);
}
exports.login = function (req, res) {
  var id = req.body.id;
  var pw = req.body.pw;
  var query = "select * FROM " + TableName + " where email = '" + id + "' and password = '" + pw + "'";
  con.query(query, function (err, result) {
    if (err) throw err;
    if (result.length > 0) {
      // res.json(result);
      res.redirect('../prototype/' + id);
    } else {
      res.redirect('back');
      // res.send(msg('There is no account with this email'))
    }
  });
  // res.send(msg(query)); 
};


exports.update_a_task = function (req, res) {
  Task.findOneAndUpdate({
    _id: req.params.taskId
  }, req.body, {
    new: true
  }, function (err, task) {
    if (err)
      res.send(err);
    res.json(task);
  });
};


exports.delete_a_task = function (req, res) {


  Task.remove({
    _id: req.params.taskId
  }, function (err, task) {
    if (err)
      res.send(err);
    res.json({
      message: 'Task successfully deleted'
    });
  });
};
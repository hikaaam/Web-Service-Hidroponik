'use strict';
module.exports = function (app) {
  var usersCon = require('../controllers/UserController');
  var ProtoCon = require('../Controllers/PrototypeController');
  var HomeCon = require('../Controllers/HomeController');

  // todoList Routes
  app.route('/users')
    .get(usersCon.all)
    .post(usersCon.create);


  app.route('/users/:id')
    .get(usersCon.find)
    .put(usersCon.update_a_task)
    .delete(usersCon.delete_a_task)
    .post(usersCon.login);

  app.route('/prototype')
    .get(ProtoCon.all)
    .post(ProtoCon.create);
  app.route('/prototype/:id')
    .get(ProtoCon.find)
    .put(ProtoCon.update_a_task)
    .delete(ProtoCon.delete_a_task);
  app.route('/').get(HomeCon.home);
};
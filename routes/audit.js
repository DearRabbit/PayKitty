var express = require('express');
var path = require('path');

//var conn = require('../database/connect');
var router = express.Router();

router.use(express.static(path.join(__dirname, '../public')));
router.use(function(req, res, next) {
  if (!req.session.user && req.url != "/login") {
    return res.redirect('./login');
  }
  next();
});

router.get('/login', function(req, res, next) {
  var loginFailFlag = false;
  if (req.session.loginFailFlag == true) {
    loginFailFlag = true;
    req.session.loginFailFlag = false;
  }
  res.render('audit_login', { title: 'Login', login_fail: loginFailFlag});
});

router.post('/login', function(req, res, next) {
  var testCase = {
    username: 'admin',
    password: 'admin',
  };
  if(req.body.username === testCase.username && req.body.password === testCase.password){
    req.session.user = testCase.username;
    return res.redirect('./home');
  } else {
    req.session.loginFailFlag = true;
    req.session.user = null;
    return res.redirect('./login');
  }
});

router.get('/logout', function(req, res) {
  req.session.user = null;
  return res.redirect('./login');
});

router.get('/home', function(req, res, next) {
  var data = [
  {id: 0, buyer: 'buy01', seller: 'sell01', money: 10.02},
  {id: 1, buyer: 'buy02', seller: 'sell01', money: 9999.99},
  {id: 2, buyer: 'buy02', seller: 'sell02', money: 0.01},
  ];
  res.render('audit_home', { title: 'Home', data: data } );
});

router.get('/archive', function(req, res, next) {
  res.render('audit_archive', { title: 'Archive'} );
});

router.get('/log', function(req, res, next) {
  res.render('audit_log', { title: 'Log'} );
});

module.exports = router;

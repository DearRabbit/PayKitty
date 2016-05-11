var express = require('express');
var path = require('path');
var router = express.Router();

router.use(express.static(path.join(__dirname, '../public')));
router.use(function(req, res, next) {
  console.log('Hello');
  next();
});

router.get('/login', function(req, res, next) {
  res.render('audit_login', { title: 'Login'});
});

module.exports = router;

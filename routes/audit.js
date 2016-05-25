var express = require('express');
var path = require('path');

var conn = require('../database/connect');
var router = express.Router();

var data = [
  {id: 0, date: '2016-5-18', buyer: 'buy01', seller: 'sell01', status: '未发货', money: 10.02, b2a: 10.02, a2s: 10.02},
  {id: 1, date: '2016-5-18', buyer: 'buy02', seller: 'sell01', status: '已发货', money: 9999.99, b2a: 9999.99, a2s: 9999.99},
  {id: 2, date: '2016-5-18',buyer: 'buy02', seller: 'sell02', status: '已收货', money: 0.01, b2a: 0.01, a2s: 0.01},
  {id: 3, date: '2016-5-18',buyer: 'buy02', seller: 'sell02', status: '已收货', money: 0.01, b2a: 0.01, a2s: 0.01},
  {id: 4, date: '2016-5-18',buyer: 'buy02', seller: 'sell02', status: '已收货', money: 0.01, b2a: 0.01, a2s: 0.01},
  {id: 5, date: '2016-5-18',buyer: 'buy02', seller: 'sell02', status: '已收货', money: 0.01, b2a: 0.01, a2s: 0.01},
  {id: 6, date: '2016-5-18',buyer: 'buy02', seller: 'sell02', status: '已收货', money: 0.01, b2a: 0.01, a2s: 0.01},
  {id: 7, date: '2016-5-18',buyer: 'buy02', seller: 'sell02', status: '已收货', money: 0.01, b2a: 0.01, a2s: 0.01},
  {id: 8, date: '2016-5-18',buyer: 'buy02', seller: 'sell02', status: '已收货', money: 0.01, b2a: 0.01, a2s: 0.01},
  {id: 9, date: '2016-5-18',buyer: 'buy02', seller: 'sell02', status: '已收货', money: 0.01, b2a: 0.01, a2s: 0.01},
  {id: 10, date: '2016-5-19',buyer: 'buy02', seller: 'sell02', status: '已收货', money: 0.01, b2a: 0.01, a2s: 0.01},
  {id: 11, date: '2016-5-19',buyer: 'buy02', seller: 'sell01', status: '已发货', money: 9999.99, b2a: 9999.99, a2s: 9999.99},
  {id: 12, date: '2016-5-19',buyer: 'buy02', seller: 'sell02', status: '已收货', money: 0.01, b2a: 1.01, a2s: 0.01},
  {id: 13, date: '2016-5-19',buyer: 'buy02', seller: 'sell02', status: '已收货', money: 0.01, b2a: 0.01, a2s: 1.01},
  {id: 14, date: '2016-5-19',buyer: 'buy02', seller: 'sell02', status: '已收货', money: 0.01, b2a: 0.01, a2s: 0.01},
  {id: 15, date: '2016-5-19',buyer: 'buy02', seller: 'sell02', status: '已收货', money: 0.01, b2a: 0.01, a2s: 0.01},
  {id: 16, date: '2016-5-19',buyer: 'buy02', seller: 'sell02', status: '已收货', money: 0.01, b2a: 0.01, a2s: 0.01},
  {id: 17, date: '2016-5-19',buyer: 'buy02', seller: 'sell02', status: '已收货', money: 0.01, b2a: 0.01, a2s: 0.01},
  {id: 18, date: '2016-5-19',buyer: 'buy02', seller: 'sell02', status: '已收货', money: 0.01, b2a: 0.01, a2s: 0.01},
  {id: 19, date: '2016-5-19',buyer: 'buy02', seller: 'sell02', status: '已收货', money: 0.01, b2a: 0.01, a2s: 0.01},
  {id: 20, date: '2016-5-19',buyer: 'buy02', seller: 'sell02', status: '已收货', money: 0.01, b2a: 0.01, a2s: 0.01},
  {id: 21, date: '2016-5-19',buyer: 'buy02', seller: 'sell02', status: '已收货', money: 0.01, b2a: 0.01, a2s: 0.01},
  {id: 22, date: '2016-5-19',buyer: 'buy02', seller: 'sell02', status: '已收货', money: 0.01, b2a: 0.01, a2s: 0.01},
];
var log = [
  {id: 0, modifyTime: '2016-01-10', msg: '买家付款金额: 100元 -> 400元'},
  {id: 1, modifyTime: '2016-01-11', msg: '卖家收款金额: 100元 -> 400元'},
  {id: 2, modifyTime: '2016-01-12', msg: '订单状态修改: 已付款 -> 未付款'},
];

var sqlSet =  {
  auditUser: "select Password_md5, Salt from managers where user = ? and ManagerType = 3",
  queryByDate: "select xx from xx_table where time = ?",
  queryByDateRange: "select xx from xx_table where time < ? and time > ?",

  queryTest: "select * from UserAccount",
};
var limit = 5000;

router.use(express.static(path.join(__dirname, '../public')));
router.use(function(req, res, next) {
  if (!req.session.auditUser && req.url != "/login") {
    return res.redirect('./login');
  }
  next();
});

router.get('/login', function(req, res, next) {
  var loginFailFlag = false;
  if (req.session.auditLoginFail == true) {
    loginFailFlag = true;
    req.session.auditLoginFail = false;
  }
  res.render('audit_login', { title: 'Login', login_fail: loginFailFlag});
});

router.post('/login', function(req, res, next) {
  var loginFailFlag = false;
  conn.getConnection(function (err, conn) {
    if (err) console.log("POOL ==> " + err);

    conn.query(sqlSet.auditUser, [req.body.username], function(err,rows){
      if (err) {
        console.log(err);
      }
      // TODO: fix validation
      else if (!rows && rows[0].Password_md5 == req.body.password) {
        console.log(rows);
        loginFailFlag = true;
      }
      conn.release();
    });
  });
  // query user from db
  // select username, salt, pwd from xxx_table where username == xxx;
  if(loginFailFlag){
    req.session.auditUser = req.body.username;
    return res.redirect('./home');
  } else {
    req.session.auditLoginFail = true;
    req.session.auditUser = null;
    return res.redirect('./login');
  }
});

router.get('/logout', function(req, res) {
  req.session.auditUser = null;
  return res.redirect('./login');
});

router.get('/home', function(req, res, next) {
  var d = new Date();
  var localstring = d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();

  var localdata = [];
  var cnt = 0;

  for (var i in data){
    if (data[i].b2a != data[i].money || data[i].a2s != data[i].money) {
      data[i].audit = "错误";
    }
    else if (data[i].money > limit) {
      data[i].audit = "警告";
    }
    else {
      data[i].audit = "正常";
    }
    if (data[i].date == localstring){
      localdata[cnt] = data[i];
      cnt++;
    }
  }
  res.render('audit_home', { title: 'Home', data: localdata,  date: localstring} );
});

router.get('/archive', function(req, res, next) {
  res.render('audit_archive', { title: 'Archive', data: data } );
});

router.get('/log', function(req, res, next) {
  res.render('audit_log', { title: 'Log', data: log } );
});

router.get('/profile', function(req, res, next) {
  res.render('audit_profile', { title: 'Profile'} );
});

router.get('/settings', function(req, res, next) {
  var placeholder = limit;
  if (placeholder < 0) {
    minValue = -1;
  } else {
    minValue = placeholder;
  }
  res.render('audit_settings', { title: 'Settings', minValue: minValue} );
});

router.get('/getInfo', function(req, res, next) {
  var infoData;
  for (var i in data) {
    if (data[i].id == req.query.id) {
      infoData = data[i];
      if (infoData.b2a != infoData.money || infoData.a2s != infoData.money) {
        infoData.audit = "错误: 金额不等";
      }
      else if (infoData.money > limit) {
        infoData.audit = "警告: 金额过大";
      }
      else {
        infoData.audit = "正常";
      }
    }
  }
  res.render('audit_info', { title: 'Settings', info: infoData} );
});

router.post('/getInfo', function(req, res, next) {
  var infoData;

  // change
  for (var i in data) {
    if (data[i].id == req.body.id) {
      data[i].money = req.body.money;
      data[i].b2a = req.body.b2a;
      data[i].a2s = req.body.a2s;
      infoData = data[i];
    }
  }
  // query:
  // select id,xxxx,xxxx from xx_table where id = xxx;
  res.render('audit_info', { title: 'Settings', info: infoData} );
});

router.get('/test', function(req, res, next) {

  conn.getConnection(function (err, conn) {
    if (err) console.log("POOL ==> " + err);

    conn.query(sqlSet.queryTest, function(err,rows){
      if (err) {
        console.log(err);
      }
      else {
        if (rows) {
          console.log('no result');
        }
        else {
          console.log(rows);
        }
      }
      conn.release();
    });
  });
});

module.exports = router;

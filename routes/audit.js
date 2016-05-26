var express = require('express');
var path = require('path');
var http = require('http');

var conn = require('../database/connect');
var router = express.Router();

var data = [
  {id: 0, date: '2016-05-18',buyer: 'buy01', seller: 'sell01', status: '未发货', money: 10.02, b2a: 10.02, a2s: 10.02},
  {id: 1, date: '2016-05-18',buyer: 'buy02', seller: 'sell01', status: '已发货', money: 9999.99, b2a: 9999.99, a2s: 9999.99},
  {id: 2, date: '2016-05-18',buyer: 'buy02', seller: 'sell02', status: '已收货', money: 0.01, b2a: 0.01, a2s: 0.01},
  {id: 3, date: '2016-05-18',buyer: 'buy02', seller: 'sell02', status: '已收货', money: 0.01, b2a: 0.01, a2s: 0.01},
  {id: 4, date: '2016-05-18',buyer: 'buy02', seller: 'sell02', status: '已收货', money: 0.01, b2a: 0.01, a2s: 0.01},
  {id: 5, date: '2016-05-18',buyer: 'buy02', seller: 'sell02', status: '已收货', money: 0.01, b2a: 0.01, a2s: 0.01},
  {id: 6, date: '2016-05-18',buyer: 'buy02', seller: 'sell02', status: '已收货', money: 0.01, b2a: 0.01, a2s: 0.01},
  {id: 7, date: '2016-05-18',buyer: 'buy02', seller: 'sell02', status: '已收货', money: 0.01, b2a: 0.01, a2s: 0.01},
  {id: 8, date: '2016-05-18',buyer: 'buy02', seller: 'sell02', status: '已收货', money: 0.01, b2a: 0.01, a2s: 0.01},
  {id: 9, date: '2016-05-18',buyer: 'buy02', seller: 'sell02', status: '已收货', money: 0.01, b2a: 0.01, a2s: 0.01},
  {id: 10, date: '2016-05-19',buyer: 'buy02', seller: 'sell02', status: '已收货', money: 0.01, b2a: 0.01, a2s: 0.01},
  {id: 11, date: '2016-05-19',buyer: 'buy02', seller: 'sell01', status: '已发货', money: 9999.99, b2a: 9999.99, a2s: 9999.99},
  {id: 12, date: '2016-05-19',buyer: 'buy02', seller: 'sell02', status: '已收货', money: 0.01, b2a: 1.01, a2s: 0.01},
  {id: 13, date: '2016-05-19',buyer: 'buy02', seller: 'sell02', status: '已收货', money: 0.01, b2a: 0.01, a2s: 1.01},
  {id: 14, date: '2016-05-19',buyer: 'buy02', seller: 'sell02', status: '已收货', money: 0.01, b2a: 0.01, a2s: 0.01},
  {id: 15, date: '2016-05-19',buyer: 'buy02', seller: 'sell02', status: '已收货', money: 0.01, b2a: 0.01, a2s: 0.01},
  {id: 16, date: '2016-05-19',buyer: 'buy02', seller: 'sell02', status: '已收货', money: 0.01, b2a: 0.01, a2s: 0.01},
  {id: 17, date: '2016-05-19',buyer: 'buy02', seller: 'sell02', status: '已收货', money: 0.01, b2a: 0.01, a2s: 0.01},
  {id: 18, date: '2016-05-19',buyer: 'buy02', seller: 'sell02', status: '已收货', money: 0.01, b2a: 0.01, a2s: 0.01},
  {id: 19, date: '2016-05-19',buyer: 'buy02', seller: 'sell02', status: '已收货', money: 0.01, b2a: 0.01, a2s: 0.01},
  {id: 20, date: '2016-05-19',buyer: 'buy02', seller: 'sell02', status: '已收货', money: 0.01, b2a: 0.01, a2s: 0.01},
  {id: 21, date: '2016-05-19',buyer: 'buy02', seller: 'sell02', status: '已收货', money: 0.01, b2a: 0.01, a2s: 0.01},
  {id: 22, date: '2016-05-25',buyer: 'buy02', seller: 'sell02', status: '已收货', money: 0.01, b2a: 0.01, a2s: 0.01},
];

var sqlSet =  {
  auditUser: "select Password_md5, Salt from managers where AccountName = ? and ManagerType = 3",
  auditUserPro: "select * from managers where AccountName = ?",
  auditLog: "select * from modifyLog",

  addAuditLog: "insert into modifyLog values(?, ?, ?)",
};

var limit = 5000;
var startTimeFix = '00:00:00';
var endTimeFix = '23:59:59';

function presentation(data) {
  data[0] += 1;
  return data;
}

Date.prototype.format = function(format)
{
  var o =
  {
    "M+" : this.getMonth()+1, //month
    "d+" : this.getDate(),    //day
    "h+" : this.getHours(),   //hour
    "m+" : this.getMinutes(), //minute
    "s+" : this.getSeconds(), //second
    "q+" : Math.floor((this.getMonth()+3)/3),  //quarter
    "S" : this.getMilliseconds() //millisecond
  }
  if(/(y+)/.test(format))
    format=format.replace(RegExp.$1,(this.getFullYear()+"").substr(4 - RegExp.$1.length));
  for(var k in o)
    if(new RegExp("("+ k +")").test(format))
      format = format.replace(RegExp.$1,RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
  return format;
}

router.use(express.static(path.join(__dirname, '../public')));

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
    if (err) {
      console.log("POOL ==> " + err);
    }

    else {
      conn.query(sqlSet.auditUser, [req.body.username], function(err,rows){
        if (err) {
          console.log(err);
        }
        // TODO: fix validation
        else if (rows && rows[0].Password_md5 == req.body.password) {
          loginFailFlag = true;
        }
        console.log(rows);
        conn.release();

        if(loginFailFlag){
          req.session.auditUser = req.body.username;
          return res.redirect('./home');
        } else {
          req.session.auditLoginFail = true;
          req.session.auditUser = null;
          return res.redirect('./login');
        }
      });
    }
  });
});

router.get('/logout', function(req, res) {
  req.session.auditUser = null;
  return res.redirect('./login');
});

router.get('/home', function(req, res, next) {
  var d = new Date();
  d.setDate(d.getDate()-1);
  var localstring = d.format("yyyy-MM-dd");
  var startTime = localstring + startTimeFix;
  var endTime = localstring + endTimeFix;

  // for (var i in data) {
  //   data[i].b2a = data[i].orderAmount;
  //   data[i].a2s = data[i].orderAmount;
  // }
  // presentation(data);

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
      cnt ++;
    }
  }

  return res.render('audit_home', { title: 'Home', username: req.session.auditUser, data: localdata, date: localstring} );
});

router.get('/archive', function(req, res, next) {
  res.render('audit_archive', { title: 'Archive', username: req.session.auditUser, data: data } );
});

router.get('/log', function(req, res, next) {
  conn.getConnection(function (err, conn) {
    if (err) {
      console.log("POOL ==> " + err);
    }

    else {
      conn.query(sqlSet.auditLog, function(err,rows){
        if (err) {
          console.log(err);
        }
        // TODO: fix validation
        console.log(rows);
        conn.release();

        return res.render('audit_log', { title: 'Log', username: req.session.auditUser, data: rows });
      });
    }
  });

});

router.get('/profile', function(req, res, next) {
  conn.getConnection(function (err, conn) {
    if (err) {
      console.log("POOL ==> " + err);
    }

    else {
      conn.query(sqlSet.auditUserPro, [req.session.auditUser], function(err,rows){
        if (err) {
          console.log(err);
        }
        // TODO: fix validation
        else {
          var profile = rows[0];
        }
        console.log(rows);
        conn.release();

        return res.render('audit_profile', { title: 'Profile', username: req.session.auditUser, profile: profile} );
      });
    }
  });
});

router.get('/settings', function(req, res, next) {
  var placeholder = limit;
  if (placeholder < 0) {
    minValue = -1;
  } else {
    minValue = placeholder;
  }
  res.render('audit_settings', { title: 'Settings', username: req.session.auditUser, minValue: minValue} );
});

router.post('/settings', function(req, res, next) {
  if (req.body.min)
    limit = req.body.min;
  else
    limit = 1;
  return res.redirect('./settings');
});

router.get('/getInfo', function(req, res, next) {
  var infoData;
  for (var i in data) {
    if (data[i].id == req.query.id) {
      infoData = data[i];
      if (infoData.b2a != infoData.money || infoData.a2s != infoData.money) {
        infoData.auditInfo = "错误: 金额不等";
      }
      else if (infoData.money > limit) {
        infoData.auditInfo = "警告: 金额过大";
      }
      else {
        infoData.auditInfo = "正常";
      }
    }
  }
  res.render('audit_info', { title: 'Settings', username: req.session.auditUser, info: infoData} );
});

router.post('/getInfo', function(req, res, next) {
  var infoData;
  var msg = "";
  // change
  for (var i in data) {
    if (data[i].id == req.query.id) {
      console.log()
      if (req.body.money) {
        msg += ("商品金额: " + data[i].money + "元 -> " + req.body.money + "元");
        data[i].money = req.body.money;
      }
      if (req.body.b2a) {
        msg += ("买家付款金额: " + data[i].b2a + "元 -> " + req.body.b2a + "元");
        data[i].b2a = req.body.b2a;
      }
      if (req.body.a2s) {
        msg += ("卖家收款金额: " + data[i].a2s + "元 -> " + req.body.a2s + "元");
        data[i].a2s = req.body.a2s;
      }

      infoData = data[i];

      conn.getConnection(function (err, conn) {
        if (err) {
          console.log("POOL ==> " + err);
        }

        else {
          conn.query(sqlSet.addAuditLog, [req.query.id, new Date(), msg], function(err,rows){
            if (err) {
              console.log(err);
            }
            // TODO: fix validation

            console.log(rows);
            conn.release();

            return res.redirect('./getInfo?id='+req.query.id);
          });
        }
      });
    }
  }
  // query:

});

module.exports = router;

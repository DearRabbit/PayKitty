var express = require('express');
var path = require('path');
var request = require("request");

var conn = require('../database/connect');
var router = express.Router();

var data = [];

var sqlSet =  {
  auditUser: "select Password_md5, Salt from managers where AccountName = ? and ManagerType = 3",
  auditUserPro: "select * from managers where AccountName = ?",
  auditLog: "select * from modifyLog",

  addAuditLog: "insert into modifyLog values(?, ?, ?)",
};

var state = ["待付款", "待商家确认", "已发货", "已收货", "交易关闭", "待退款", "已退款", "退款失败"];

var limit = 4000;
var itemMax = 100;
var startTimeFix = '00:00:00';
var endTimeFix = '23:59:59';

function presentation() {
  var options = { url: 'http://121.42.175.1/a2/api/getorderlistbydate?start=2010-01-01%2000%3A00%3A00&end=2017-01-01%2023%3A59%3A59'};
  request.get(options, function(err,httpResponse,body){
    if (!err) {
      var orderlist = JSON.parse(body).orderIdList;
      for (var i in orderlist) {
        data[i] = {
          id: orderlist[i].orderID,
          date : orderlist[i].orderTime,
          buyer : orderlist[i].buyer,
          seller : orderlist[i].seller,
          money : orderlist[i].orderAmount,
          item : JSON.parse(orderlist[i].orderItems),
          status : state[orderlist[i].orderStatus],
        }
        switch (orderlist[i].orderStatus) {
          case 0: case 6:
            data[i].b2a = 0;
            data[i].a2s = 0;
            break;
          case 1: case 2:
            data[i].b2a = orderlist[i].orderAmount;
            data[i].a2s = 0;
            break;
          default:
            data[i].b2a = orderlist[i].orderAmount;
            data[i].a2s = orderlist[i].orderAmount;
            break;
        }
      }
    }
  });
}

function validate() {
  for (var i in data) {
    if (data[i].b2a != data[i].money || (data[i].status != state[0] && data[i].status != state[6])) {
      data[i].audit = "错误";
      data[i].warning = "金额不等";
    }
    else if (data[i].a2s != data[i].money || (data[i].status != state[1] && data[i].status != state[2])) {
      data[i].audit = "错误";
      data[i].warning = "金额不等";
    }
    else if (data[i].money > limit ) {
      data[i].audit = "警告";
      data[i].warning = "金额过大";
    }
    else if (data[i].item.length > itemMax ) {
      data[i].audit = "警告";
      data[i].warning = "商品数量过多";
    }
    else {
      data[i].audit = "正常";
      data[i].warning = "";
    }
  }
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
    if (err) {
      console.log("POOL ==> " + err);
    }

    else {
      conn.query(sqlSet.auditUser, [req.body.username], function(err,rows){
	if (err) {
          console.log(err);
        }
        // TODO: fix validation
        else if (rows[0] && rows[0].Password_md5 == req.body.password) {
          loginFailFlag = true;
        }
	console.log(rows);
        conn.release();

        if(loginFailFlag){
          req.session.auditUser = req.body.username;
          presentation();
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
  data = [];
  return res.redirect('./login');
});

router.get('/home', function(req, res, next) {
  var d = new Date();
  d.setDate(d.getDate()-1);
  var localstring = d.format("yyyy-MM-dd ");
  var startTime = localstring + startTimeFix;
  var endTime = localstring + endTimeFix;

  validate();

  var localdata = [];
  var cnt = 0;
  for (var i in data){
    if (data[i].date.split(" ")[0] == localstring){
      localdata[cnt] = data[i];
      cnt ++;
    }
  }

  return res.render('audit_home', { title: 'Home', username: req.session.auditUser, data: localdata, date: localstring} );
});

router.get('/archive', function(req, res, next) {
  validate();
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
  res.render('audit_settings', { title: 'Settings', username: req.session.auditUser, minValue: limit, maxItem: itemMax} );
});

router.post('/settings', function(req, res, next) {
  if (req.body.min)
    limit = req.body.min;
  if (req.body.maxItem)
    itemMax = req.body.maxItem;
  return res.redirect('./settings');
});

router.get('/getInfo', function(req, res, next) {
  var infoData;
  for (var i in data) {
    if (data[i].id == req.query.id) {
      infoData = data[i];
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

        else if (msg != "") {
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
});

module.exports = router;

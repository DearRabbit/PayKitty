var mysql = require('mysql');
var settings = require('./settings');

var conn = mysql.createPool(settings);

// sample

// conn.getConnection(function (err, conn) {
//     if (err) console.log("POOL ==> " + err);
//
//     conn.query(selectSQL,function(err,rows){
//         if (err) console.log(err);
//         console.log("SELECT ==> ");
//         for (var i in rows) {
//             console.log(rows[i]);
//         }
//         conn.release();
//     });
// });


module.exports = conn;
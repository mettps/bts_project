require('dotenv').config()
var mysql = require('mysql');
var connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  insecureAuth : true
});

connection.connect(function(err) {
      if (err) throw err;
      console.log("Connected!");
    });
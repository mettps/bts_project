var mysql = require('mysql');
var cors = require('cors');
var bodyParser = require('body-parser');
var express = require('express');
var app = express();
require('dotenv').config();


app.set('view engine', 'ejs');
app.use(cors());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// parse application/json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

var port = process.env.PORT || 3000;
var con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'database_bts'
});

app.get('/', function (req, res) {
  res.render('home', {
    title: 'Welcome to homepage BTS Helper Beta ver.0.1',
    message: 'BTS Helper is provided to help facilitate those who want to know the bus time, ticket price, the location of the BTS station'
  });
});

app.get('/index', function (req, res) {
  con.query("SELECT id_station, name_station FROM station ORDER BY name_station", function (err, rows, fields) {
    if (err) throw err;
    console.log(rows);
    res.render('index', {
      title: 'Select Station',
      message: 'Station list',
      rows: rows
    });
  });
});

var station = {
  name_station: "",
  surrounding: "",
  service: "",
  first_train_go: "",
  last_train_go: "",
  first_train_back: "",
  last_train_back: "",
  line_1: "",
  line_2: ""
};

var station1_order = "";
var station2_order = "";

var name_station_1 = "";
var name_station_2 = "";

app.get('/searching/:id_station', function (req, res) {
  var id_station = req.params.id_station;
  array_sur = [];
  array_ser = [];
  array_time = [];

  var sql_station = "SELECT name_station FROM station WHERE id_station = ? ";
  con.query(sql_station, id_station, function(err, rows, fields) {
    if (err) throw err;
    //console.log(rows);
    station.name_station = rows[0].name_station;
  });

  var sql_sur = "SELECT surrounding FROM station_surrounding WHERE Station_id_station = ?";
  con.query(sql_sur, id_station, function(err, rows, fields) {
    if (err) throw err;
    for (var i = 0; i < rows.length; i++) {
      array_sur.push(rows[i].surrounding);
    }
    station.surrounding = array_sur;
    //console.log(array_sur);
  });

  var sql_ser = "SELECT Service FROM station_service WHERE Station_id_station = ?";
  con.query(sql_ser, id_station, function(err, rows, fields) {
    if (err) throw err;
    for (var i = 0; i < rows.length; i++) {
      array_ser.push(rows[i].Service);
    }
    station.service = array_ser;
    //console.log(array_ser);
  });

  var sql_time = "SELECT first_train_line_1, last_train_line_1, first_train_line_2, last_train_line_2 FROM schedule_Train WHERE Station_id_station = ?";
  con.query(sql_time, id_station, function(err, rows, fields) {
    if (err) throw err;
    //console.log(rows[0].first_train_line_1);
    station.first_train_go = rows[0].first_train_line_1;
    station.last_train_go = rows[0].last_train_line_1;
    station.first_train_back = rows[0].first_train_line_2;
    station.last_train_back = rows[0].last_train_line_2;
  });


  var sql_time = "SELECT source FROM train WHERE Station_id_station = ?";
  con.query(sql_time, id_station, function(err, rows, fields) {
    if (err) throw err;
	console.log("tttt");
    station.line_1 = rows[0].source;
    console.log("00000");
	station.line_2 = rows[0].source;
	console.log("tttt");
  });

  res.render('station', {
    title: 'Detail Station: ' + station.name_station,
    station: station
  });
});
  
app.get('/price_ticket', function (req, res) {
  con.query("SELECT id_station, name_station FROM station", function (err, rows, fields) {
    if (err) throw err;
    res.render('price', {
      title: 'Select Station',
      message: 'Station list',
      rows: rows,
      message_cost: "",
      cost: "",
      cost_rabbit_senior_ticket: "",
      cost_rabbit_student_ticket: "",
      cost_rabbit_normal_ticket: ""
    });
  });
});

app.post('/calculate_price', function (req, res) {

  var total = 0;
  var mode = 0;

  var station1 = req.body.station1
  var station2 = req.body.station2

  // var price_1 = parseInt(req.body.station1);
  // var price_2 = parseInt(req.body.station2);

  var sql_station1 = "SELECT id_station, order_station, name_station FROM station WHERE id_station = ?";
  con.query(sql_station1, station1, function(err, rows, fields) {
    if (err) throw err;

    station1_order = rows[0].order_station;
    name_station_1 = rows[0].name_station;

    var sql_station2 = "SELECT id_station, order_station, name_station FROM station WHERE id_station = ?";
    con.query(sql_station2, station2, function(err, rows, fields) {
      if (err) throw err;

      station2_order = rows[0].order_station;
      name_station_2 = rows[0].name_station;

      station1_order = parseInt(station1_order);
      station2_order = parseInt(station2_order);

      if (station1[0] == station2[0]) {
        mode = 1;
        //console.log(mode);
      }else {
        mode = 2;
        //console.log(mode);
      }

      console.log(mode);

      if (mode == 1) {
        if (station1_order > station2_order) {
          total = station1_order - station2_order;
        }else if (station2_order > station1_order) {
          total = station2_order - station1_order;
        }
      }else if (mode == 2) {

        total = station1_order + station2_order;

      }

      var sql = "SELECT cost_ticket,rabbit_senior_ticket,rabbit_student_ticket,rabbit_normal_ticket FROM ticket WHERE many_station = ?";
      con.query(sql, total, function(err, rows, fields) {
        if (err) throw err;
        //console.log(rows);
        res.render('bill', {
          title: 'Ticket detail',
          message_cost: " STATION: " + total + " stations",
          cost: rows[0].cost_ticket,
          cost_rabbit_senior_ticket: rows[0].rabbit_senior_ticket, 
          cost_rabbit_student_ticket: rows[0].rabbit_student_ticket, 
          cost_rabbit_normal_ticket: rows[0].rabbit_normal_ticket,
          name_station_1: name_station_1,
          name_station_2: name_station_2,
        });
      });
    });
  });
});


app.listen(port, function() {
  console.log('Starting node.js on port ' + port);
});

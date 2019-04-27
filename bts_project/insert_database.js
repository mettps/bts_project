const fs = require('fs');
const mysql = require('mysql');
const csv = require('fast-csv');
require('dotenv').config();

let stream = fs.createReadStream("./csv/ticket.csv");
let myData = [];
let csvStream = csv
    .parse()
    .on("data", function (data) {
        myData.push(data);
    })
    .on("end", function () {
		myData.shift();

		// create a new connection to the database
		const connection = mysql.createConnection({
			host: 'localhost',
			user: 'root',
			password: '',
			database: 'database_bts'
		});

        // open the connection
		connection.connect((error) => {
			if (error) {
				console.error(error);
			} else {
				let query = 'INSERT INTO ticket (id_ticket, many_station, cost_ticket, rabbit_senior_ticket, rabbit_student_ticket, rabbit_normal_ticket) VALUES ?';
				connection.query(query, [myData], (error, response) => {
					console.log(error || response);
				});
			}
		});
   	});

stream.pipe(csvStream);

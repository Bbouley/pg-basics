var pg = require('pg');
var connectionString = 'postgres://localhost:5432/pgintro';
var client = new pg.Client(connectionString);
client.connect();

// client.query("SELECT * FROM cities", function(err, result) {
//     console.log(result.rows);
// });

// client.query("SELECT * FROM cities WHERE id=1", function(err, result) {
//     console.log(result.rows);
// });

// client.query("SELECT * FROM cities WHERE id=2", function(err, result) {
//     console.log(result.rows);
// });


function getAll () {
    client.query("SELECT * FROM cities", function(err, result) {
        console.log(result.rows);
    });
}

getAll();
client.end();


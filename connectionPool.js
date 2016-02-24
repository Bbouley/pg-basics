var pg = require('pg');
var connectionString = 'postgres://localhost:5432/pgintro';

function getAll() {
    pg.connect(connectionString,function(err, client, done) {

        if(err) {
            done();
            console.log('Error fetching Client : ' + err);
        }

        var query = client.query('SELECT * FROM cities');

        query.on('row', function(row) {
            console.log(row);
        });

        query.on('end', function() {
            done();
            pg.end();
        });

    });
}

getAll();

pg.connect(connectionString,function(err, client, done) {

    if(err) {
        done();
        console.log('Error fetching Client : ' + err);
    }

    var query = client.query('SELECT * FROM cities WHERE id=1');

    query.on('row', function(row) {
        console.log(row);
    });

    query.on('end', function() {
        done();
        // pg.end();
    });

});



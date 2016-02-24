## Node-Postgres

### Intro

So far we've been looking at SQL databases, and express routes, but seperately. Today we'll start to work on how to integrate SQL queries into our Javascript code. This will allow us to start querying a database and make changes within javascript applications. Once we've covered this, you can start using pg on the server-side to create database queries within routes. With this, you can then start building your own API's. To start with though, we'll keep it simple.

### Project Setup

Set up a new project directory and run npm init. Just go with all the defaults. Next up, add a .gitignore file in the root of your project and add 'node_modules' to it. Finally, add a 'singleClient.js' file.

### The node-postgres Module

[node-postgres](https://github.com/brianc/node-postgres) is a PostgreSQL client for node. What that means is that we can use it to interface with our database, which in this case is the server. In case you're confused, when dealing with databases/servers/clients a general rule is that the client is whoever or whatever is sending a query, and the server is whatever responds to that query with something.

Let's add node-pg into our project. Run the following in your command line, in your project directory:

```sh
$ npm install pg --save
```

We now have access to the node-pg library.

### Setup a database

The next step is to set up a database that we can start making queries against. Go to psql in your terminal, and set up the following:

1. Create a database called pgintro
2. Add a table called cities. The table should have the following columns:
    - ID
    - Name
    - Country
    - Rating (has to be between 1 and 10)
3. Then run the sql query to add data into that table. Add 3 cities of your choice.

### Querying with node-postgres

So now you should have a database set up and your project structure built. We can now look at using the node-pg module to start querying our database. The first step (as always) is requiring in the pg module:

```js
var pg = require('pg');
```

Next up we want to create a variable which is a string with the path to our database. You'll see why we need this in a moment.

```js
var connectionString = 'postgres://localhost:5432/pgintro'
```

Note that postgres should always be running on 5432, and after that we have the name of our database.

We now need to setup a client instance and use that to connect to our database.

```js
var client = new pg.Client(connectionString);
client.connect();
```

Let's go over everything that's happening here. We have already defined where our database is (our connectionString). We then want to create a client to connect to that database. In this case, our database that is running on port:5432 is the server. When we query it using node-pg, we are the client. We then run client.connect() to open up a connection to that database that will allow us to query it. So our code so far looks like this:

```js
var pg = require('pg');
var connectionString = 'postgres://localhost:5432/pgclientside';
var client = new pg.Client(connectionString);
client.connect();
```

Let's build a simple query, then run it with node.

```js
client.query("SELECT * FROM cities", function(err, result) {
    console.log(result.rows);
});
```

```sh
$ node singleClient.js

[ { id: 1, name: 'London', country: 'England', rating: 8 },
  { id: 2, name: 'Denver', country: 'USA', rating: 8 },
  { id: 3, name: 'Paris', country: 'France', rating: 9 } ]

```

So what we are doing is sending a new query through our database connection, then writing our SQL query and adding a callback function that fires once we have a result from our database. One important thing to note here is that we are logging result.rows. In this particular case, we can also console.log(result) and get the same thing back, but when a query runs and we are getting results back node-pg returns data row by row.

Another thing you may have noticed is that the console has not moved on to the next line. It is still 'running'. This is because we have opened a connection to our database, but not closed it. We have to close it in the callback function of our query, because otherwise due to async issues, it would close the database connection before we get our data back.

```js
client.query("SELECT * FROM cities", function(err, result) {
    console.log(result.rows);
    client.end();
});
```

### Exercises

1. Create a query to add a new city to your database
2. Create a query to get all of the cities from your database, console.log the results
3. Create a query to just find one of your cities by id
4. Create a query to update one of your cities with new information
5. Create a query to delete one of your cities

NOTE : Calling client.end() closes the database connection, so you will want to make sure that is in the last query you are calling. You can only call this once unless you want to reopen the connection each time, so think carefully about where you need to put it.

Next, refactor each query into a function, that takes in the arguments needed for the query.

e.g. With your query to add data, youll have to pass in the variables for a new city (name, country, rating) and for your query to get a single city, you will need to pass in an id. What do you need to pass in to your edit function and your delete function?

Now try passing in different variables to your functions and getting/editing/deleting the correct data you are trying to select.


### Connection Pooling

What we have done above is create a single connection to our database on our system. We have created a single client, connected to our database, and then closed that connection. This can be an expensive operation. It means that we are establishing a connection to our database, but there is an alternate way of connecting. We can use a connection pool.

A connection pool is a group of database connections that are just sitting on your computer waiting to be used. What this means is that when a request comes through looking to get information from your database, a connection is already there waiting, and can be given to your application for that request or transaction. In summary, connection pooling is much faster, especially as applications become larger and you may have multiple people performing operations on your database at the same time.

We can use node-pg to write out our database queries using connection pooling instead of creating our own connection each time. The first two lines are the same as our previous file.

```js
var pg = require('pg');
var connectionString = 'postgres://localhost:5432/pgintro';
```

Now we can use slightly different syntax to connect to our database using pg.connect.

```js
pg.connect(connectionString, function(err, client, done) {

});
```

This initializes a connection pool. There are a few configurations you can change, such as how many connections you open and how long these connections will be kept open for once idle (default is 20 connections open, and they will close if idle for 30 seconds)

Within our connect function, we pass in our string with the port for our local databse, and then have a callback function afterwards. First, let's handle the possibility of an error. This error will fire if anything goes wrong fetching a client from the pool. We also want to call done() in that error handler, to end the connection attempt due to the error.

```js
pg.connect(connectionString, function(err, client, done) {

    if(err) {
        done();
        console.log('Error fetching Client : ' + err);
    }

});
```

Next, if there are no errors, we can set up our query. We want to set this as a variable because, as you'll see in a minute, we can perform actions depending on whats coming back from the database.

```js
pg.connect(connectionString,function(err, client, done) {

    if(err) {
        done();
        console.log('Error fetching Client : ' + err);
    }

    var query = client.query('SELECT * FROM teas');
});
```

Finally, there are two events we need to handle. The first is getting data back from the database, and the second is what happens when we have all the data back.

```js
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
    });

});
```

If we run this, we do get the same issue we had when we were using the single client option, in the terminal the database connection is still open and the console is still 'running'. However, with connection pooling we don't have to explicitly close the connection. After 30 seconds of being inactive (the default setting, this can be changed) the connection will automatically close. Run this file with node and wait for the terminal to move onto the next line.

However, if we want we can close the connection after our done() callback.

```js
 query.on('end', function() {
        done();
        pg.end();
    });
```

### Exercises

1. Write out the same routes as above, in functions, using client pooling. This time, start by writing them out in functions taking in the necessary arguments. The functions should be :
 - Get all cities
 - Get single city
 - Add single city
 - Edit single city
 - Delete single city

2. Instead of console.logging the query results, return them and console.log the function.

e.g.

```js
console.log(getAllCities())
```

should return all of the cities once. To do this you will have to think about how to get each row from the database, then return all of the rows at once.










## Node-Postgres

### Intro

So far we've been looking at SQL databases, and express routes, but seperately. Today we'll start to work on how to integrate SQL queries into our Javascript code. This will allow us to start querying a database and make changes within javascript applications. Once we've covered this, you can start using pg on the server-side to create database queries within routes. With this, you can then start building your own API's. To start with though, we'll keep it simple.

### Project Setup

Set up a new project directory and run npm init. Just go with all the defaults. Next up, add a .gitignore file in the root of your project and add 'node_modules' to it. Finally, add a singleClient.js file.

### The node-postgres Module

[pg](https://github.com/brianc/node-postgres) is a PostgreSQL client for node. What that means is that we can use it to interface with our database which in this case is the server. In case you're confused, when dealing with databases/servers/clients a general rule is that the client is whoever or whatever is sending a query, and the server is whatever responds to that query with something.

Let's add pg into our project. Run the following in your command line, in your project directory:

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

Let's go over everything that's happening here. We have already defined where our database is (our connectionString). We then want to create a client to connect to that database. In this case, our database that is running on port:5432 is the server. When we query it using node-pg, we are the client. We then run client.connect() to open up a connection to that database that will allow is to query it. So our code so far looks like this:

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

So what we are doing is sending a new query through our database connection, then writing our SQL query and adding a callback function that fires once we have a result from our database. One important thing to note here is that we are loggin result.rows. In this particular case, we can also console.log(result) and get the same thing back, but when a query runs and we are getting results back node-pg returns data row by row.

Another thing you may have noticed is that the console has not moved on to the next line. It is still 'running'. This is because we have opened a connection to our database, but not closed it. We have to close it in the callback function of our query, because otherwise due to async issues, it would close the database connection before we get our data back.

```js
client.query("SELECT * FROM cities", function(err, result) {
    console.log(result.rows);
    client.end();
});
```









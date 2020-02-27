

mongodb+srv://reddrink:<password>@cluster0-oc2e5.azure.mongodb.ne

onst MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = 'mongodb+srv://reddrink:reddrink@cluster0-oc2e5.azure.mongodb.ne';

// Database Name
const dbName = 'reddrink';

// Create a new MongoClient
const client = new MongoClient(url);

// Use connect method to connect to the Server
client.connect(function(err) {
  assert.equal(null, err);
  console.log("Connected successfully to server");

  const db = client.db(dbName);
  

  client.close();
});
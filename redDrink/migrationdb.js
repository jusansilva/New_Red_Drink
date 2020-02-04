var sqlite3 = require('sqlite3').verbose();
var db;

function createDb() {
    console.log("createDb reddrinkdb");
    db = new sqlite3.Database('reddrinkdb.sqlite3', createTable);
}


function createTable() {
    console.log("createTable lorem");
    db.run(`CREATE TABLE user(id INTEGER PRIMARY KEY, username TEXT NOT NULL, email TEXT NOT NULL, maxScore INTEGER, lastScore INTEGER)`);
    db.run(`CREATE TABLE sala(id INTEGER PRIMARY KEY, name TEXT NOT NULL)`);
    db.run(`CREATE TABLE user_sala(id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL,sala_id INTEGER NOT NULL);`);
}

function closeDb() {
    console.log("closeDb");
    db.close();
}

function runChainExample() {
    createDb();
}
createDb();
runChainExample();
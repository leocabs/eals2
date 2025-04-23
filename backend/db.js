const mysql = require('mysql2');


const db = mysql.createConnection({
    host: "localhost",
    password: "0000",
    user: "root",
    database: "eals",
})




db.connect((err)=> {
    if(err){
        console.log(err);
    }else{
        console.log("Connected to the database")
    }
})

module.exports = db;
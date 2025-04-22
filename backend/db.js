const mysql = require('mysql');


const db = mysql.createConnection({
    host: "localhost",
    password: "",
    user: "root",
    database: "eals2",
})




db.connect((err)=> {
    if(err){
        console.log(err);
    }else{
        console.log("Connected to the database")
    }
})

module.exports = db;
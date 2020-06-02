const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const privateKey = fs.readFileSync('./privateKey.key', 'utf8');
const certificate = fs.readFileSync('./certificate.crt', 'utf8');
const credentials = {
    key: privateKey,
    cert: certificate,
    requestCert: true,
    rejectUnauthorized: false,
};

const dir = path.join(__dirname, '.');

const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(express.static(dir));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "https://localhost:3000"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
})

const unauthorized = (req, res) => {
    if (!req.client.authorized) {
        res.writeHead(401)
            .status(401)
            .end('Invalid client certificate authentication.');
    }
}

app.route('/')
.get((req, res) => {
//        unauthorized(req, res);
    res
    .send("<!DOCTYPE html><html><head></head><body>Hello, express</body></html>")
    .status(200)
    .end();
})

const mysql = require('mysql');
const con = mysql.createConnection({
//    host: '35.240.183.145',
    host: '127.0.0.1',
    user: 'nodejs',
    password: 'O5fbqf4EKO0v3HFg',
    database: 'nodejs',
});

con.connect((err) => {
    if (err) {
        console.log(err);
        return;
    }
    console.log('Connection Established'); 
})

app.route('/api')
.post((req, res) => {
    let lat = req.body.lat;
    let long = req.body.long;
    let userID = req.body.id;

    if ((lat != 0) && (long != 0)) {
        let queryString = "INSERT INTO location(id, latitude, longitude) VALUES('" + userID + "', '" + lat + "', '" + long + "');";
        con.query(queryString, (err, result) => {
            if (err) throw err;
            console.log("1 record inserted.");
        })

        res
        .send("Location data saved.")
        .status(200)
        .end();

    } else {

        res
        .send("Initializing...")
        .status(200)
        .end();
    }
})

let newLocation;
app.route('/api/:id')
.get((req, res) => {
    let userID = req.params.id;

    let queryString = "SELECT * from location WHERE id = '" + userID + "' ORDER BY time DESC LIMIT 1";
    con.query(queryString, (err, result) => {
        if (err) throw err;
        console.log("1 record queried.", result[0].time);
        newLocation = result[0];
    })

    res
    .send(newLocation)
    .status(200)
    .end();

});

const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

httpServer.listen(3773, () => console.log('Listening http on port 3773...'));
httpsServer.listen(8443, () => console.log('Listening https on port 8443...'));

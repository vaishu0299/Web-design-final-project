var cors = require('cors') //cross origin rescource sharing 
const userController = require('./controllers/userController')
const express = require('express')
var bodyParser = require('body-parser')
const app = express()
const mongoose = require('mongoose')
const path = require("path");
const port = process.env.port || 3000
const User = require('./models/user')
const bcrypt = require('bcrypt');
const stripe = require("stripe")("sk_test_51KrvpxEzgKwEXW8k2jArJKoroGe43qh0FG1Q8KPZasOAznuF8NKoyrM2G1HusYOTYLmxqfsF8QAOtfi4xd3xXjnD00LNVFoFsY");

var jwt = require('jsonwebtoken');
var secretKey = "rtyui"

const {
    databaseConnection
} = require('./config/database')
const {
    db
} = require('./models/user')

app.use(cors())

app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(bodyParser.json())
//connecting the database 
mongoose.connect(databaseConnection, {
    useNewUrlParser: true
});

mongoose.connection.on('error', err => {
    console.log(err);
});
mongoose.connection.on('connected', () => {
    console.log('connection success');
});
const authenticateUser = function(req, res, next) {
    let token = req.headers.authorization;
    if (token) {
        let arr = token.split(" ")
        console.log(arr);
        jwt.verify(arr[1], secretKey, function(err, decoded) {
            if (err) {
                res.status(401)
                console.log("error authenticating", err)
                res.send("user is not allowed to perform the operation")
            } else {
                console.log(decoded)
                req.user = decoded
                if (decoded.role == "admin" || decoded.role == "user") {
                    next()
                } else {
                    res.status(403)
                    res.json({
                        "message": "you dont have access to perform this action"
                    })

                }
            }
        })
    } else {
        res.status(401)
        res.send("user is not allowed to perform the operation")
    }
}

const authenticateAdmin = function(req, res, next) {
    let token = req.headers.authorization;
    if (token) {
        let arr = token.split(" ")
        console.log(arr);
        jwt.verify(arr[1], secretKey, function(err, decoded) {
            if (err) {
                res.status(401)
                console.log("error authenticating", err)
                res.send("user is not allowed to perform the operation")
            } else {
                console.log(decoded)
                req.user = decoded
                if (decoded.role == "admin") {
                    next()
                } else {
                    res.status(403)
                    res.json({
                        "message": "you dont have access to perform this action"
                    })
                }
            }
        })
    } else {
        res.status(401)
        res.send("user is not allowed to perform the operation")
    }
}




//API for signup
app.post('/user/signup', userController.signup)
//API for login
app.post('/user/login', userController.login)

//API for delete
app.delete('/user/delete', authenticateUser, userController.delete)

// app.post("/payment",userController.payment)
app.post('/user/payment', userController.confirmPayment)
app.get('/user/transaction', authenticateAdmin, userController.getAllTransaction)

app.listen(port, function() {
    console.log(`Example app listening on port ${port}`)
    //console.log("example app " + port)
})

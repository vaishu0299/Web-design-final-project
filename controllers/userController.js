const User = require('../models/user')
const stripe = require("stripe")("sk_test_51KrvpxEzgKwEXW8k2jArJKoroGe43qh0FG1Q8KPZasOAznuF8NKoyrM2G1HusYOTYLmxqfsF8QAOtfi4xd3xXjnD00LNVFoFsY");
const path = require("path");
var jwt = require('jsonwebtoken');
var secretKey = "rtyui"

const bcrypt = require('bcrypt');
const YOUR_DOMAIN = "http://localhost:3000";
module.exports = {
    //Singup API 
    signup: function(req, res) {
        // user find if the username already exists or not
        var regexusername = /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/
        var regexpassword = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/

        var username = req.body.username;
        var password = req.body.password;
        console.log(password);
        //using reqex to validate the username 
        if (!req.body.username.trim().match(regexusername)) {
            res.status(400);
            return res.json({
                "message": "Email Input does not match"
            });
            //using regex to validate the password
        } else if (!req.body.password.trim().match(regexpassword)) {
            res.status(400);
            res.json({
                "message": "Please enter minimum eight characters, at least one lowercase and uppercase letter"
            });
        } else {
            //checking if the user with that username exists 
            User.find({
                username: req.body.username
            }).exec(function(err, user) {
                if (err) {
                    res.json({
                        "message": 'error exec find user'
                    });
                }
                //if user.length is >0 then the username already exists and we cant create a user with the same username
                else if (user.length > 0) {
                    res.json({
                        "message": 'email already exists'
                    });
                } else {

                    //Hashing the password with salt =12
                    bcrypt.hash(req.body.password, 12, function(err, hash) {
                        // console.log(hash)
                        if (err) {
                            //if errors occours here the hashing is failed and the error status is 500
                            res.status(500);
                            res.json({
                                "message": 'Hashing failed'
                            });
                        } else {
                            //As the username doesnt already exist we are creating a new user .

                            let new_user = {
                                "username": req.body.username,
                                "password": hash,
                                "role": req.body.role
                            }
                            //creating the new user and saving it in mongodb.
                            let user = new User(new_user);
                            user.save(function(err, obj) {
                                if (err) {
                                    //if errors occours during the creation of the user.
                                    console.log(err);
                                    console.log('Unable to create users. Try again!!!');
                                    res.status(500);
                                    res.json({
                                        "status": false,
                                        "message": 'Failed to create users'
                                    });
                                } else {
                                    res.status(200);
                                    res.json({
                                        "status": true,
                                        "message": 'User created successfully'
                                    });
                                }
                            });
                        }
                        //  }   
                    })
                }
            })
        }
    },

    //API for login
    login: function(req, res) {
        // bcrypt.compare(req.body.password,)
        //checking if the username is already registered 
        User.findOne({
            username: req.body.username
        }).exec(function(err, db_user) {
            if (err) {
                res.json({
                    "messgae": 'query error'
                });
                //if the user with that username does not exist
            } else if (db_user == null) {
                res.json({
                    "status": "",
                    "message": "username does not exist"
                })
            } else {
                //checking if the password given during login matches with that of the database
                bcrypt.compare(req.body.password, db_user.password).then(doMatch => {
                    if (doMatch) {
                        var payLoad = {
                            username: db_user.username,
                            user_id: db_user._id,
                            role: db_user.role
                        }
                        //token is being created 
                        var token = jwt.sign(payLoad, secretKey);
                        res.json(db_user.role);
                        res.json({
                            "message": 'signin is successful',
                            "accessToken": token,
                            "role": db_user.role
                        })
                        console.log(db_user);
                        // res.send(db_user);
                    } else {
                        res.json({
                            "message": "password is incorrect"
                        })
                    }
                })
            }
        })
    },

    //API for delete
    delete: function(req, res) {
        console.log(req.user)
        User.findOneAndDelete({
            _id: req.user.user_id
        }, function(err, docs) {
            if (err) {
                console.log(err)
            } else {
                console.log("deleted user", req.user.username);
                res.send("user deleted successfully");
            }
        })
    },


    //    payment:async function(req,res){
    //      const { product } = req.body;
    //      const session = await stripe.checkout.sessions.create({
    //          payment_method_types: ["card"],
    //          line_items: [
    //              {
    //                  price_data: {
    //                      currency: "USD",
    //                      product_data: {
    //                         //  name: product.name,
    //                          // images: [product.image],
    //                      },
    //                      unit_amount: product.amount * 100,
    //                  },
    //                  quantity: product.quantity,
    //              },
    //          ],
    //          mode: "payment",
    //          success_url: `${YOUR_DOMAIN}/views/success.html`,
    //          cancel_url: `${YOUR_DOMAIN}/cancel.html`,
    //      });
    //      console.log(session)
    //      res.json({ id: session.id });
    //  },

    confirmPayment: function(req, res) {
        const stripe = require('stripe')("sk_test_51KrvpxEzgKwEXW8k2jArJKoroGe43qh0FG1Q8KPZasOAznuF8NKoyrM2G1HusYOTYLmxqfsF8QAOtfi4xd3xXjnD00LNVFoFsY");
        stripe.charges.create({
            source: req.body.token,
            currency: "USD",
            amount: req.body.amount * 100
        }, (err, charge) => {
            if (err) {
                console.log(err);
                return res.json({
                    success: false,
                    status: "payment failed"
                })
            }
            res.json({
                success: true,
                status: "payment success"
            })
        })
    },
    //  getAllTransaction: async function(req,res)
    //  {
    //    const stripe = require('stripe')('sk_test_4eC39HqLyjWDarjtT1zdp7dc');
    //   try
    //   {
    //   const transactions = await stripe.charges.list({
    //   limit:50,
    //   });
    //   res.json({"status":true,"message":"successful","data":transactions})
    // }
    // catch(e)
    //  {
    //   console.log(e);
    //   res.json({"status":false,"message":"unable to fetch transaction"});
    //  }

    // }

    getAllTransaction: async function(req, res) {
        const stripe = require('stripe')('sk_test_51KrvpxEzgKwEXW8k2jArJKoroGe43qh0FG1Q8KPZasOAznuF8NKoyrM2G1HusYOTYLmxqfsF8QAOtfi4xd3xXjnD00LNVFoFsY');
        try {
            //getting all the stripe transactions
            const transactions = await stripe.charges.list({
                limit: 50,
            });
            res.json({
                "status": true,
                "message": "successful",
                "data": transactions,
            })

        } catch (e) {
            console.log(e);
            res.json({
                "status": false,
                "message": "unable to fetch transaction"
            });
        }
    }
}

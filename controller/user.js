const User=require('./models/user')
const bcrypt = require('bcrypt');
// p,const saltRounds = 10;
var jwt = require('jsonwebtoken');
var secretKey="rtyui"
module.exports={
    login:function(req,res){
        User.findOne({username:req.body.username}).exec(function(err,db_user)
      {
        if(err)
        {
          res.json({"messgae":'query error'});
        }
        else if(db_user==null)
          {
            res.json({"status":"","message":"username does not exist"})
          }
        else{
        bcrypt.compare(req.body.password,db_user.password).then(doMatch=> {
        if(doMatch)
          {
            var payLoad={username:db_user.username,user_id:db_user._id,role:db_user.role}
            var token = jwt.sign(payLoad, secretKey);
            res.json({"message":'signin is successful',"token":token})
            console.log(db_user);
            // res.send(db_user);
          }
          else{
            res.json({"message":"password is incorrect"})
          }
        })
      }
      })
    }
}
module.exports={
    signup:function(req,res)
    {
        User.find({username:req.body.username}).exec(function(err,user)
    {
      if(err)
      {
        res.json({"message":'error exec find user'});
      }
      //if user.length is >0 then the username already exists and we cant create a user with the same username
      else if(user.length>0){
        res.json({"message":'email already exists'});
      }
      else{
      //Hashing the password with salt =12
      bcrypt.hash(req.body.password,12,function(err,hash){
        console.log(hash)
        if(err){
          //if errors occours here the hashing is failed and the error status is 500
          res.status(500);
          res.json({"message": 'Hashing failed'});
        }else{
          //As the username doesnt already exist we are creating a new user .
          let new_user={"username":req.body.username,"password":hash,"role":req.body.role}
          //creating the new user and saving it in mongodb.
          let user= new User(new_user);
          user.save(function(err,obj){
          if(err) {
            //if errors occours during the creation of the user.
              console.log(err);
              console.log('Unable to create users. Try again!!!');
              res.status(500);
              res.json({"message": 'Failed to create users'});
          } else {
              res.status(200);
              res.json({"message":'User created successfully'});
          }
      });
      }   
      })
    }
    })
    }

}
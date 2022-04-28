// mongoose.connect('mongodb://localhost:27017/myapp');
const mongoose = require ('mongoose');

const UserSchema = mongoose.Schema({
    
    username : {
        "type" : String,
        "required" : true,
    },
    password : {
        "type" : String,
        "required" : true,
    },
    role : {
        "type" : String,
        "required" : true,
    },
    
})


const User = module.exports = mongoose.model('User', UserSchema);
module.exports=User;


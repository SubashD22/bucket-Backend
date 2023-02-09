const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    uid:{
        type:String,
        required:true
    },
    userProvider:{
        type:String
    },
    list:{
        type:Array
    }
},{
    timestamps:true
});

const userModel = mongoose.model("User", userSchema);
module.exports = userModel; 
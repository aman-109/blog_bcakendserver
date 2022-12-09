const mongoose= require("mongoose")


const userSchema=new mongoose.Schema({
    "name":{type:String,reuqired:true},
    "email":{type:String,reuqired:true,unique:true},
    "password":{type:String,reuqired:true},
    "age":{type:String,min:20,max:100},
    "gender":{type:String,enum:["male","female"],default:"male"},

})

const User=mongoose.model("user",userSchema)

module.exports=User
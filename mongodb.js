const mongoose = require("mongoose")
mongoose.connect("mongodb://127.0.0.1:27017/EjsChallenge")
.then(()=>{
    console.log("Mongodb connected")
})
.catch(()=>{
    console.log("failed to connect")
})

const LogInSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    role: { type: String,
            enum: ["user", "admin"]
            //  default: "user" 
            }
    
})


const collection=new mongoose.model("LogInCollection",LogInSchema)
module.exports=collection
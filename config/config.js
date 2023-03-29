const sessionSecret = "mysessionsecret"



const mongoose = require("mongoose")
require('dotenv').config()
const mongoUrl = process.env.mongodb;

function dbConfig(){
    try {
        mongoose.set('strictQuery', false);
        mongoose.connect(mongoUrl)
        
    } catch (error) {
       console.log(error.message); 
    }
   
    
}







module.exports ={
    sessionSecret,
    
    dbConfig
}
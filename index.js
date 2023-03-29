const env = require('dotenv').config()

const express =require("express")
const app = express();
// const mongoose = require("mongoose")
// mongoose.connect("mongodb://127.0.0.1:27017/MENSPACE")
const dbConfig = require('./config/config')
const user_route = require("./routes/userRoute")
const admin_route = require("./routes/adminRoute")


const path = require('path')

const errorHandler = require('./errorHandler')


dbConfig.dbConfig()
app.use('/',user_route)
app.use('/admin',admin_route)
app.use(express.static(path.join(__dirname, 'public')));
app.listen(process.env.port,function(){
console.log("server running..")

})

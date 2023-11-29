const env = require('dotenv').config()
const mongoose = require("mongoose")
const express =require("express")
const app = express();
const session = require('express-session');
const sessionSecret = "mysessionsecret"

const dbConfig = require('./config/config')
const user_route = require("./routes/userRoute")
const admin_route = require("./routes/adminRoute")


const path = require('path')

const errorHandler = require('./errorHandler')

mongoose.connect(process.env.mongodb)
mongoose.set('strictQuery', false)
mongoose.connection.on('error', (err) => {
  console.error('Error connecting to database', err);
});
app.use(session({
    secret:sessionSecret,
    resave: false,
    saveUninitialized: true
  }));
app.use('/',user_route)
app.use('/admin',admin_route)
app.use(express.static(path.join(__dirname, 'public')));
app.listen(process.env.port,function(){
console.log("server running..")

})

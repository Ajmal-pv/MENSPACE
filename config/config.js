const sessionSecret = "mysessionsecret"

TWILIO_ACCOUNT_SID ='ACef6f7c99fcf1d1017ef3cf5234b014da'
TWILIO_AUTH_TOKEN ='835a426739e25d8fa0dc5aa5f739095b'
TWILIO_SERVICE_SID = 'SIDVA8ef99a0f83480395818a7d38e35e07f1'
myemail= 'ajmalpv66@gmail.com'
mypassword ='gckfqxkyyrebfqbb'
require('dotenv').config()

function dbConfig(){
    const mongoose = require("mongoose")
    mongoose.set('strictQuery', false);
    mongoose.connect("mongodb+srv://ajmalpv66:j97IHnuarssk34jX@cluster0.czhsnlj.mongodb.net/MENSPACE?retryWrites=true&w=majority")
}

module.exports= dbConfig()





module.exports ={
    sessionSecret,
    myemail,
    mypassword
}
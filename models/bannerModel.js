const mongoose = require("mongoose")
const bannerSchema = new mongoose.Schema({
name:{
    type:String,

},
image:[{
    type:String
}],
link:{
  type:String
}

})
module.exports=mongoose.model('Banner',bannerSchema)
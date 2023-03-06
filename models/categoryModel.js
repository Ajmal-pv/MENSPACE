const mongoose = require("mongoose");
const categorySchema = new mongoose.Schema({
name:{
    type:String,
    required:true

},
discription:{
    type:String,
    required:true
},
is_delete :{
    type:Boolean,
    default:false
}

})
module.exports=mongoose.model('Category',categorySchema)
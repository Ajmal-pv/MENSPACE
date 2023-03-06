const { Binary, ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const productSchema = new mongoose.Schema({
name:{
    type:String,
    
},
discription:{
    type:String,
   
},
price:{
    type:Number,
      
},
image:{
   
    type:[String],
  
},
category: {
   type : ObjectId,
   ref : 'Category'
},
stock:{
    type:Number,
}
})
module.exports=mongoose.model('Product',productSchema)
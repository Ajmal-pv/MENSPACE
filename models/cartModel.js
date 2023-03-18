const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");



const productSchema = new mongoose.Schema({
  productId :{
  type:ObjectId,
  ref:'Product'

},
quantity:{
  type:Number,
  default:0
  
},
sellingPrice:{
  type:Number
}

 })



const cartSchema = new mongoose.Schema({
     
      product :[productSchema],
        user:{
            type:ObjectId,
            required:true,
            ref:'User'
        },
        totalprice:{
          type:Number
        },
        discountprice:{
          type:Number
        }



})
module.exports=mongoose.model('Cart',cartSchema)
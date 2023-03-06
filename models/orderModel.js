const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    user:{
        type:ObjectId,
        ref:'User'
    },
    paymentMethod:{
    type:String,
    default:'COD'
    },
    paymentStatus:{
        type:String,
        default:'pending'
    },
    products: [
      {
        productId: {
         type:ObjectId,
        ref:'Product'},
        quantity: Number
      }
    ],
   
    totalPrice: Number,
    customer: {
      name: String,
      phone: String,
      Address: String,
      postcode:String,
      city:String,
      state:String
    },
    status: String,
    createdDate: {
        type: Date,
        default: Date.now
      }
  })
  module.exports=mongoose.model('Order',orderSchema)
const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
name:{
    type:String
    
},
email:{
    type:String
    
},
mobile:{
    type:Number
     
},
password:{
    type:String
   
},
is_admin:{
    type:Number
   
},
is_verified:{
    type:Number,
    default:0
},
token:{
    type:String,
    default:''
},
is_blocked:{
    type:Number,
    default:0
},
Address:[{
    name:{
        type:String
    },
    address:{
        type: String
        
    },
    postcode:{
        type:String
       
    },
    city:{type:String
        
    },
    state:{        
        type:String
       
    },
    mobile:{
        type:String
    }
    
}],
wishList:
[
 {
  productId:
   {
     type:ObjectId,
     ref:'Product'
   }
 }
]
})
module.exports=mongoose.model('User',userSchema)
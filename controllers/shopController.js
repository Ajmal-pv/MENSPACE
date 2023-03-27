const User = require('../models/userModel')
const Category = require('../models/categoryModel')
const Cart = require('../models/cartModel')
const bcrypt = require('bcrypt')
const Product = require('../models/productModel')
const Coupon = require('../models/couponModel')
const multer = require('multer')
const Razorpay = require('razorpay')

const Order = require('../models/orderModel');
const { find } = require('../models/userModel')
const { response } = require('../routes/userRoute')




const addToCart = async (req, res) => {
  try {
    const productId = req.query.id;
    const quantity = req.body.quantity || 1
    const userId = await req.session.user_id;
    const productt = await Product.findOne({ _id: productId })
    const proPrice = productt.price
    const sellingPrice = productt.price



    if (userId) {
      const cartData = await Cart.findOne({ user: userId });


      if (cartData) {


        const totalPrice = cartData.totalprice + proPrice

        const productIndex = cartData.product.findIndex(p => p.productId == productId);
        if (productIndex !== -1) {

          const updateResult = await Cart.updateOne(
            { user: userId, "product.productId": productId },
            { $inc: { "product.$.quantity": quantity } }
          );
          const priceUpdate = await Cart.updateOne(
            { user: userId }, { $set: { totalprice: totalPrice } })

        } else {


          const cartUpdate = await Cart.updateOne(
            { user: userId },
            { $push: { product: { productId, quantity,sellingPrice } } });

          const priceUpdate = await Cart.updateOne(
            { user: userId }, { $set: { totalprice: totalPrice } })


        }
      } else {
          const cart = new Cart({
          product: [{ productId, quantity,sellingPrice }],
          user: userId,
          totalprice: proPrice
        });
        const cartData = await cart.save();

      }
      res.redirect("/cartPage");
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};



const cartPage = async (req, res) => {
  try {
    const userData = await User.findOne({ _id: req.session.user_id })
    const userCart = await Cart.findOne({ user: req.session.user_id })


    let count = 0
    if (userCart) {
      const cartProducts = userCart.product
      const userCartProductsId = cartProducts.map(values => values.productId)
      const products = await Product.aggregate([
        {
          $match: {
            _id: { $in: userCartProductsId }
          }
        }, {
          $project: {
            name: 1,
            image: 1,
            price: 1,

            cartOrder: { $indexOfArray: [userCartProductsId, "$_id"] }
          }
        },
        { $sort: { cartOrder: 1 } }
      ])

      count = products.length
      if (products.length > 0) {
        res.render('cartPage', { products, userCart, userData, cartProducts, count })
      } else {
        res.render('cartPage', { count, userData })
      }
    }

    else {
      res.redirect('/login')
    }
  } catch (error) {
    console.log(error.message)
  }
}
const changeQuantity = async (req, res) => {
  const cartId = req.body.cart;
  const proId = req.body.product;
  const count = parseInt(req.body.count);
  const quantity = parseInt(req.body.quantity);

  try {
    const cart = await Cart.findOne({ _id: cartId });
    const product = await Product.findOne({ _id: proId })
    const price = product.price;

    const totalPrice = cart.totalprice + count * product.price;


    await Cart.updateOne(
      { _id: cartId, "product.productId": proId },
      { $inc: { "product.$.quantity": count } }
    );



    const cartData = await Cart.updateOne(
      { _id: cartId },
      { $set: { totalprice: totalPrice } }
    );
       
    const updatedQuantity = quantity + count;
    const totalprice = updatedQuantity * price
    const jsonResponse = { updatedQuantity, totalPrice, totalprice };
    res.json(jsonResponse);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
    console.log("change quantity section");
  }
};

const deleteCartProduct = async (req, res) => {
  try {
    const userid = req.session.user_id;
    const productId = req.query.id;
    const productwant = await Product.findOne({ _id: productId })
    const price = parseInt(productwant.price)
    const CartData = await Cart.findOne({ user: userid })

    const productIndex =await CartData.product.findIndex((p) => p.productId == productId)

    const q = parseInt(CartData.product[productIndex].quantity)
    CartData.totalprice -= (q * price)
    CartData.product.splice(productIndex, 1)
    const cartSave= await CartData.save()
    const cartDetails = await Cart.findOne({user:userid})
    const cartTotal=cartDetails.totalprice
    const cartLength = cartDetails.length
    let count=0
   if(cartDetails.product.length>0){
      count = cartDetails.product.length
   }


    const jsonResponse ={cartDetails,cartTotal,count}
    res.json(jsonResponse)
    

  } catch (error) {
    console.log(error.message);
  }
}
const addressPage = async (req, res) => {
  try {
    const userid = req.session.user_id
    const userData = await User.findOne({ _id: userid })

    const address = userData.Address

    if (userid) {
      res.render('addressPage', { userData, address })
    } else {
      res.redirect('/login')
    }
  } catch (error) {
    console.log(error.message);
  }


}
const checkOut = async (req, res) => {
  try {
    const userData = req.session.user_id
    const discountPrice = await Cart.findOneAndUpdate({ user: req.session.user_id }, { $set: { discountprice: 0 } })

    const userinfo = await User.findOne({ _id: userData })
    const address = userinfo.Address
    const userCart = await Cart.findOne({ user: req.session.user_id })
    
    const userCarts = userCart.product
    


    const Carts = userCarts.map(value => value.productId)



    const productData = await Product.find({ _id: { $in: Carts } })





    res.render('checkOut', { userCarts, productData, userData, address, userCart })
  } catch (error) {
    console.log(error.message);
  }
}

const couponpAdd = async (req, res) => {
  try {
    const coupon = req.body.code
    
   


    const userData = req.session.user_id

    const userinfo = await User.findOne({ _id: userData })
    const address = userinfo.Address
    const userCart = await Cart.findOne({ user: req.session.user_id })
    const cartTotal = userCart.totalprice 
    const userCarts = userCart.product
    const Carts = userCarts.map(value => value.productId)
    const productData = await Product.find({ _id: { $in: Carts } })



    const couponData = await Coupon.findOne({code:coupon})
    

    if (couponData) {
      const minimum= couponData.minPurchase
      if (cartTotal>minimum) {
        const couponType = couponData.discountType
        const discountAmount = couponData.discountAmount
        if (couponType === 'percentage') {
          discountPrice = cartTotal * (discountAmount/100);
        } else if (couponType === 'flat') {
          discountPrice = discountAmount;
        }
        const cartData = await Cart.findOneAndUpdate(
          { user: userData },
          { $set: { discountprice : discountPrice } }
        );
        const updatedCart = await Cart.findOne({ user: userData });
        const jsonResponse = { message:'coupon applied',updatedCart:updatedCart,data:'applied',coupon };
      
          res.json(jsonResponse)

      } else {
        const need =minimum-cartTotal
        const jsonResponse = { message:'you have to purchase rupees ' + need + 'more to avail this coupon',data:'minimumAmount' };
     
        res.json(jsonResponse)
      }


    } else {
     
      const jsonResponse = { message:'invalid coupon',data:'invalid'}
      res.json(jsonResponse)
    }
  } catch (error) {
    console.log(error.message);
  }
}
const couponDelete = async (req, res) => {
  try {
    const user = req.session.user_id
    const cartData = await Cart.findOneAndUpdate({ user: user }, { discountprice: 0 })
    const cart = await Cart.findOne({ user: user })
   
    const jsonresponse={cart,message:'coupon has removed'}
    res.json(jsonresponse)

  } catch (error) {
    console.log(error.message);
  }
}


const orderCreating = async (req, res) => {
  try {
    
    const userId = req.session.user_id
    const cartData = await Cart.findOne({user:userId}).populate('product')
    const productDetail = cartData.product
       
    
   
    const customerName = req.body.name;
    
    const customerAddress = req.body.address;
    const customerPostcode = req.body.postcode;
    const customerCity = req.body.city;
    const customerState = req.body.state;
    const customerPhone = req.body.phoneNumber;
    


    const customer = {
      name: customerName,
      Address: customerAddress,
      postcode: customerPostcode,
      city: customerCity,
      state: customerState,
      phone: customerPhone
    }
    const totalprice = req.body.total
   




    const order = new Order({
      user: userId,
      products: productDetail,
      totalPrice: totalprice,
      customer: customer,
      paymentMethod:req.body.payment,
      paymentStatus:'pending',
      status:'Placed'

    })
    const orderData = await order.save()
           if (req.body.payment === 'COD') {
      
      let response= {status:true}
      for (let i = 0; i < productDetail.length; i++) {
        singleProduct = await Product.findById({ _id: productDetail[i].productId })
        singleProduct.stock -= cartData.product[i].quantity
        singleProduct.save()
      }
      cartData.product = []
      cartData.totalprice = 0
      await cartData.save()

      res.json(response)
    } else if (req.body.payment === 'razorpay') {
      var instance = new Razorpay({key_id:'rzp_test_hrecA2cXP9u9Me', key_secret:'BhAVtj9JW3ZWBPbKwEoRFgDe'})

      var options = {
        amount: orderData.totalPrice*100,  // amount in the smallest currency unit
        currency: "INR",
        receipt: ''+orderData._id
      };
      instance.orders.create(options, function(err, orders) {
        
        if(err){

        }else{
        
          res.json({success:true,order:orders})
        }

      });
      


    }
    
    


  } catch (error) {
    console.log(error.message);
  }
}
//payment verify
const verifyPayment = async(req,res)=>{
  try {
      
     const orderId = req.body.order.receipt
      const crypto = require('crypto')
      const hmac = crypto.createHmac('sha256','BhAVtj9JW3ZWBPbKwEoRFgDe')
      .update(req.body.payment.razorpay_order_id+'|'+req.body.payment.razorpay_payment_id)
      .digest('hex')
     
      if(hmac == req.body.payment.razorpay_signature){
          const update = {$set:{
              paymentStatus: 'Charged'
          }}
          const options = {new: true}
          await Order.findByIdAndUpdate(orderId,update,options).then(()=>{
           const response={success:true}
              res.json(response)
          })
          
          
          const cartData = await Cart.findOne({user:req.session.user_id}).populate('product')
          const productDetail = cartData.product
         
          for (let i = 0; i < productDetail.length; i++) {
            singleProduct = await Product.findById({ _id: productDetail[i].productId })
            singleProduct.stock -= cartData.product[i].quantity
            singleProduct.save()
          }
          cartData.product = []
          cartData.totalprice = 0
          await cartData.save()
      }
     else{
     const response = {paymentFailed:true}
      res.json(response)
     } 
     
  } catch (error) {
      console.log(error.message);
  }
}


const confirmPage = async (req, res) => {
  try {
    const order = await Order.findOne({ user: req.session.user_id })

    res.render('orderConfirm', { order })
  } catch (error) {
    console.log(error.message);
  }
}
const orderLoad = async (req, res) => {
  try {
    userData = req.session.user_id
    const orderData = await Order.find({ user: userData }).sort({createdDate:-1}).populate('products.productId')

    // let products ;
    // console.log("order detailsssssssssssssssssss" + orderData)
    //  console.log("0th irder detailsssssssssss" + orderData[1].products[0])
    // for(let i=0;i<orderData.length;i++){

    //   console.log('loop')
    // }

    // console.log('ordersssss',products);
    // console.log('detailss',products.productId);
    // let productDetails = []
    // for(let i=0;i<products.length;i++){
    //   productDetails[i]= await Product.find({_id:products[i].productId})
    // }

    // console.log('product detailssss',productDetails);

    res.render('orders', { orderData, userData })

  } catch (error) {
    console.log(error.message);
  }
}

const orderDetails = async (req, res) => {
  try {
    const userData = req.session.user_id
    const orderData = await Order.findOne({_id:req.query.id}).populate('products.productId')
    const productData=orderData.products
    
    
        res.render('singleOrder',{userData,orderData,productData})

  } catch (error) {
    console.log(error.message);
  }
}

const orderCancel = async (req, res) => {
  const orderId = req.query.id
  const singleOrder = await Order.findById({ _id: orderId })
  singleOrder.status = "Cancelled"
  await singleOrder.save()

  res.redirect('/orders')
}

const
  addToWishlist = async (req, res) => {
    try {
     
      const productId = req.body.proId
      const userId = req.session.user_id
      const user = await User.findById({ _id:userId })

      const productIndex = user.wishList.findIndex(p => p.productId == productId)

      if (productIndex === -1) {
        user.wishList.push({ productId })
        const updatedUser = await user.save();
        const wishlistLength = user.wishList.length
       
       length= parseInt(wishlistLength)
       
       
        const jsonResponse = {length,success:true };
        res.json(jsonResponse);

      }
      else{
        let message="already created"
        length=user.wishList.length
        const jsonResponse = {message,length,success:false}
        res.json(jsonResponse)
      }

    }
    catch (error) {
      console.log(error.message);

    }


  }

const wishList = async (req, res) => {
  try {
    const userData = req.session.user_id
    const user = await User.findById({ _id: userData }).populate('wishList.productId')
    res.render('wishList', { user, userData })
  } catch (error) {
    console.log(error.message);
  }
}
const deleteFromWishlist = async (req, res) => {
  try {
    
    const productId = req.query.id
    const userData = req.session.user_id
    const user = await User.findOne({ _id: userData })
    const productIndex = user.wishList.findIndex(p => p.productId == productId)
    user.wishList.splice(productIndex, 1)
  


   const updated = await user.save()
   let count=0
   if(updated.wishList.length>0){
      count = updated.wishList.length
   }
  let response={success:true,count}
    res.json(response)
    


  } catch (error) {
    console.log(error.message);
  }
}

module.exports = {
  addToCart,
  cartPage,
  deleteCartProduct,
  checkOut,
  couponpAdd,
  couponDelete,
  changeQuantity,
  orderCreating,
  verifyPayment,
  confirmPage,
  orderLoad,
  orderDetails,
  orderCancel,
  addToWishlist,
  wishList,
  deleteFromWishlist
}

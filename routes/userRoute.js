const express = require("express")
const user_route = express();
const session = require("express-session")
const config = require("../config/config")
const env = require('dotenv').config()
user_route.use(session({
  secret: process.env.sessionSecret,
  saveUninitialized: true,
  resave: false
}))

user_route.use((req, res, next) => {
  res.set("cache-control", "no-store");
  next();

})

const auth = require("../middlewares/auth")

const userController = require("../controllers/userController")
const shopController = require("../controllers/shopController")
const productController = require('../controllers/productController')
user_route.set('view engine', 'ejs')
user_route.set('views', './views/users')
const bodyParser = require("body-parser")
user_route.use(bodyParser.json())
user_route.use(bodyParser.urlencoded({ extended: true }))

//user login
user_route.get('/register', auth.isLogout, userController.loadRegister)
user_route.post('/register', userController.insertUser)
user_route.post('/otp', auth.isLogout, userController.verifyMail)
user_route.get('/login', auth.isLogout, userController.loginLoad)
user_route.get('/', userController.loadpage);
user_route.post('/login', userController.verifyLogin)
user_route.get('/home', auth.isLogin, userController.loadpage)
user_route.get('/forget', auth.isLogout, userController.forgetLoad)
user_route.post('/forget', userController.forgetLink)
user_route.get('/forget-password', auth.isLogout, userController.forgetPasswordLoad)
user_route.post('/forget-password', userController.resetPassword)

// product

user_route.get('/shop',userController.shopLoad)
user_route.get('/category-filter',productController.categoryPage)
user_route.get('/product-detail',userController.productDetail)
user_route.post('/add-to-wislist',shopController.addToWishlist)
user_route.get('/wishList',auth.isLogin,shopController.wishList)
user_route.post('/delete-from-wishlist',shopController.deleteFromWishlist)

user_route.post('/coupon',shopController.couponpAdd)
user_route.post('/delete-coupon',shopController.couponDelete)

user_route.get('/add-to-cart', auth.isLogin, shopController.addToCart)
user_route.get('/cartPage', auth.isLogin,shopController.cartPage)
user_route.post('/change-product-quantity',shopController.changeQuantity)
user_route.get('/remove-product', auth.isLogin, shopController.deleteCartProduct)
user_route.get('/checkout',auth.isLogin,shopController.checkOut)
user_route.post('/checkout',shopController.orderCreating)
user_route.post('/verify-payment',shopController.verifyPayment)
user_route.get('/orderConfirm',shopController.confirmPage)
user_route.get('/orders',auth.isLogin,shopController.orderLoad)
user_route.get('/ordersingle',auth.isLogin,shopController.orderDetails)
user_route.post('/orderCancel',auth.isLogin,shopController.orderCancel)

user_route.post('/returnOrder',auth.isLogin,shopController.returnOrder)


//profile edit  

user_route.get('/userProfile',auth.isLogin, userController.userProfile)
user_route.get('/userEdit', auth.isLogin,userController.userEdit)
user_route.post('/userEdit', userController.userEdited)
user_route.get('/manageAddress',auth.isLogin,userController.addressPage)
user_route.get('/editAddress',auth.isLogin,userController.editAddress)
user_route.post('/editAddress',userController.addressEdit)
user_route.get('/deleteAddress',auth.isLogin,userController.deleteAddress)
user_route.get('/addAddress',auth.isLogin,userController.addAddress)
user_route.post('/addAddress',userController.addAddressIn)

// logout

user_route.get('/logout', userController.logoutUser)













module.exports = user_route;

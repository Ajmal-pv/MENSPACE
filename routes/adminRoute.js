const env = require('dotenv').config()
const express = require('express');

const admin_route = express();
const session = require('express-session');
const config = require("../config/config");
admin_route.use(session({secret:process.env.sessionSecret ,saveUninitialized:true,resave:false}))
const adminAuth = require('../middlewares/adminAuth')
const bodyParser = require("body-parser");
admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({extended:true}));
admin_route.set('view engine','ejs');
admin_route.set('views','./views/admin');

const multer = require('multer')
const path = require('path')
const adminController =require("../controllers/adminController")
const productController = require('../controllers/productController')
const categoryController = require('../controllers/categoryController')
const shopController = require("../controllers/shopController")

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname,'../public/imagess'))
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '-' + file.originalname;
        cb(null, name)
    }
});
const upload = multer({
    storage:storage
})
//login

admin_route.get('/', adminAuth.isLogout,adminController.loadLogin);
admin_route.post('/',adminController.verifyLogin);
admin_route.get('/home',adminAuth.isLogin,adminController.loadDashboard);

//category

admin_route.get('/category', adminAuth.isLogin, categoryController.categoryLoad)
admin_route.get('/addcategory',adminAuth.isLogin,categoryController.addCategoryLoad)
admin_route.post('/addcategory', categoryController.addCategory)
admin_route.get('/updateCategory',  adminAuth.isLogin,categoryController.updateCategoryLoad)
admin_route.post('/updateCategory',categoryController.updateCategory)
admin_route.get('/deleteCategory',  adminAuth.isLogin, categoryController.deleteCategory)



// products 
admin_route.get('/products', adminAuth.isLogin,productController.productLoad)
admin_route.get('/addproduct', adminAuth.isLogin,productController.addProductLoad)
admin_route.post('/addproduct', upload.array('image',6),productController.addProduct)
admin_route.get('/updateProduct' , adminAuth.isLogin, productController.updateProductLoad)
admin_route.post('/updateProduct' ,upload.array('image',6), productController.updateProduct)
admin_route.get('/deleteProduct',  adminAuth.isLogin, productController.deleteProduct)


//user
admin_route.get('/user',  adminAuth.isLogin, adminController.userLoad)
admin_route.get('/blockUser',  adminAuth.isLogin, adminController.blockUser)

//order
admin_route.get('/order',adminAuth.isLogin,adminController.orderLoad)
admin_route.get('/order-details',adminAuth.isLogin,adminController.orderDetails)
admin_route.post('/order-details',adminAuth.isLogin,adminController.statusChange)

//banners
admin_route.get('/banners',adminAuth.isLogin,adminController.bannerLoad)
admin_route.get('/new-banner',adminAuth.isLogin,adminController.newBanner)
admin_route.post('/new-banner',upload.array('image',6),adminController.addBanner)
admin_route.get('/delete',adminAuth.isLogin,adminController.deleteBanner)

//coupon
admin_route.get('/coupon',adminAuth.isLogin,adminController.couponLoad)

admin_route.get('/add-coupon',adminAuth.isLogin,adminController.newCoupon)
admin_route.post('/add-coupon',adminController.addCoupon)
admin_route.get('/deleteCoupon',adminController.deleteCoupon)
//sales report
admin_route.get('/salesReport',adminAuth.isLogin,adminController.salesLoad)
admin_route.post('/SalesFilter',adminAuth.isLogin,adminController.SalesFilter)
admin_route.post('/salesReport-pdf',adminAuth.isLogin,adminController.SalesPdf)


//logout
admin_route.get('/adminlogout',adminController.logout)


admin_route.get('*',function(req,res){
    res.redirect('/admin');
})
 



module.exports= admin_route;

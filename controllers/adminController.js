const User = require('../models/userModel')
const Category = require('../models/categoryModel')
const bcrypt = require('bcrypt')
const Product = require('../models/productModel')
const Order = require('../models/orderModel')
const Banner = require('../models/bannerModel')
const Coupon = require('../models/couponModel')
const multer = require('multer')
// const bodyParser = require('body-parser');
const randomstring = require('randomstring')
const ejs = require('ejs')
const pdf = require('html-pdf')
const fs = require('fs')
const path = require('path')

const { findById, findByIdAndDelete } = require('../models/userModel')
const { log } = require('console')

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10)
    return passwordHash
  } catch (error) {
    console.log(error.message)
  }
}

// // admin login
const loadLogin = async (req, res,next) => {
  try {
    res.render('login')
  } catch (error) {
    console.log(error.message)
    next(error)
  }
}

// //verify login
const verifyLogin = async (req, res,next) => {
  try {
    const email = req.body.email
    const password = req.body.password
    const userData = await User.findOne({ email })
    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password)
      if (passwordMatch) {
        if (userData.is_admin === 0) {
          res.render('login', { message: 'email and password is incorrect' })
        } else {
          req.session.admin_id = userData._id
          res.redirect('/admin/home')
        }
      } else {
        res.render('login', { message: 'email and password is incorrect' })
      }
    } else {
      res.render('login', { message: 'email and password is incorrect' })
    }
  } catch (error) {
    console.log(error.message)
    next(error)
  }
}
const loadDashboard = async (req, res,next) => {
  try {
    const userData = await User.findById({ _id: req.session.admin_id })
    const users = await User.find({})
    const orderData = await Order.find({}).sort({createdDate:'desc'})
    const orderSuccess = await Order.find({paymentStatus:"Charged",status: "Delivered" })
    
    let sum=0
    for(i=0;i<orderSuccess.length;i++){
      sum=sum+orderSuccess[i].totalPrice
    }
  const products = await Product.find({}).populate('category')
  const categoryWise = await Order.aggregate([
    {
         $match:{status:"Delivered"}
    },
    {
        $unwind:"$products"
    },
    {
        $lookup:{
            from:"products",
            localField:"products.productId",
            foreignField:"_id",
            as:"product"
        }
    },
    {
        $unwind:"$product"
    },
    {
        $group:{
            _id:"$product.category",
          //  totalSale:{$sum:"$product.price"}
          totalSale: {
            $sum: {
              $multiply: ["$products.sellingPrice", "$products.quantity"]
            }
          }
        }
    }
   
])
const circular = categoryWise.map((category)=> category.totalSale)


  


  res.render('home', { admin: userData, orderData, users, sum, products,circular })
    
  } catch (error) {
    console.log(error.message)
    next(error)
  }
}
const salesLoad = async(req,res,next)=>{
  try {

  const orderSuccess = await Order.find({status:"Delivered"}).sort({createdDate:'desc'}).populate('products.productId')
    const orderDelivered = await Order.find({status:"Delivered"})
    
    const orderCanclled = await Order.find({status:"Cancelled"})
   
    let sum=0
    for(i=0;i<orderSuccess.length;i++){
      sum=sum+ orderSuccess[i].totalPrice
    }

    res.render('salesReport',{orderSuccess,sum,orderDelivered,orderCanclled,})
  } catch (error) {
    console.log(error.message);
    next(error)
  }
}
const SalesFilter = async(req,res,next)=>{
  try {

   const start = req.body.fromInput
   const end = req.body.toInput
  const orderData = await Order.find({ status:"Delivered",createdDate: {$gte:start, $lte:end}} ).sort({createdDate:'desc'})
   let sum=0
    for(i=0;i<orderData.length;i++){
      sum=sum+orderData[i].totalPrice
    }
   
   const jsonresponse = {orderData,sum}
   res.json(jsonresponse)
  } catch (error) {
    console.log(error.message)
    next(error)
  }
}
const SalesPdf = async(req,res,next)=>{
  try {
    const start = req.body.start
   const end = req.body.end
    const orderSuccess = await Order.find({ status:"Delivered",createdDate: {$gte:start, $lte:end}} ).sort({createdDate:'desc'}).populate('products.productId')
    
    const data ={
      orderSuccess:orderSuccess
    }
  const filePath =  path.resolve(__dirname,'../views/admin/salesPdf.ejs')
  const htmlString =fs.readFileSync(filePath).toString()
 const ejsData = ejs.render(htmlString,data)
 let options ={
    format: 'A4',
   orientation: "portrait",
    border: "10mm"

 }
       pdf.create(ejsData, options).toStream((err, stream) => {
            if (err) {
                console.log(err);
            }
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="sales-report.pdf"'
            });
            stream.pipe(res);
        });

 console.log('pdf generated')
  } catch (error) {
    console.log(error.message);
    next(error)
  }
}
// user loading
const userLoad = async (req, res,next) => {
  try {
    const userData = await User.find({})
    res.render('user', { userData })
  } catch (error) {
    console.log(error.message)
    next(error)
  }
}
// user blocking and unblocking
const blockUser = async (req, res,next) => {
  try {
    user_id = req.query.id
    console.log(user_id)
    const userData = await User.findOne({ _id: user_id })
    const value = userData.is_blocked
    console.log(value)
    if (value === 1) {
      const UserUpdate = await User.findByIdAndUpdate({ _id: user_id }, { $set: { is_blocked: 0 } })
      res.redirect('/admin/user')
    } else if (value === 0) {
      const UserUpdate = await User.findByIdAndUpdate({ _id: user_id }, { $set: { is_blocked: 1 } })
      res.redirect('user')
      console.log(userData)
    }
  } catch (error) {
    console.log(error.message)
    next(error)
  }
}
// category show
const categoryLoad = async (req, res,next) => {
  try {
    const categoryData = await Category.find({is_delete:false})
    res.render('category', { categoryData })
  
  } catch (error) {
    console.log(error.message)
    next(error)
  }
}
// add new category load

const addCategoryLoad = async (req, res,next) => {
  try {
    res.render('newcategory')
  } catch (error) {
    next(error)
  }
}

// add new category
const addCategory = async (req, res,next) => {
  try {
       const name = req.body.name
    const categoryList = await Category.findOne({name:{$regex:'.*'+name+'.*',$options:'i'}})
    
   if(categoryList){


    res.redirect('category')


   }
   
   
   else{
    const category = new Category({
      name: name,
      discription: req.body.discription

    })
    const categoryData = await category.save()
    res.redirect('category')}
  } catch (error) {
    console.log(error.message)
    next(error)
  }
}

// delete category
const deleteCategory = async (req, res,next) => {
  try {
    user_id = req.query.id
    const userData = await Category.findByIdAndDelete({ _id: user_id })
    res.redirect('/admin/category')
  } catch (error) {
    console.log(error.message)
    next(error)
  }
}
// update Category page
const updateCategoryLoad = async (req, res,next) => {
  try {
    user_id = req.query.id
    const categoryData = await Category.findOne({ _id: user_id })
    console.log(categoryData)
    res.render('updatecategory', { category: categoryData })
  } catch (error) {
    console.log(error.mesage)
    next(error)
  }
}
// update category
const updateCategory = async (req, res,next) => {
  try {
    const product_id = req.body.id
    const categoryupdatedData = await Category.findByIdAndUpdate({ _id: product_id }, { $set: { name: req.body.name, discription: req.body.discription } })
    res.redirect('/admin/category')
  } catch (error) {
    console.log(error.mesage)
    next(error)
  }
}

const orderLoad = async(req,res,next)=>{
  try {
   const orders= await Order.find({}).populate('user')
     res.render('order',{orders})
  } catch (error) {
    console.log(error.message);
    next(error)
  }

}
const orderDetails = async(req,res,next)=>{
  try {
    order_id = req.query.id
    const orderData = await Order.findOne({_id:order_id})
    let products =[]
    for(let i=0;i<orderData.products.length;i++){
    products[i]= await Product. findById ({_id:orderData.products[i].productId})}
    console.log('productsss',products[0]);
    res.render('order-details',{orderData,products})
  } catch (error) {
    console.log(error.message);
    next(error)
  }
}
const statusChange = async(req,res,next)=>{
  const staus = req.body.statusChange
  const payment = req.body.paymentChange
  const order_id = req.query.id
  const changeStatus = await Order.findByIdAndUpdate({_id:order_id},{$set:{status:staus,paymentStatus:payment}})
  res.redirect('/admin/order')

}

const bannerLoad = async(req,res)=>{
  const banner = await Banner.find({})

  try {
    res.render('banner',{banner})
  } catch (error) {
    console.log(error.message);
    next(error)
  }
}





const newBanner = async(req,res,next)=>{
try {

  res.render('newbanner1')
} catch (error) {
  console.log(error.message);
}

}
const addBanner = async(req,res,next)=>{
try {
  let files =[]
  const imageUpload = await (function(){
    for(let i=0;i<req.files.length;i++){
      files[i]=req.files[i].filename
    }
    return files
  })()

  const banner = new Banner({
    name: req.body.name,
    link: req.body.Url,
    image: imageUpload
  })
  const BannerData = await banner.save()
  res.redirect('/admin/banners')
      
} catch (error) {
  console.log(error.message);
  next(error)
}


}
const deleteBanner = async(req,res,next)=>{
  try {
  
    const id = req.query.id
    const deleteBanner = await Banner.findByIdAndDelete({_id:id})
    res.redirect('/admin/banners')

    

  } catch (error) {
    console.log(error.message);
    next(error)
  }
}
const couponLoad = async(req,res,next)=>{
  couponData = await Coupon.find({})
  try {
    res.render('coupon',{couponData})
  } catch (error) {
    console.log(error.message);
    next(error)
  }
}

const newCoupon = async(req,res,next)=>{
  try {
    res.render('new-Coupon1')
  } catch (error) {
    console.log(error.messge);
    next(error)
  }
}

const addCoupon = async(req,res,next)=>{
  try {
      

    const newCoupon = new Coupon({
      code:req.body.code,
      discountType:req.body.discountType,
      discountAmount:req.body.discountAmount,
      maxDiscountAmount:req.body.MaxdiscountAmount,
      minPurchase:req.body.Minpurchase,
      expirationDate:req.body.expirationDate
    });
    
    // Save the new coupon to the database
    await newCoupon.save();
    res.redirect('/admin/coupon')
  } catch (error) {
    console.log(error.message);
    next(error)
  }
}

const deleteCoupon =async(req,res,next)=>{
  try {
      const id = req.query.id
      const deleteCoupon = await Coupon.findByIdAndDelete({_id:id})
      res.redirect('/admin/coupon')
  } catch (error) {
    console.log(error.message);
    next(error)
  }
}


// logout
const logout = async (req, res,next) => {
  try {
    req.session.admin_id=""
    res.redirect('/admin')
  } catch (error) {
    console.log(error.mesage)
    next(error)
  }
}


module.exports = {
  loadLogin,
  verifyLogin,
  loadDashboard,
  salesLoad,
  SalesFilter,
  SalesPdf,
  categoryLoad,
  addCategoryLoad,
  addCategory,
  userLoad,
  blockUser,
  deleteCategory,
  updateCategoryLoad,
  updateCategory,
  orderLoad,
  orderDetails,
  statusChange,
  bannerLoad,
  newBanner,
  addBanner,
  deleteBanner,
  couponLoad,
  newCoupon,
  addCoupon,
  deleteCoupon,
  logout
  
}

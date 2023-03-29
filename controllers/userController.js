require('dotenv').config()
const User = require("../models/userModel")
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer")
const randomstring = require('randomstring');
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const otpGenerator = require('otp-generator')
const Banner = require('../models/bannerModel')
const Cart = require('../models/cartModel')




//  function for making password secure
const securePassword = async(password)=>{
    try {
        const passwordHash =await bcrypt.hash(password,10)
        return passwordHash;
        
    } catch (error) {
     console.log(error.message);   
    }

}
var otp;


// for mail send
const sendVerifyMail = async(name,email,user_id,next)=>{
    
try {
     otp =  otpGenerator.generate(4, { specialChars:false,upperCaseAlphabets:false,lowerCaseAlphabets:false });
     console.log(otp);

   const transporter = nodemailer.createTransport({
        host:'smtp.gmail.com',
        port:587,
        secure:false,
        requireTLS:true,
        auth:{
            user: process.env.myemail,
            pass: process.env.mypassword
        }
    });
    const mailOptions = {
        from : process.env.myemail,
        to : email,
        subject:'for verifying account',
        html:'<p> Hello '+name+',your otp is '+otp+''
    }
    transporter.sendMail(mailOptions,function(error,info){
       if(error){
        console.log(error);
       }else{
        console.log("email has been send",info.response);
       }

    })

    
} catch (error) {
    console.log(error.message);
    next(error)
}
}
//for reset password
const sendResetMail = async(name,email,token,next)=>{
    try {
       const transporter = nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user: process.env.myemail,
                pass: process.env.mypassword
            }
        });
        const mailOptions = {
            from : process.env.myemail,
            to : email,
            subject:'for password reset',
            html:'<p> Hello '+name+',click here to <a href="http://localhost:3000/forget-password?token='+token+'"> reset </a> your MENSPACE account password</p>'
        }
        transporter.sendMail(mailOptions,function(error,info){
           if(error){
            console.log(error);
           }else{
            console.log("email has been send",info.response);
           }
    
        })
    
        
    } catch (error) {
        console.log(error.message);
        next(error)
    }
    }
    
// loading loadpage
const loadpage=async(req,res,next)=>{
    try {
    const  userData = req.session.user_id
    
    const bannerData = await Banner.find({})
    const products = await Product.find({})
    if(userData){
        const cart = await Cart.findOne({user:userData})
        const user = await User.findOne({_id:userData})
        
        res.render('loadpage',{userData,bannerData,products,cart})
       
    }else{
        let cartlength=0
        let wishlist=0
        res.render('loadpage',{bannerData,products,cartlength,wishlist})
    }
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}

//loading registration form
const loadRegister = async(req,res,next)=>{
    try {
        res.render('registration')
    } catch (error) {
        console.log(error.message)  
        next(error)      
    }
}
// Adding user 
const insertUser = async(req,res,next)=>{
    try {
        const checkEmail = await User.findOne({email:req.body.email})
        const checkNumber = await User.findOne({mobile:req.body.mobile})
        if(checkEmail){
            res.render('registration',{message:"Email is already registered"})
        }else if(checkNumber){
            res.render('registration',{message:" Mobile is already registered"})
        }else

        {
        const spassword = await securePassword(req.body.password)
        
        
        const user =new User({
              name: req.body.name,
              email: req.body.email,
              mobile: req.body.mobile,
              password: spassword,
              is_admin:0
    
        })
        const userData = await user.save()
        

        
    
        if(userData){
            
         sendVerifyMail(req.body.name,req.body.email,userData._id);
        
    
            res.render('otp',{userData})
        }else{
            res.render('registration',{message:"account registartion failed"})  
        }
    }
    } catch (error) {
        console.log(error.message)
        next(error)
    }
    
    }


//verifying mail
  
const verifyMail = async(req,res,next)=>{
  try {
    const user_id = req.body.id
    const userOtp = req.body.otpvalue
    if(userOtp === otp){
    const updateInfo = await User.updateOne({_id:req.body.id},{$set:{ is_verified:1  }})

    
    res.render('email-verified');
    

        }else{
        res.render('registration')
    }

  } catch (error) {
    console.log(error.message)
    next(error)
  }
  
}



// loading login page

const loginLoad = async(req,res,nex)=>{
    try {
        res.render('login')
        
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}
//login verify
const verifyLogin = async (req,res,next) => {
    
    try {
       
        const email = req.body.email;
        const password = req.body.password;
     const userData = await User.findOne({email:email})
    
     if(userData){
          const passwordMatch =  await bcrypt.compare(password, userData.password);
          if(passwordMatch && userData.is_verified == 1 && userData.is_blocked === 0 && userData.is_admin === 0){
            req.session.user_id=userData._id

            res.redirect('/')                 

          }else if(userData.is_blocked === 1){
            res.render('login',{message:'your account has been blocked, pls Contact admin '})
          }
          
          else{
            res.render('login',{message:"wrong email or password "});
          }


     }else{

        res.render('login',{message:"wrong email or password "});
     }
        
    } catch (error) {
        console.log("verify login catch error");
        console.log(error.message)
        next(error)
    }
}

    // logout
const userLogout = async(req,res,next)=>{
    try {
        req.session.user_id = ''
        res.redirect('/');
        
    } catch (error) {
        console.log(error.message)
        next(error)
    }
    
    }
    
//forget password
const forgetLoad = async(req,res,next)=>{
try {
    res.render('forget')
    
} catch (error) {
    console.log(error.message)
    next(error)
}

}
const forgetLink = async(req,res,next)=>{
    try {
        const email = req.body.email;
       const userData = await User.findOne({email:email})
       if (userData) {
        
        if(userData.is_verified==0){
            res.render('forget',{message:'email verification not done'})
        }else{
            const randomString = randomstring.generate();
          const updatedData = await User.updateOne({email:email},{$set:{token:randomString}})
          sendResetMail(userData.name,userData.email,randomString)
          res.render('forget',{message:'check your mail to reset password'})
        }
       } else {
        res.render('forget',{message:'There is no account in this email'})
       }
    } catch (error) {
       console.log(error.message) 
       next(error)
    }
}

const forgetPasswordLoad = async(req,res,next)=>{
    try {
        const token = req.query.token;
     const tokenData =await User.findOne({token:token});
     console.log(tokenData);
     if (tokenData) {
        res.render('forget-password',{ user_id : tokenData})
     } else {
        res.render('404',{message:'token is invalid'})
     }
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}

const resetPassword = async(req,res,next)=>{
    try {
        const password = req.body.password
        const user_id = req.body.user_id;
       
        const secure_password = await securePassword(password)
    const updatedData = await User.findByIdAndUpdate({_id:user_id},{$set:{password:secure_password ,token:'' }})
              res.render('forget success',{message:'password updated succesfully'})
              console.log(updatedData);
    } catch (error) {
       console.log(error.message);
       next(error)
    }
}

// const shopePage = async (req, res) => {
//     try {

//         const category = (req.query.categoryId)
//         const search = (req.query.search) || "";
//         const sort = (req.query.sort) || "";
//         let isRender = false;

//         if (req.query.isRender) {
//             isRender = true
//         }

//         const searchData = new String(search).trim()

//         const query = {
//             is_delete: false,
//         }

//         let sortQuery = { price: 1 }
//         if (sort == 'high-to-low') {
//             sortQuery = { price: -1 }
//         }

//         if (search) {
//             query["$or"] = [
//                 { name: { $regex: "." + searchData + ".", $options: "i" } },
//                 { description: { $regex: searchData, $options: "i" } },
//             ];
//         }

//         if (category) {
//             query["$or"] = [
//                 { category: category }
//             ];
//         }


//         const product = await Product.find(query).sort(sortQuery)

//         const productsPerPage = 5;
//         const page = req.query.page || 1;
//         const startIndex = (page - 1) * productsPerPage;
//         const endIndex = startIndex + productsPerPage;
//         const pageProducts = product.slice(startIndex, endIndex);
//         const totalPages = Math.ceil(product.length / productsPerPage);
//         // -----------Category finding
//         const categoryData = await Catogery.find({})

//         // ----------------------
//         let cartCount = 0;
//         const cartData = await Cart.findOne({ user: req.session.user_id }).populate('product')
//         if (cartData) {
//             cartCount = cartData.product.length
//         } else {
//             cartCount = 0;
//         }
//         // -------------------
//         let wishListCount = 0;
//         const wishListData = await WishList.findOne({ user: req.session.user_id }).populate('product')
//         if (wishListData) {
//             wishListCount = wishListData.product.length
//         } else {
//             wishListCount = 0;
//         }
//         // ---------------------
//         if (isRender == true) {
//             res.json({
//                 pageProducts,
//                 totalPages,
//                 currentPage: parseInt(page, 10),
//                 product,
//                 // cartCount,
//                 // wishListCount
//             })
//         } else {
//             res.render('shope', {
//                 pageProducts,
//                 totalPages,
//                 currentPage: parseInt(page, 10),
//                 product,
//                 cartCount,
//                 wishListCount,
//                 categoryData

//             });
//         }

//     } catch (error) {
//         console.log(error.message);
//         console.log("Shope Page Section");
//         res.render('cacheHandle')

//     }
// }

//shopLoad
// const shopLoad = async(req,res,next)=>{
//     try {
       
//         let isRender = false;

//         if (req.query.isRender) {
//             isRender = true
//         }
     
//         const userData = req.session.user_id || " "
//         const productList = await Product.find({})
//         const categorylist = await Category.find({})
       
        
//         if(userData){

            
//             if (isRender == true) {
//                 const categoryFilter = req.query.categoryId
//                 const query = {
            
//                 }
        
//                 if(categoryFilter){
//                     query["$or"] = [
//                         { category: categoryFilter }
//                     ];
//                 }
//                 const product = await Product.find(query)
//                 res.json({
//                     // pageProducts,
//                     // totalPages,
//                     // currentPage: parseInt(page, 10),
//                     product,
//                     userData
//                     // cartCount,
//                     // wishListCount
//                 })
//             }  else{
       
//         res.render('shop',{productList,userData,categorylist})}}
//         else{
//             if (isRender == true) {
//                 res.json({
//                     // pageProducts,
//                     // totalPages,
//                     // currentPage: parseInt(page, 10),
//                     product,
//                     // userData
//                     // cartCount,
//                     // wishListCount
//                 })
//             } else{
//             res.render('shop',{productList,categorylist})  
//         }
//     }
//     } catch (error) {
//         console.log(error.message);
//     }

// }
const shopLoad = async(req,res,next)=>{
    try {
        const sort = req.query.sort;
       
        let query ={

        }

        var sortValue = 1
        if(sort == "high-to-low"){
           sortValue = -1;
        }
       const productList = await Product.find({}).sort({price:sortValue})
        
        const userData = req.session.user_id
       
        const categorylist = await Category.find({})
        

        if(req.query.isRender){
            res.json({
                productList,
                userData,
                categorylist,
                
                cartlength,
                wishlist
            })}else{
        if(userData){
            
            const cartData = await Cart.findOne({user:req.session.user_id})
            const user = await User.findOne({_id:userData})
              res.render('shop2',{productList,userData,categorylist,cartData})
           
        }else{
            let cartlength=0
            let wishlist=0
            res.render('shop2',{productList,categorylist,cartlength,wishlist})
        }} 
    } catch (error) {
        console.log(error.message);
        next(error)
    }

}
const logoutUser = async(req,res,next)=>{
    try {

        req.session.user_id = ''
  
        res.redirect('/')
    } catch (error) {
       console.log(error.message); 
       next(error)
    }
}

const productDetail = async(req,res,next)=>{
    try {
     const userData = req.session.user_id
     const productData = await Product.findById({_id:req.query.id})
    

     if(userData){
        
          
        
          res.render('productdetails',{productData,userData})
       
    }else{
        let cartlength=0
        let wishlist=0
        res.render('productdetails',{productData,userData,cartlength,wishlist})
    } 
    
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

const userProfile = async(req,res,next)=>{
    try {
     const  userid = await req.session.user_id
     
     const userData = await User.findOne({_id:userid})
     if(userid){
       
        res.render('userProfile',{userData})
     }else{
        res.redirect('/login')
     }
        
    } catch (error) {
        console.log(error.message);
        next(error)
}
}
const userEdit = async(req,res,next)=>{
try {
    const user_id = req.session.user_id
    const userData = await User.findOne({_id:user_id})
    if(userData){
    res.render('userEdit',{userData})
}else{
    res.redirect('/login')
}
} catch (error) {
    console.log(error.message);
    next(error)
}
}
const userEdited= async(req,res,next)=>{
    try {
        const userid = req.session.user_id;
        const userData = await User.findByIdAndUpdate({_id:userid},{$set:{name:req.body.name,email:req.body.email,mobile:req.body.mobile,Address:[{address:req.body.address,postcode:req.body.postcode,city:req.body.city,state:req.body.state}]}}) 
    res.redirect('/userProfile')
        
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}

const addressPage= async(req,res,next)=>{
    try {
      const userid = req.session.user_id
      const userData = await User.findOne({_id:userid})
     
      const address = userData.Address
     
      if(userid){
               res.render('addressPage',{userData,address})
      }else{
        res.redirect('/login')
      }
    } catch (error) {
      console.log(error.message);
      next(error)
    }
  
  
  }

const addAddress = async(req,res,next)=>{
   const userData = req.session.user_id
    try {
        res.render('addAddress',{userData})
    } catch (error) {
       console.log(error.message); 
       next(error)
    }
}

const addAddressIn = async (req, res) => {
    try {
      const userId = req.session.user_id
      let Address ={
        name:req.body.name,
        address:req.body.address,
        postcode:req.body.postcode,
        city:req.body.city,
        state:req.body.state,
        mobile:req.body.mobile
      };
      const userData = await User.findByIdAndUpdate(
        { _id: userId },
        { $push: { Address: [ Address ] } }
      )
      res.redirect('/manageAddress')
    } catch (error) {
      console.log(error.message);
      next(error)
    }
  };
 
  const editAddress = async (req, res) => {
    try {
      const addressid = req.query.id;
      const userData = await User.findOne({ _id: req.session.user_id})
      const userAddress = userData.Address
     const value = userAddress.find(item=>item._id==req.query.id)
    
  
      res.render('editaddress', { userData, value });
    } catch (error) {
      console.log(error.message);
      next(error)
    }
  };
  const addressEdit = async(req,res,next)=>{
     try {
      const addressid = req.body._id
      const updated = await User.updateOne({_id:req.session.user_id,'Address._id':addressid},
      {$set:{
        'Address.$.name':req.body.name,
        'Address.$.address':req.body.address,
        'Address.$.postcode':req.body.postcode,
        'Address.$.city':req.body.city,
        'Address.$.state':req.body.state,
      } })

       res.redirect('/manageAddress')

      
     } catch (error) {
        console.log(error.message);
        next(error)
     }
  }
  
 const deleteAddress = async(req,res,next)=>{
    try {
        const userData = req.session.user_id
        const addressid = req.query.id
      const addressDelete = await  User.updateOne(
            { _id: userData },
            { $pull: { Address: { _id:req.query.id } } })

            res.redirect('/manageAddress')
    } catch (error) {
        console.log(error.message);
        next(error)
    }
 } 


module.exports = {
    loadpage,
    loadRegister,
    insertUser,
    verifyMail,
    loginLoad,
    verifyLogin,
   
    forgetLoad,
    forgetLink,
    forgetPasswordLoad,
    resetPassword,
    shopLoad,
    logoutUser,
    productDetail,
    userProfile,
    userEdit,
    userEdited,
    addressPage,
    addAddress,
    addAddressIn,
    editAddress,
    addressEdit,
    deleteAddress

    
    

    
    
}

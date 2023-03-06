require('dotenv').config()
const User = require("../models/userModel")
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer")
const randomstring = require('randomstring');
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const otpGenerator = require('otp-generator')
const Banner = require('../models/bannerModel')


// for mail send
// const sendVerifyMail = async(name,email,user_id)=>{
    
//     const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
//     try {
//        const transporter = nodemailer.createTransport({
//             host:'smtp.gmail.com',
//             port:587,
//             secure:false,
//             requireTLS:true,
//             auth:{
//                 user: process.env.myemail,
//                 pass: process.env.mypassword
//             }
//         });
//         const mailOptions = {
//             from : process.env.myemail,
//             to : email,
//             subject:'for verifying account',
//             html:'<p> Hello '+name+',click here to <a href="http://localhost:3000/verify?id='+user_id+'"> verify </a> your MENSPACE account</p>'
//         }
//         transporter.sendMail(mailOptions,function(error,info){
//            if(error){
//             console.log(error);
//            }else{
//             console.log("email has been send",info.response);
//            }
    
//         })
    
        
//     } catch (error) {
//         console.log(error.message);
//     }
//     }

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
const sendVerifyMail = async(name,email,user_id)=>{
    
try {
     otp =  otpGenerator.generate(4, { upperCaseAlphabets: false, specialChars: false });
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
}
}
//for reset password
const sendResetMail = async(name,email,token)=>{
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
    }
    }
    
// loading loadpage
const loadpage=async(req,res)=>{
    try {
    const  userData = req.session.user_id
    const bannerData = await Banner.find({})
    const products = await Product.find({})
    if(userData){
        res.render('loadpage',{userData,bannerData,products})
        console.log('hi');
    }else{
        res.render('loadpage',{bannerData,products})
    }
    } catch (error) {
        console.log(error.message)
    }
}

//loading registration form
const loadRegister = async(req,res)=>{
    try {
        res.render('registration')
    } catch (error) {
        console.log(error.message)        
    }
}
// Adding user 
const insertUser = async(req,res)=>{
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
        
    //     if(userData){
            
    //         sendVerifyMail(req.body.name,req.body.email,userData._id);
           
       
    //            res.render('registration',{message:"account registration succesful,please verify your email")
    //        }else{
    //            res.render('registration',{message:"account registartion failed"})  
    //        }
    //    }
        
    
        if(userData){
            
         sendVerifyMail(req.body.name,req.body.email,userData._id);
        
    
            res.render('otp',{userData})
        }else{
            res.render('registration',{message:"account registartion failed"})  
        }
    }
    } catch (error) {
        console.log(error.message)
    }
    
    }


// verifying mail
// const verifyMail = async(req,res)=>{
//   try {
//     const updateInfo = await User.updateOne({_id:req.query.id},{$set:{ is_verified:1  }})

//     console.log(updateInfo);
//     res.render('email-verified');

//   } catch (error) {
//     console.log(error.message)
//   }

// }
//verifying mail
  
const verifyMail = async(req,res)=>{
  try {
    const user_id = req.body.id
    const userOtp = req.body.otpvalue
    if(userOtp === otp){
    const updateInfo = await User.updateOne({_id:req.body.id},{$set:{ is_verified:1  }})

    console.log(updateInfo);
    res.render('email-verified');
    

        }else{
        res.render('registration')
    }

  } catch (error) {
    console.log(error.message)
  }
  
}


// otp twilio
// const sendOTP = async (req, res, next) => 
// { const countryCode, phoneNumber} = req.body;
// try{
// const otpResponse = await client.verify .services (VA8ef99a0f83480395818a7d38e35e07f1)
// .verifications.create({

// to: +${countryCode}${phoneNumber}`,


// });
// channel: "sms",
// res.status(200).send(OTP send successfully!: $(JSON.stringify(otpResponse)}`);
// }catch(error) {
// res.status(error?.status || 400).send(error?.message || 'Something went wrong!');

// };


// // verify otp
// const verifyOTP = async (req, res, next) =>
//  { const { countryCode, phoneNumber, otp } = req.body;
// try{
// const verifiedResponse = await client.verify.services (VA8ef99a0f83480395818a7d38e35e07f1).verificationChecks.create({
// to:+${countryCode}${phoneNumber},
// code: otp,
// });
// res.status(200).send(`OTP verified successfully!: ${JSON.stringify(verifiedResponse)}`); 
// }
// catch(error) {
// res.status(error?.status || 400).send(error?.message || 'Something went wrong!');
// }}





// loading login page

const loginLoad = async(req,res)=>{
    try {
        res.render('login')
        
    } catch (error) {
        console.log(error.message);
    }
}
//login verify
const verifyLogin = async (req,res) => {
    console.log("verify login");
    try {
        console.log("hello");
        const email = req.body.email;
        const password = req.body.password;
     const userData = await User.findOne({email:email})
     console.log(userData);
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
    }
}
// get home
const loadHome = async(req,res)=>{
    try {
         if(req.session.user_id){
             const userData=await User.findById({_id:req.session.user_id})
             const bannerData = await Banner.find({})
             
           res.render('home',{bannerData})
        }else{
        res.redirect('/login')
         }
        
        
    } catch (error) {
        
        console.log(error.message)
    }
    
    }
    // logout
const userLogout = async(req,res)=>{
    try {
        req.session.destroy();
        res.redirect('/');
        
    } catch (error) {
        console.log(error.message)
    }
    
    }
    
//forget password
const forgetLoad = async(req,res)=>{
try {
    res.render('forget')
    
} catch (error) {
    console.log(error.message)
}

}
const forgetLink = async(req,res)=>{
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
    }
}

const forgetPasswordLoad = async(req,res)=>{
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
    }
}

const resetPassword = async(req,res)=>{
    try {
        const password = req.body.password
        const user_id = req.body.user_id;
        console.log(user_id)
        const secure_password = await securePassword(password)
    const updatedData = await User.findByIdAndUpdate({_id:user_id},{$set:{password:secure_password ,token:'' }})
              res.render('forget success',{message:'password updated succesfully'})
              console.log(updatedData);
    } catch (error) {
       console.log(error.message);
    }
}
//shopLoad
const shopLoad = async(req,res)=>{
    try {
        const productList = await Product.find({})
        const userData = req.session.user_id
        const categorylist = await Category.find({})
        if(userData){
        
        console.log(productList);
        res.render('shop',{productList,userData,categorylist})}
        else{
            res.render('shop',{productList,categorylist})  
        }
    } catch (error) {
        console.log(error.message);
    }

}
const logoutUser = async(req,res)=>{
    try {
        req.session.user_id=""
        res.redirect('/')
    } catch (error) {
       console.log(error.message); 
    }
}

const productDetail = async(req,res)=>{
    try {
     const userData = await req.session.user_id
    const productData = await Product.findById({_id:req.query.id})
    console.log("product details");
    console.log(productData);
        
        res.render('productdetails',{productData,userData})
    } catch (error) {
        console.log(error.message);
    }
}

const userProfile = async(req,res)=>{
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
}
}
const userEdit = async(req,res)=>{
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
}
}
const userEdited= async(req,res)=>{
    try {
        const userid = req.session.user_id;
        const userData = await User.findByIdAndUpdate({_id:userid},{$set:{name:req.body.name,email:req.body.email,mobile:req.body.mobile,Address:[{address:req.body.address,postcode:req.body.postcode,city:req.body.city,state:req.body.state}]}}) 
    res.redirect('/userProfile')
        
    } catch (error) {
        console.log(error.message);
    }
}

const addressPage= async(req,res)=>{
    try {
      const userid = req.session.user_id
      const userData = await User.findOne({_id:userid})
      console.log(userData,"useeeerr");
      const address = userData.Address
      console.log(address,'here is address');
      console.log(address.length,'my addressss');
      if(userid){
               res.render('addressPage',{userData,address})
      }else{
        res.redirect('/login')
      }
    } catch (error) {
      console.log(error.message);
    }
  
  
  }

const addAddress = async(req,res)=>{
   const userData = req.session.user_id
    try {
        res.render('addAddress',{userData})
    } catch (error) {
       console.log(error.message); 
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
    }
  };
 
  const editAddress = async (req, res) => {
    try {
      const addressid = req.query.id;
      const userData = await User.findOne({ _id: req.session.user_id})
      const userAddress = userData.Address
     const value = userAddress.find(item=>item._id==req.query.id)
     console.log(value,'addressss');
  
      res.render('editaddress', { userData, value });
    } catch (error) {
      console.log(error.message);
    }
  };
  const addressEdit = async(req,res)=>{
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
     }
  }
  
 const deleteAddress = async(req,res)=>{
    try {
        const userData = req.session.user_id
        const addressid = req.query.id
      const addressDelete = await  User.updateOne(
            { _id: userData },
            { $pull: { Address: { _id:req.query.id } } })

            res.redirect('/manageAddress')
    } catch (error) {
        console.log(error.message);
    }
 } 


module.exports = {
    loadpage,
    loadRegister,
    insertUser,
    verifyMail,
    loginLoad,
    verifyLogin,
    loadHome,
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

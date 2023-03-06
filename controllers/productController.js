const User = require('../models/userModel')
const Category = require('../models/categoryModel')
const bcrypt = require('bcrypt')
const Product = require('../models/productModel')
const multer = require('multer')






// product loading
const productLoad = async (req, res) => {
 
    const productData = await Product.find({}).populate('category')
  console.log(productData);
    try {
      res.render('products', { productData })
    } catch (error) {
      console.log(error.mesage)
    }
  }
// add new product load
const addProductLoad = async (req, res) => {
    try {
      const productData = await Category.find({})
      res.render('newproduct', { productData })
    } catch (error) {
      console.log(error.message)
    }
  }
  // const categoryLoad = async (req, res) => {
  //   // res.render('category')
  //   categoryData = await Category.find({})
  //   singleCategory  = await Category.findById({ _id: req.query.id})
  //   categoryProducts = await Product.find({category: req.query.id}).populate('product')
  //   console.log('single category ' + singleCategory)
  //   console.log(' category products ' + categoryProducts)
  //   res.render('category', {singleCategory, categoryData, authorData})
  // }
  const categoryPage = async(req,res)=>{
    try {
      categorylist = await Category.find({})
      singleCategory  = await Category.findById({ _id: req.query.id})
      categoryProducts = await Product.find({category: req.query.id})
      res.render('categoryShop', {singleCategory, categoryProducts,categorylist})
      
    } catch (error) {
      console.log(error.message);
    }
  }


// add new product
const addProduct = async (req, res) => {
    try {
      console.log(req.files);
      let files =[]
      const imageUpload = await (function(){
        for(let i=0;i<req.files.length;i++){
          files[i]=req.files[i].filename
        }
        return files
      })()
  
      const product = new Product({
        name: req.body.name,
        discription: req.body.discription,
        price: req.body.price,
        image : imageUpload,
        category: req.body.category,
        stock:req.body.stock
      })
      const productData = await product.save()
      res.redirect('/admin/products')
   } catch (error) {
      console.log(error.message)
    }
  }





  // updateproduct load

const updateProductLoad = async (req, res) => {
    try {
      const productId = req.query.id
  
      console.log('hii')
      const categoryData = await Category.find({})
      
      const productData = await Product.findOne({ _id: req.query.id }).populate('category')
      console.log(productData.category.name)

      //console.log(productData);
      res.render('updateProduct', { productData,categoryData })
    } catch (error) {
      console.log(error.message)
    }
  }
  // update product
  const updateProduct = async (req, res) => {
    try {
  
      let files =[]
      const imageUpload = await (function(){
        for(let i=0;i<req.files.length;i++){
          files[i]=req.files[i].filename
        }
        return files
      })()
      console.log('im here');
      const productId = req.body.id
      console.log('product update ID',productId);
      if(req.files.length>0){
      console.log('im at if');
      const updateData = await Product.findOneAndUpdate({_id: productId }, { $set: { name: req.body.name, discription: req.body.discription,category:req.body.category, price: req.body.price,image:imageUpload,stock:req.body.stock} })
      
      res.redirect('/admin/products')}
      else{
        console.log('im at else');
        const updateData = await Product.findOneAndUpdate({_id: productId }, { $set: { name: req.body.name, discription: req.body.discription,category:req.body.category, price: req.body.price,stock:req.body.stock} })
            res.redirect('/admin/products')
      }
    } catch (error) {
      console.log(error.message)
      console.log('its an product update error');
    }
     }
  
    // delete product
     const deleteProduct = async (req, res) => {
    try {
      const product_id = req.query.id
      const deleteData = await Product.findByIdAndDelete({ _id: product_id })
      res.redirect('/admin/products')
    } catch (error) {
      console.log(error.message)
    }
  }


  module.exports = {
 productLoad,
 addProductLoad,
 addProduct,
 deleteProduct,
 updateProduct,
 updateProductLoad,
 categoryPage


  }
const User = require('../models/userModel')
const Category = require('../models/categoryModel')
const bcrypt = require('bcrypt')
const Product = require('../models/productModel')
const multer = require('multer')


// category show
const categoryLoad = async (req, res) => {
  try {
    const categoryData = await Category.find({ is_delete: false })
    res.render('category', { categoryData })
  } catch (error) {
    console.log(error.message)
  }
}

// add new category load

const addCategoryLoad = async (req, res) => {
  try {
    res.render('newcategory')
  } catch (error) {

  }
}

// add new category
const addCategory = async (req, res) => {
  try {
    const name = req.body.name
    const categoryList = await Category.findOne({ name: { $regex: '.*' + name + '.*', $options: 'i' } })

    if (categoryList) {

      res.render('newcategory',{message:"category already exist"})


    }


    else {
      const category = new Category({
        name: name,
        discription: req.body.discription

      })
      const categoryData = await category.save()
      res.redirect('category')
    }
  } catch (error) {
    console.log(error.message)
  }
}


// delete category
const deleteCategory = async (req, res) => {
  try {
    user_id = req.query.id
    const userData = await Category.findByIdAndDelete({ _id: user_id })
    res.redirect('/admin/category')
  } catch (error) {
    console.log(error.message)
  }
}
// update Category page
const updateCategoryLoad = async (req, res) => {
  try {
    user_id = req.query.id
    const categoryData = await Category.findOne({ _id: user_id })
   
    res.render('updatecategory', { category: categoryData })
  } catch (error) {
    console.log(error.mesage)
  }
}
// update category
const updateCategory = async (req, res) => {
  try {
    const product_id = req.body.id
    const categoryupdatedData = await Category.findByIdAndUpdate({ _id: product_id }, { $set: { name: req.body.name, discription: req.body.discription } })
    res.redirect('/admin/category')
  } catch (error) {
    console.log(error.mesage)
  }
}

module.exports = {
  categoryLoad,
  addCategoryLoad,
  addCategory,
  updateCategoryLoad,
  updateCategory,
  deleteCategory

}
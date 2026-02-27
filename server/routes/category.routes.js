const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/tree', categoryController.getCategoryTree);

module.exports = router;

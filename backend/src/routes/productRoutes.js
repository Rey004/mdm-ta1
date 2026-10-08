const express = require('express');
const router = express.Router();
const {
  getProducts,
  getLowStockAlerts,
  createProduct,
  updateProduct,
  updateStock,
  deleteProduct,
  seedProducts,
} = require('../controllers/productController');

// 1. View / List products with search
router.get('/', getProducts);

// 2. Low-stock alerts
router.get('/alerts/low-stock', getLowStockAlerts);

// 3. Reset / Seed test data
router.post('/seed', seedProducts);

// 4. Add new product
router.post('/', createProduct);

// 5. Update product record (price, details)
router.put('/:id', updateProduct);

// 6. Update stock quantity (with underflow check)
router.patch('/:id/stock', updateStock);

// 7. Delete product
router.delete('/:id', deleteProduct);

module.exports = router;

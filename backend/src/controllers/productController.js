const Product = require('../models/Product');
const { isMemoryMode } = require('../config/db');

// Simple initial test products for easy demonstration
const initialProducts = [
  {
    _id: '66f5c1000000000000000001',
    productId: '101',
    name: 'Dell Laptop',
    category: 'Electronics',
    quantity: 12,
    price: 750,
  },
  {
    _id: '66f5c1000000000000000002',
    productId: '102',
    name: 'Wireless Mouse',
    category: 'Electronics',
    quantity: 3, // Low stock (<= 5)
    price: 25,
  },
  {
    _id: '66f5c1000000000000000003',
    productId: '103',
    name: 'Office Chair',
    category: 'Furniture',
    quantity: 8,
    price: 120,
  },
  {
    _id: '66f5c1000000000000000004',
    productId: '104',
    name: 'Spiral Notebook',
    category: 'Stationery',
    quantity: 4, // Low stock (<= 5)
    price: 5,
  },
  {
    _id: '66f5c1000000000000000005',
    productId: '105',
    name: 'Gel Pen (Pack of 10)',
    category: 'Stationery',
    quantity: 0, // Depleted (0)
    price: 10,
  },
];

let memoryProducts = JSON.parse(JSON.stringify(initialProducts));

/**
 * 1. GET /api/products
 * List all products, with optional search by Name / ID / Category and Low Stock filter
 */
const getProducts = async (req, res) => {
  try {
    const { search, lowStock } = req.query;

    if (isMemoryMode()) {
      let result = [...memoryProducts];

      // Search by Name, Product ID, or Category
      if (search && search.trim()) {
        const query = search.trim().toLowerCase();
        result = result.filter(
          (p) =>
            p.productId.toLowerCase().includes(query) ||
            p.name.toLowerCase().includes(query) ||
            p.category.toLowerCase().includes(query)
        );
      }

      // Low Stock filter (quantity <= 5)
      if (lowStock === 'true') {
        result = result.filter((p) => p.quantity <= 5);
      }

      return res.status(200).json({ success: true, count: result.length, data: result });
    }

    // MongoDB Mongoose query
    const filter = {};
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [{ productId: regex }, { name: regex }, { category: regex }];
    }
    if (lowStock === 'true') {
      filter.quantity = { $lte: 5 };
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 2. GET /api/products/alerts/low-stock
 * Retrieve products with quantity <= 5
 */
const getLowStockAlerts = async (req, res) => {
  try {
    if (isMemoryMode()) {
      const alerts = memoryProducts.filter((p) => p.quantity <= 5);
      return res.status(200).json({ success: true, count: alerts.length, data: alerts });
    }

    const alerts = await Product.find({ quantity: { $lte: 5 } }).sort({ quantity: 1 });
    return res.status(200).json({ success: true, count: alerts.length, data: alerts });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 3. POST /api/products
 * Add product with validation: non-negative quantity & price, unique Product ID
 */
const createProduct = async (req, res) => {
  try {
    let { productId, name, category, quantity, price } = req.body;

    if (!productId || !name || !category || quantity === undefined || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: Product ID, Name, Category, Quantity, and Price.',
      });
    }

    productId = String(productId).trim();
    name = String(name).trim();
    category = String(category).trim();
    quantity = Number(quantity);
    price = Number(price);

    if (isNaN(quantity) || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a non-negative number (0 or greater).',
      });
    }

    if (isNaN(price) || price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a non-negative number (0 or greater).',
      });
    }

    if (isMemoryMode()) {
      const exists = memoryProducts.some(
        (p) => p.productId.toLowerCase() === productId.toLowerCase()
      );
      if (exists) {
        return res.status(409).json({
          success: false,
          message: `Product ID '${productId}' already exists in database.`,
        });
      }

      const newProduct = {
        _id: 'mem_' + Date.now(),
        productId,
        name,
        category,
        quantity,
        price,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryProducts.unshift(newProduct);
      return res.status(201).json({ success: true, message: 'Product added successfully', data: newProduct });
    }

    const existing = await Product.findOne({ productId });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Product ID '${productId}' already exists in database.`,
      });
    }

    const product = new Product({ productId, name, category, quantity, price });
    await product.save();

    return res.status(201).json({ success: true, message: 'Product added successfully', data: product });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Product ID already exists.' });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 4. PUT /api/products/:id
 * Update product record
 */
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    let { name, category, quantity, price } = req.body;

    if (quantity !== undefined) {
      quantity = Number(quantity);
      if (isNaN(quantity) || quantity < 0) {
        return res.status(400).json({ success: false, message: 'Quantity cannot be negative.' });
      }
    }

    if (price !== undefined) {
      price = Number(price);
      if (isNaN(price) || price < 0) {
        return res.status(400).json({ success: false, message: 'Price cannot be negative.' });
      }
    }

    if (isMemoryMode()) {
      const index = memoryProducts.findIndex(
        (p) => p._id === id || p.productId === id
      );
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }

      const current = memoryProducts[index];
      memoryProducts[index] = {
        ...current,
        name: name !== undefined ? String(name).trim() : current.name,
        category: category !== undefined ? String(category).trim() : current.category,
        quantity: quantity !== undefined ? quantity : current.quantity,
        price: price !== undefined ? price : current.price,
        updatedAt: new Date(),
      };

      return res.status(200).json({ success: true, message: 'Product updated successfully', data: memoryProducts[index] });
    }

    let product = null;
    if (String(id).match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(id);
    }
    if (!product) {
      product = await Product.findOne({ productId: String(id).trim() });
    }
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (name !== undefined) product.name = String(name).trim();
    if (category !== undefined) product.category = String(category).trim();
    if (quantity !== undefined) product.quantity = quantity;
    if (price !== undefined) product.price = price;

    await product.save();
    return res.status(200).json({ success: true, message: 'Product updated successfully', data: product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 5. PATCH /api/products/:id/stock
 * Update stock quantity or delta (+ / -).
 * CRITICAL EDGE CASE: Blocks reducing stock below zero!
 */
const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { delta, quantity } = req.body;

    if (isMemoryMode()) {
      const index = memoryProducts.findIndex(
        (p) => p._id === id || p.productId === id
      );
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }

      const current = memoryProducts[index];
      let newQty = current.quantity;

      if (quantity !== undefined) {
        const parsed = Number(quantity);
        if (isNaN(parsed) || parsed < 0) {
          return res.status(400).json({ success: false, message: 'Stock quantity cannot be negative.' });
        }
        newQty = parsed;
      } else if (delta !== undefined) {
        const parsedDelta = Number(delta);
        if (current.quantity + parsedDelta < 0) {
          return res.status(400).json({
            success: false,
            message: `Cannot reduce stock below zero! Current stock is ${current.quantity}.`,
          });
        }
        newQty = current.quantity + parsedDelta;
      }

      memoryProducts[index].quantity = newQty;
      return res.status(200).json({
        success: true,
        message: `Stock updated to ${newQty}`,
        data: memoryProducts[index],
      });
    }

    let product = null;
    if (String(id).match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(id);
    }
    if (!product) {
      product = await Product.findOne({ productId: String(id).trim() });
    }
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (quantity !== undefined) {
      const parsed = Number(quantity);
      if (isNaN(parsed) || parsed < 0) {
        return res.status(400).json({ success: false, message: 'Stock quantity cannot be negative.' });
      }
      product.quantity = parsed;
    } else if (delta !== undefined) {
      const parsedDelta = Number(delta);
      if (product.quantity + parsedDelta < 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot reduce stock below zero! Current stock is ${product.quantity}.`,
        });
      }
      product.quantity = product.quantity + parsedDelta;
    }

    await product.save();
    return res.status(200).json({
      success: true,
      message: `Stock updated to ${product.quantity}`,
      data: product,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 6. DELETE /api/products/:id
 * Delete product record by _id or productId
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const cleanId = String(id).trim();

    if (isMemoryMode()) {
      const index = memoryProducts.findIndex(
        (p) => p._id === cleanId || p.productId.toLowerCase() === cleanId.toLowerCase()
      );
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }
      const removed = memoryProducts.splice(index, 1)[0];
      return res.status(200).json({
        success: true,
        message: `Product '${removed.name}' (${removed.productId}) deleted successfully.`,
        data: removed,
      });
    }

    let product = null;
    if (cleanId.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findByIdAndDelete(cleanId);
    }
    if (!product) {
      product = await Product.findOneAndDelete({ productId: cleanId });
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    return res.status(200).json({
      success: true,
      message: `Product '${product.name}' (${product.productId}) deleted successfully.`,
      data: product,
    });
  } catch (error) {
    console.error('Delete error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 7. POST /api/products/seed
 * Reset database to 5 sample demonstration products
 */
const seedProducts = async (req, res) => {
  try {
    if (isMemoryMode()) {
      memoryProducts = JSON.parse(JSON.stringify(initialProducts));
      return res.status(200).json({
        success: true,
        message: 'Sample inventory reset with 5 test products.',
        count: memoryProducts.length,
        data: memoryProducts,
      });
    }

    await Product.deleteMany({});
    const created = await Product.insertMany(
      initialProducts.map((p) => {
        const item = { ...p };
        delete item._id;
        return item;
      })
    );

    return res.status(200).json({
      success: true,
      message: 'Sample inventory reset in MongoDB with 5 test products.',
      count: created.length,
      data: created,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProducts,
  getLowStockAlerts,
  createProduct,
  updateProduct,
  updateStock,
  deleteProduct,
  seedProducts,
};

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Package,
  PlusCircle,
  Search,
  AlertTriangle,
  Trash2,
  Edit2,
  Plus,
  Minus,
  RotateCcw,
  CheckCircle,
  XCircle,
  Layers,
  Loader2,
} from 'lucide-react';
import {
  getProducts,
  getLowStockAlerts,
  addProduct,
  updateStock,
  updateProduct,
  deleteProduct,
  resetSampleData,
} from '@/lib/api';
import { Product } from '@/types/inventory';

export default function InventoryApp() {
  const [products, setProducts] = useState<Product[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search and filter state
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Add Product Form state (Exact 5 objective fields)
  const [newProductId, setNewProductId] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [newPrice, setNewPrice] = useState('');

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editQuantity, setEditQuantity] = useState('');

  // Delete Confirmation Modal State
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Visual Notification
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
  } | null>(null);

  const showNotification = (
    type: 'success' | 'error' | 'warning',
    message: string
  ) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4500);
  };

  const loadData = useCallback(async () => {
    try {
      const [prods, alerts] = await Promise.all([
        getProducts(search, lowStockOnly),
        getLowStockAlerts(),
      ]);
      setProducts(prods);
      setLowStockAlerts(alerts);
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to connect to backend server');
    } finally {
      setIsLoading(false);
    }
  }, [search, lowStockOnly]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Add Product
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newProductId.trim() || !newName.trim() || !newCategory.trim() || !newQuantity || !newPrice) {
      showNotification('warning', 'Please fill in all 5 product fields.');
      return;
    }

    const qty = Number(newQuantity);
    const prc = Number(newPrice);

    if (isNaN(qty) || qty < 0) {
      showNotification('error', 'Validation Error: Quantity cannot be negative (must be ≥ 0).');
      return;
    }

    if (isNaN(prc) || prc < 0) {
      showNotification('error', 'Validation Error: Price cannot be negative (must be ≥ 0).');
      return;
    }

    try {
      await addProduct({
        productId: newProductId.trim(),
        name: newName.trim(),
        category: newCategory.trim(),
        quantity: qty,
        price: prc,
      });

      showNotification('success', `Product "${newName}" (ID: ${newProductId}) added successfully!`);
      setNewProductId('');
      setNewName('');
      setNewCategory('');
      setNewQuantity('');
      setNewPrice('');
      loadData();
    } catch (err: any) {
      showNotification('error', err.message);
    }
  };

  // Update Stock
  const handleStockDelta = async (product: Product, delta: number) => {
    const id = product._id || product.productId;

    if (delta < 0 && product.quantity + delta < 0) {
      showNotification(
        'warning',
        `Edge Case Safeguard: Cannot reduce stock below zero! Current stock of "${product.name}" is ${product.quantity}.`
      );
      return;
    }

    try {
      await updateStock(id, delta);
      showNotification(
        'success',
        `Stock for "${product.name}" ${delta > 0 ? 'increased' : 'decreased'} by ${Math.abs(delta)}.`
      );
      loadData();
    } catch (err: any) {
      showNotification('error', err.message);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    const target = productToDelete;
    const id = target._id || target.productId;

    try {
      setIsDeleting(true);
      setProducts((prev) =>
        prev.filter((p) => p.productId !== target.productId && p._id !== target._id)
      );

      await deleteProduct(id);
      showNotification('success', `Product "${target.name}" (${target.productId}) deleted successfully.`);
      setProductToDelete(null);
      loadData();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to delete product.');
      loadData();
    } finally {
      setIsDeleting(false);
    }
  };

  // Save Edit
  const handleSaveEdit = async () => {
    if (!editingProduct) return;
    const id = editingProduct._id || editingProduct.productId;
    const prc = Number(editPrice);
    const qty = Number(editQuantity);

    if (isNaN(prc) || prc < 0 || isNaN(qty) || qty < 0) {
      showNotification('error', 'Quantity and Price must be 0 or greater.');
      return;
    }

    try {
      await updateProduct(id, { price: prc, quantity: qty });
      showNotification('success', `Updated "${editingProduct.name}" details successfully.`);
      setEditingProduct(null);
      loadData();
    } catch (err: any) {
      showNotification('error', err.message);
    }
  };

  // Reset demo sample data
  const handleResetData = async () => {
    try {
      await resetSampleData();
      showNotification('success', 'Reset catalog to 5 sample test products.');
      setSearch('');
      setLowStockOnly(false);
      loadData();
    } catch (err: any) {
      showNotification('error', err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl w-full mx-auto space-y-6">
        {/* Header Bar */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Inventory Management System
              </h1>
              <p className="text-xs text-slate-400">
                Full-Stack CRUD Application • Next.js + Express + MongoDB
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetData}
              className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              title="Reset to 5 standard test products for demonstration"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Reset Sample Data</span>
            </button>
          </div>
        </header>

        {/* Global Feedback Banner */}
        {notification && (
          <div
            className={`p-4 rounded-xl border flex items-center gap-3 text-sm font-medium animate-in fade-in duration-200 ${
              notification.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
                : notification.type === 'error'
                ? 'bg-rose-950/80 border-rose-500/40 text-rose-200'
                : 'bg-amber-950/80 border-amber-500/40 text-amber-200'
            }`}
          >
            {notification.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />}
            {notification.type === 'error' && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
            {notification.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Low-Stock Alert Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  lowStockAlerts.length > 0
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">
                  Low-Stock Alert Status (Threshold ≤ 5 units)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {lowStockAlerts.length > 0
                    ? `⚠️ ${lowStockAlerts.length} item(s) are running low on stock or depleted!`
                    : '✅ All inventory items have sufficient stock (above threshold).'}
                </p>
              </div>
            </div>

            {lowStockAlerts.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {lowStockAlerts.map((item) => (
                  <span
                    key={item.productId}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                      item.quantity === 0
                        ? 'bg-rose-950/70 border-rose-500/40 text-rose-300'
                        : 'bg-amber-950/70 border-amber-500/40 text-amber-300'
                    }`}
                  >
                    {item.name} ({item.quantity} left)
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Product Form */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <PlusCircle className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">
              Add New Product (CRUD: Create)
            </h2>
          </div>

          <form onSubmit={handleAddProduct} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Product ID *
              </label>
              <input
                type="text"
                placeholder="e.g. 106"
                value={newProductId}
                onChange={(e) => setNewProductId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                placeholder="e.g. USB-C Cable"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Category *
              </label>
              <input
                type="text"
                placeholder="e.g. Electronics"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                min="0"
                placeholder="10"
                value={newQuantity}
                onChange={(e) => setNewQuantity(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Price ($) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="15.00"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="md:col-span-6 flex justify-end mt-1">
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-md flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>
          </form>
        </section>

        {/* Dynamic Search & Filter */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Name, ID, or Category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setLowStockOnly(!lowStockOnly)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                lowStockOnly
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{lowStockOnly ? 'Filtered: Low Stock (≤ 5)' : 'Filter Low Stock (≤ 5)'}</span>
            </button>

            {(search || lowStockOnly) && (
              <button
                onClick={() => {
                  setSearch('');
                  setLowStockOnly(false);
                }}
                className="px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800 cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        </section>

        {/* Product Table */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-400" />
              <h2 className="text-sm font-bold text-white">
                Product Records Table ({products.length} items)
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Total Units: {products.reduce((acc, p) => acc + p.quantity, 0)}
            </span>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-sm text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span>Loading products...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-base font-bold text-white">No products found</p>
              <p className="text-xs text-slate-400 mt-1">
                Edge case demonstrated: No items match your search or filter.
              </p>
              <button
                onClick={() => {
                  setSearch('');
                  setLowStockOnly(false);
                }}
                className="mt-3 px-3 py-1.5 text-xs font-semibold bg-slate-800 text-slate-200 rounded-lg cursor-pointer"
              >
                Reset Search
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Product ID</th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-center">Stock Quantity & Quick Update</th>
                    <th className="py-3 px-4 text-right">Price</th>
                    <th className="py-3 px-4 text-right">Total Value</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {products.map((product) => {
                    const isLow = product.quantity <= 5;
                    const isZero = product.quantity === 0;

                    return (
                      <tr
                        key={product.productId}
                        className={`hover:bg-slate-800/40 transition-colors ${
                          isZero ? 'bg-rose-950/20' : isLow ? 'bg-amber-950/20' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">
                          {product.productId}
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-white">
                          {product.name}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300 border border-slate-700">
                            {product.category}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleStockDelta(product, -1)}
                              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center border border-slate-700 transition-colors cursor-pointer"
                              title="Decrease stock by 1"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>

                            <span
                              className={`font-mono font-bold text-sm min-w-[30px] text-center ${
                                isZero
                                  ? 'text-rose-400'
                                  : isLow
                                  ? 'text-amber-400'
                                  : 'text-emerald-400'
                              }`}
                            >
                              {product.quantity}
                            </span>

                            <button
                              onClick={() => handleStockDelta(product, +1)}
                              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center border border-slate-700 transition-colors cursor-pointer"
                              title="Increase stock by 1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>

                            {isZero ? (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 ml-1">
                                Out of Stock
                              </span>
                            ) : isLow ? (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 ml-1">
                                Low Stock
                              </span>
                            ) : null}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-200">
                          ${Number(product.price).toFixed(2)}
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                          ${(product.quantity * product.price).toFixed(2)}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setEditingProduct(product);
                                setEditPrice(String(product.price));
                                setEditQuantity(String(product.quantity));
                              }}
                              className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                              title="Edit price and quantity"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setProductToDelete(product)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                              title="Delete product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="text-center text-xs text-slate-500 pt-4 pb-8">
          Inventory Management System • Node.js + Express REST API • MongoDB Database • Next.js + Tailwind CSS
        </footer>
      </div>

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Confirm Deletion</h3>
                <p className="text-xs text-slate-400">This action cannot be undone.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
              <p className="text-slate-300">
                <span className="text-slate-500 font-medium">Product ID:</span>{' '}
                <span className="font-mono text-indigo-400 font-bold">{productToDelete.productId}</span>
              </p>
              <p className="text-slate-300">
                <span className="text-slate-500 font-medium">Name:</span>{' '}
                <span className="font-semibold text-white">{productToDelete.name}</span>
              </p>
              <p className="text-slate-300">
                <span className="text-slate-500 font-medium">Stock on hand:</span>{' '}
                <span className="font-mono text-amber-400">{productToDelete.quantity} units</span>
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                disabled={isDeleting}
                className="px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-all shadow-md shadow-rose-600/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Record</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">
              Update Product: {editingProduct.name}
            </h3>
            <p className="text-xs text-slate-400">
              Product ID: <span className="font-mono text-indigo-400">{editingProduct.productId}</span>
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Stock Quantity
              </label>
              <input
                type="number"
                min="0"
                value={editQuantity}
                onChange={(e) => setEditQuantity(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Price ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useCallback } from "react";
import ProductFilters from "./ProductFilters";
import ProductTable from "./ProductTable";
import ProductForm from "./ProductForm";
import ProductDetailsModal from "./ProductDetailsModal";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
} from "../../services/productService";

const ProductsComponent = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(null); // { type: 'success' | 'error', message: '' }

  // Filter states
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [stockStatus, setStockStatus] = useState("All");

  // Pagination states
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Show auto-dismissing toast notification
  const showToast = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Load categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const cats = await getCategories();
        setCategories(cats || []);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };
    fetchCats();
  }, []);

  // Load products
  const loadProducts = useCallback(
    async (pageToLoad = pagination.page, limitToLoad = pagination.limit) => {
      try {
        setLoading(true);
        setError("");
        const res = await getProducts({
          search,
          category,
          stockStatus,
          page: pageToLoad,
          limit: limitToLoad,
        });

        setProducts(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      } catch (err) {
        setError(err.message || "Unable to load products.");
      } finally {
        setLoading(false);
      }
    },
    [search, category, stockStatus, pagination.page, pagination.limit]
  );

  // Initial load and filter change trigger
  useEffect(() => {
    loadProducts(1, pagination.limit);
  }, [search, category, stockStatus, pagination.limit]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearch("");
    setCategory("All");
    setStockStatus("All");
  };

  // Page changes
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
    loadProducts(newPage, pagination.limit);
  };

  const handleLimitChange = (newLimit) => {
    setPagination((prev) => ({ ...prev, limit: newLimit, page: 1 }));
    loadProducts(1, newLimit);
  };

  // View details
  const handleView = async (product) => {
    try {
      const details = await getProduct(product.id);
      setViewingProduct(details);
    } catch (err) {
      showToast(err.message || "Unable to load product details.", "error");
    }
  };

  // Open edit modal
  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowFormModal(true);
  };

  // Submit product create/update
  const handleFormSubmit = async (formData) => {
    try {
      setSubmitting(true);
      if (editingProduct) {
        await updateProduct(editingProduct.id, formData);
        showToast("Product updated successfully.");
      } else {
        await createProduct(formData);
        showToast("Product created successfully.");
      }
      setShowFormModal(false);
      setEditingProduct(null);
      loadProducts(pagination.page, pagination.limit);
    } catch (err) {
      showToast(err.message || "Operation failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete product
  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}" (${product.sku})?`
    );
    if (!confirmed) return;

    try {
      await deleteProduct(product.id);
      showToast("Product deleted successfully.");
      loadProducts(pagination.page, pagination.limit);
    } catch (err) {
      showToast(err.message || "This product cannot be deleted because it has inventory history.", "error");
    }
  };

  return (
    <div className="dashboard-container">
      {/* Toast Notification */}
      {notification && (
        <div
          style={{
            position: "fixed",
            top: "24px",
            right: "24px",
            zIndex: 9999,
            padding: "12px 20px",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: 500,
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            backgroundColor: notification.type === "error" ? "#fee2e2" : "#dcfce7",
            color: notification.type === "error" ? "#991b1b" : "#166534",
            border: `1px solid ${notification.type === "error" ? "#f87171" : "#86efac"}`,
          }}
        >
          {notification.type === "error" ? "✕ " : "✓ "} {notification.message}
        </div>
      )}

      {/* Header */}
      <div
        className="dashboard-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 className="dashboard-title" style={{ margin: 0, fontSize: "24px", fontWeight: 700 }}>
            Products
          </h1>
          <p className="dashboard-subtitle" style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "14px" }}>
            Manage your inventory products and stock information.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setEditingProduct(null);
            setShowFormModal(true);
          }}
          style={{ padding: "9px 18px", fontSize: "14px", fontWeight: 600 }}
        >
          + New Product
        </button>
      </div>

      {/* Inline Error if any */}
      {error && (
        <div
          style={{
            padding: "12px 16px",
            background: "#fee2e2",
            color: "#991b1b",
            borderRadius: "6px",
            marginBottom: "16px",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      {/* Filters */}
      <ProductFilters
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        stockStatus={stockStatus}
        setStockStatus={setStockStatus}
        categories={categories}
        onReset={handleResetFilters}
      />

      {/* Table */}
      <ProductTable
        products={products}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Create / Edit Modal */}
      {showFormModal && (
        <ProductForm
          initialData={editingProduct}
          categories={categories}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowFormModal(false);
            setEditingProduct(null);
          }}
          submitting={submitting}
        />
      )}

      {/* View Details Modal */}
      {viewingProduct && (
        <ProductDetailsModal
          product={viewingProduct}
          onClose={() => setViewingProduct(null)}
        />
      )}
    </div>
  );
};

export default ProductsComponent;

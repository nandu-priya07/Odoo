import { useState, useEffect, useMemo } from "react";
import ProductFilters from "./ProductFilters";
import ProductTable from "./ProductTable";
import ProductForm from "./ProductForm";
import { fetchProducts, createProduct, updateProduct, deleteProduct } from "../../services/productService";
import "../Dashboard/Dashboard.css";

function ProductsComponent() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);

  const loadProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchProducts(search, category);
      setProducts(data);

      // Also fetch categories from dashboard endpoint for filter
      const res = await fetch("http://localhost:5000/api/dashboard");
      const json = await res.json();
      if (json.success && json.data?.categories) {
        setCategories(json.data.categories);
      }
    } catch (err) {
      console.error("Load products error:", err);
      setError(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [search, category]);

  const handleResetFilters = () => {
    setSearch("");
    setCategory("All");
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, formData);
      setSuccessMsg(`Product '${formData.name}' updated successfully!`);
    } else {
      await createProduct(formData);
      setSuccessMsg(`Product '${formData.name}' created successfully!`);
    }
    loadProducts();
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteProduct(id);
      setSuccessMsg("Product deleted successfully.");
      loadProducts();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      alert(err.message || "Failed to delete product.");
    }
  };

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>StockSense Product Catalog</h1>
          <p>Manage product items, SKU codes, categories, and initial stock settings.</p>
        </div>

        <div className="header-actions">
          <button className="action-btn" onClick={handleOpenAdd}>
            + Add New Product
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="alert-banner success-banner" style={{ marginBottom: "1.5rem" }}>
          ✅ {successMsg}
        </div>
      )}

      {error && (
        <div className="alert-banner error-banner" style={{ marginBottom: "1.5rem" }}>
          ⚠️ {error}
        </div>
      )}

      {/* Filters */}
      <ProductFilters
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        categories={categories}
        onReset={handleResetFilters}
      />

      {/* Table */}
      {loading ? (
        <p style={{ color: "#64748b", padding: "1rem" }}>Loading product catalog...</p>
      ) : (
        <ProductTable
          products={products}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          onViewDetails={setViewingProduct}
        />
      )}

      {/* Product Form Modal */}
      <ProductForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingProduct}
        categories={categories}
      />

      {/* View Details Modal */}
      {viewingProduct && (
        <div className="modal-overlay" onClick={() => setViewingProduct(null)}>
          <div className="modal-content" style={{ maxWidth: "550px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Product Details - {viewingProduct.name}</h2>
              <button className="modal-close-btn" onClick={() => setViewingProduct(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="form-row-2">
                <div>
                  <strong>SKU / Code:</strong>
                  <p><span className="sku-tag">{viewingProduct.sku}</span></p>
                </div>
                <div>
                  <strong>Category:</strong>
                  <p>{viewingProduct.category_name || "General"}</p>
                </div>
              </div>

              <div className="form-row-2">
                <div>
                  <strong>Unit of Measure:</strong>
                  <p>{viewingProduct.unit_of_measure || "pcs"}</p>
                </div>
                <div>
                  <strong>Total Stock:</strong>
                  <p><strong>{viewingProduct.total_stock || viewingProduct.initial_stock || 0}</strong> {viewingProduct.unit_of_measure || "pcs"}</p>
                </div>
              </div>

              <div className="form-actions">
                <button className="btn-secondary" onClick={() => setViewingProduct(null)}>
                  Close
                </button>
                <button
                  className="btn-primary"
                  onClick={() => {
                    const target = viewingProduct;
                    setViewingProduct(null);
                    handleOpenEdit(target);
                  }}
                >
                  Edit Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductsComponent;

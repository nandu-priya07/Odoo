import { useState, useMemo, useEffect } from "react";
import { createDelivery } from "../../services/deliveryService";
import "./Dashboard.css";

function NewDeliveryComponent({ isOpen, onClose, onSuccess, warehouses = [], products = [], locations = [], stockList = [] }) {
  const [customerName, setCustomerName] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [items, setItems] = useState([
    { id: Date.now(), productId: "", locationId: "", quantity: 1 }
  ]);

  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  // Default warehouse selection when warehouses load
  useEffect(() => {
    if (warehouses.length > 0 && !warehouseId) {
      setWarehouseId(warehouses[0].id);
    }
  }, [warehouses, warehouseId]);

  // Set default product for first row if products exist
  useEffect(() => {
    if (products.length > 0 && items.length === 1 && !items[0].productId) {
      const firstProdId = products[0].id;
      const filteredLocs = locations.filter(l => !warehouseId || l.warehouse_id === warehouseId);
      const firstLocId = filteredLocs.length > 0 ? filteredLocs[0].id : "";

      setItems([{
        id: Date.now(),
        productId: firstProdId,
        locationId: firstLocId,
        quantity: 1
      }]);
    }
  }, [products, locations, warehouseId, items]);

  // Filter locations by selected warehouse
  const availableLocations = useMemo(() => {
    if (!warehouseId) return locations;
    return locations.filter((loc) => !loc.warehouse_id || loc.warehouse_id === warehouseId);
  }, [locations, warehouseId]);

  // Helper map to quickly get SKU and details of a product
  const productMap = useMemo(() => {
    const map = new Map();
    products.forEach((p) => {
      map.set(p.id, p);
    });
    return map;
  }, [products]);

  // Helper function to calculate stock for product + location
  const getAvailableStock = (productId, locationId) => {
    if (!productId || !locationId) return 0;
    const match = stockList.find(
      (s) => (s.product_id === productId || s.id === productId) && (s.location_id === locationId)
    );
    if (match) {
      return Number(match.quantity) || 0;
    }
    // Fallback: check stock items with string matching
    const fallback = stockList.find(
      (s) => String(s.product_id) === String(productId) && String(s.location_id) === String(locationId)
    );
    return fallback ? Number(fallback.quantity) || 0 : 0;
  };

  // Handle warehouse selection change (resets location selection if invalid)
  const handleWarehouseChange = (e) => {
    const newWhId = e.target.value;
    setWarehouseId(newWhId);
    setTouched((prev) => ({ ...prev, warehouse: true }));

    // Reset location for items if location doesn't belong to new warehouse
    const newLocs = locations.filter((l) => !l.warehouse_id || l.warehouse_id === newWhId);
    const defaultLocId = newLocs.length > 0 ? newLocs[0].id : "";

    setItems((prevItems) =>
      prevItems.map((item) => {
        const isLocValid = newLocs.some((l) => l.id === item.locationId);
        return {
          ...item,
          locationId: isLocValid ? item.locationId : defaultLocId,
        };
      })
    );
  };

  // Handle adding line item row
  const handleAddProduct = () => {
    const firstProd = products.length > 0 ? products[0].id : "";
    const firstLoc = availableLocations.length > 0 ? availableLocations[0].id : "";

    setItems((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), productId: firstProd, locationId: firstLoc, quantity: 1 }
    ]);
  };

  // Handle removing line item row
  const handleRemoveProduct = (id) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Handle row item field update
  const handleItemChange = (id, field, value) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id !== id) return item;

        const updated = { ...item, [field]: value };

        // When product changes, auto set first available location if current location empty
        if (field === "productId" && !item.locationId && availableLocations.length > 0) {
          updated.locationId = availableLocations[0].id;
        }

        return updated;
      })
    );
  };

  // Check form dirty state for close confirmation
  const isDirty = useMemo(() => {
    return (
      customerName.trim() !== "" ||
      items.some((it) => it.quantity > 1 || (it.productId && it.productId !== (products[0]?.id || "")))
    );
  }, [customerName, items, products]);

  // Perform form validation
  const validation = useMemo(() => {
    const errors = {
      customerName: "",
      warehouseId: "",
      items: [],
      hasErrors: false,
    };

    if (!customerName.trim()) {
      errors.customerName = "Customer name is required.";
      errors.hasErrors = true;
    }

    if (!warehouseId) {
      errors.warehouseId = "Warehouse selection is required.";
      errors.hasErrors = true;
    }

    if (!items || items.length === 0) {
      errors.hasErrors = true;
    }

    const itemErrors = items.map((item) => {
      const err = { productId: "", locationId: "", quantity: "" };
      if (!item.productId) {
        err.productId = "Product is required.";
        errors.hasErrors = true;
      }
      if (!item.locationId) {
        err.locationId = "Location is required.";
        errors.hasErrors = true;
      }

      const qty = Number(item.quantity);
      if (isNaN(qty) || qty <= 0) {
        err.quantity = "Quantity must be greater than 0.";
        errors.hasErrors = true;
      } else if (item.productId && item.locationId) {
        const avail = getAvailableStock(item.productId, item.locationId);
        if (qty > avail) {
          err.quantity = `Only ${avail} units available at this location.`;
          errors.hasErrors = true;
        }
      }
      return err;
    });

    errors.items = itemErrors;
    return errors;
  }, [customerName, warehouseId, items, stockList]);

  // Attempt to close modal cleanly
  const requestClose = () => {
    if (isDirty && !successMsg) {
      setShowConfirmClose(true);
    } else {
      forceClose();
    }
  };

  const forceClose = () => {
    setShowConfirmClose(false);
    setServerError("");
    setSuccessMsg("");
    setCustomerName("");
    setTouched({});
    onClose();
  };

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ customerName: true, warehouse: true, items: true });

    if (validation.hasErrors) {
      return;
    }

    setSubmitting(true);
    setServerError("");
    setSuccessMsg("");

    try {
      const payload = {
        customerName: customerName.trim(),
        warehouseId,
        items: items.map((it) => ({
          productId: it.productId,
          locationId: it.locationId,
          quantity: Number(it.quantity),
        })),
      };

      const result = await createDelivery(payload);

      setSuccessMsg(`✅ ${result.message || "Delivery created successfully as DRAFT!"}`);

      setTimeout(() => {
        onSuccess && onSuccess();
        forceClose();
      }, 1200);
    } catch (err) {
      console.error("Create delivery error:", err);
      setServerError(err.message || "Failed to create delivery.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={requestClose}>
      <div
        className="modal-content delivery-modal-content"
        style={{ maxWidth: "850px", width: "95%" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header flex-between">
          <div>
            <div className="flex-align-gap">
              <h2>Create New Delivery</h2>
              <span className="status-badge draft">Status: Draft</span>
            </div>
            <p className="modal-subtitle">Create an outgoing stock delivery</p>
          </div>
          <button className="modal-close-btn" onClick={requestClose} title="Close">
            ✕
          </button>
        </div>

        {/* Form Body */}
        <div className="modal-body">
          {successMsg && (
            <div className="alert-banner success-banner">
              {successMsg}
            </div>
          )}

          {serverError && (
            <div className="alert-banner error-banner">
              ⚠️ {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="create-form">
            {/* Delivery Metadata (Customer & Warehouse) */}
            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="customerName">
                  Customer Name <span className="req-star">*</span>
                </label>
                <input
                  type="text"
                  id="customerName"
                  className={`form-input ${touched.customerName && validation.customerName ? "input-error" : ""}`}
                  placeholder="e.g. ABC Manufacturing / John Doe"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    setTouched((p) => ({ ...p, customerName: true }));
                  }}
                  required
                />
                {touched.customerName && validation.customerName && (
                  <span className="error-text">{validation.customerName}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="warehouseId">
                  Warehouse <span className="req-star">*</span>
                </label>
                <select
                  id="warehouseId"
                  className={`form-select ${touched.warehouse && validation.warehouseId ? "input-error" : ""}`}
                  value={warehouseId}
                  onChange={handleWarehouseChange}
                  required
                >
                  <option value="">Select Warehouse</option>
                  {warehouses.map((wh) => (
                    <option key={wh.id} value={wh.id}>
                      {wh.name}
                    </option>
                  ))}
                </select>
                {touched.warehouse && validation.warehouseId && (
                  <span className="error-text">{validation.warehouseId}</span>
                )}
              </div>
            </div>

            {/* Delivery Items Section */}
            <div className="items-section">
              <div className="items-header">
                <span className="section-title">📦 Delivery Items</span>
                <span className="info-badge">
                  Delivery Number will be auto-generated (e.g. DEL-00001)
                </span>
              </div>

              <div className="table-container shadow-table">
                <table className="data-table delivery-items-table">
                  <thead>
                    <tr>
                      <th style={{ width: "26%" }}>Product *</th>
                      <th style={{ width: "14%" }}>SKU</th>
                      <th style={{ width: "22%" }}>Location *</th>
                      <th style={{ width: "16%" }}>Available Stock</th>
                      <th style={{ width: "14%" }}>Quantity *</th>
                      <th style={{ width: "8%", textAlign: "center" }}>Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => {
                      const prod = productMap.get(item.productId);
                      const sku = prod?.sku || "-";
                      const availStock = getAvailableStock(item.productId, item.locationId);
                      const rowErr = validation.items[index] || {};

                      return (
                        <tr key={item.id}>
                          {/* Product Selection */}
                          <td>
                            <select
                              className={`form-select ${rowErr.productId ? "input-error" : ""}`}
                              value={item.productId}
                              onChange={(e) => handleItemChange(item.id, "productId", e.target.value)}
                              required
                            >
                              <option value="">Select Product</option>
                              {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name}
                                </option>
                              ))}
                            </select>
                            {rowErr.productId && <span className="error-text">{rowErr.productId}</span>}
                          </td>

                          {/* SKU Display */}
                          <td>
                            <span className="sku-tag">{sku}</span>
                          </td>

                          {/* Location Selection */}
                          <td>
                            <select
                              className={`form-select ${rowErr.locationId ? "input-error" : ""}`}
                              value={item.locationId}
                              onChange={(e) => handleItemChange(item.id, "locationId", e.target.value)}
                              required
                            >
                              <option value="">Select Location</option>
                              {availableLocations.map((loc) => (
                                <option key={loc.id} value={loc.id}>
                                  {loc.name}
                                </option>
                              ))}
                            </select>
                            {rowErr.locationId && <span className="error-text">{rowErr.locationId}</span>}
                          </td>

                          {/* Available Stock */}
                          <td>
                            <span className={`stock-level-badge ${availStock <= 0 ? "out" : availStock <= 10 ? "low" : "ok"}`}>
                              {availStock} units
                            </span>
                          </td>

                          {/* Quantity Input */}
                          <td>
                            <input
                              type="number"
                              className={`form-input ${rowErr.quantity ? "input-error" : ""}`}
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(item.id, "quantity", e.target.value)}
                              required
                            />
                            {rowErr.quantity && <span className="error-text">{rowErr.quantity}</span>}
                          </td>

                          {/* Remove Button */}
                          <td style={{ textAlign: "center" }}>
                            <button
                              type="button"
                              className="remove-item-btn"
                              onClick={() => handleRemoveProduct(item.id)}
                              disabled={items.length <= 1}
                              title={items.length <= 1 ? "At least one product required" : "Remove item"}
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: "0.5rem" }}>
                <button type="button" className="add-item-btn" onClick={handleAddProduct}>
                  + Add Product
                </button>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={requestClose} disabled={submitting}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={submitting || validation.hasErrors}
              >
                {submitting ? "Creating Delivery..." : "Create Delivery"}
              </button>
            </div>
          </form>
        </div>

        {/* Confirmation Modal for Unsaved Changes */}
        {showConfirmClose && (
          <div className="confirm-overlay">
            <div className="confirm-box">
              <h3>Unsaved Changes</h3>
              <p>You have unsaved form entries. Are you sure you want to cancel creating this delivery?</p>
              <div className="confirm-actions">
                <button className="btn-secondary" onClick={() => setShowConfirmClose(false)}>
                  Continue Editing
                </button>
                <button className="btn-primary btn-danger" onClick={forceClose}>
                  Discard & Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default NewDeliveryComponent;

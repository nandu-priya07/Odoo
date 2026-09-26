import { useState, useEffect, useMemo } from "react";
import NewDeliveryComponent from "./NewDeliveryComponent";
import "./Dashboard.css";

function DashboardComponent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    documentType: "All",
    status: "All",
    warehouse: "All",
    category: "All",
  });

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal State for Card Details
  const [activeModal, setActiveModal] = useState(null);
  const [modalSearch, setModalSearch] = useState("");

  // Modal State for Operations Creation (+ New Receipt, + New Delivery, + Stock Transfer)
  const [createModalType, setCreateModalType] = useState(null);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    referenceNo: "",
    supplierId: "",
    customerName: "",
    warehouseId: "",
    fromLocationId: "",
    toLocationId: "",
    productId: "",
    quantity: 1,
    receiptDate: "",
    recipientAddress: "",
    items: [{ productId: "", quantity: 1 }],
    status: "DRAFT",
  });
  const [submitting, setSubmitting] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  const defaultProductId = useMemo(() => {
    return (dashboardData?.productsList?.[0] || dashboardData?.topProducts?.[0])?.id || "";
  }, [dashboardData]);

  const openCreateModal = (type) => {
    if (type === "delivery") {
      setIsDeliveryModalOpen(true);
      return;
    }
    const randNum = Math.floor(10000 + Math.random() * 90000);
    const prefix = type === "receipt" ? "REC" : type === "delivery" ? "DEL" : "TRF";
    const firstProd = defaultProductId;

    setCreateModalType(type);
    setCreateError("");
    setCreateSuccess("");
    setCreateFormData({
      referenceNo: `${prefix}-${randNum}`,
      supplierId: dashboardData?.suppliers?.[0]?.id || "",
      customerName: "",
      warehouseId: dashboardData?.warehouses?.[0]?.id || "",
      fromLocationId: dashboardData?.locations?.[0]?.id || "",
      toLocationId: dashboardData?.locations?.[1]?.id || dashboardData?.locations?.[0]?.id || "",
      productId: firstProd,
      quantity: 1,
      receiptDate: new Date().toISOString().split("T")[0],
      recipientAddress: "",
      items: [{ productId: firstProd, quantity: 1 }],
      status: "DRAFT",
    });
  };

  const handleAddItemRow = () => {
    setCreateFormData((prev) => ({
      ...prev,
      items: [...prev.items, { productId: defaultProductId, quantity: 1 }],
    }));
  };

  const handleRemoveItemRow = (index) => {
    setCreateFormData((prev) => {
      if (prev.items.length <= 1) return prev;
      const updated = [...prev.items];
      updated.splice(index, 1);
      return { ...prev, items: updated };
    });
  };

  const handleItemChange = (index, field, value) => {
    setCreateFormData((prev) => {
      const updated = [...prev.items];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, items: updated };
    });
  };

  const computedNetQty = useMemo(() => {
    if (createModalType === "receipt") {
      return (createFormData.items || []).reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    }
    return Number(createFormData.quantity) || 1;
  }, [createFormData.items, createFormData.quantity, createModalType]);

  const closeCreateModal = () => {
    setCreateModalType(null);
    setCreateError("");
    setCreateSuccess("");
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setCreateFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setCreateError("");
    setCreateSuccess("");

    try {
      const payload = {
        type: createModalType,
        referenceNo: createFormData.referenceNo,
        supplierId: createFormData.supplierId || null,
        customerName: createFormData.customerName || null,
        warehouseId: createFormData.warehouseId || null,
        fromLocationId: createFormData.fromLocationId || null,
        toLocationId: createFormData.toLocationId || null,
        receiptDate: createFormData.receiptDate || null,
        recipientAddress: createFormData.recipientAddress || null,
        netQty: computedNetQty,
        items: createModalType === "receipt" ? createFormData.items : [{ productId: createFormData.productId, quantity: Number(createFormData.quantity) || 1 }],
        productId: createFormData.productId || null,
        quantity: Number(createFormData.quantity) || 1,
        status: createFormData.status,
      };

      const res = await fetch("http://localhost:5000/api/dashboard/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setCreateSuccess(`✅ ${json.message || "Operation created successfully!"}`);
        setTimeout(() => {
          closeCreateModal();
          fetchDashboard();
        }, 1000);
      } else {
        setCreateError(json.message || "Failed to create operation");
      }
    } catch (err) {
      console.error("Submit operation error:", err);
      setCreateError("Failed to submit request to backend server");
    } finally {
      setSubmitting(false);
    }
  };

  const fetchDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/dashboard");
      const json = await response.json();

      if (response.ok && json.success) {
        setDashboardData(json.data);
      } else {
        setError(json.message || "Failed to load dashboard data");
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Failed to connect to backend API server (ensure server is running on port 5000)");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setFilters({
      documentType: "All",
      status: "All",
      warehouse: "All",
      category: "All",
    });
  };

  const openModal = (modalKey) => {
    setActiveModal(modalKey);
    setModalSearch("");
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalSearch("");
  };

  // Filter Operations List
  const filteredOperations = useMemo(() => {
    if (!dashboardData?.operations) return [];

    return dashboardData.operations.filter((op) => {
      if (filters.documentType !== "All" && op.document_type.toLowerCase() !== filters.documentType.toLowerCase()) {
        return false;
      }
      if (filters.status !== "All" && op.status.toLowerCase() !== filters.status.toLowerCase()) {
        return false;
      }
      if (filters.warehouse !== "All" && op.warehouse_name !== filters.warehouse) {
        return false;
      }
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const ref = (op.reference_no || "").toLowerCase();
        const type = (op.document_type || "").toLowerCase();
        const wh = (op.warehouse_name || "").toLowerCase();
        if (!ref.includes(query) && !type.includes(query) && !wh.includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [dashboardData, filters, searchQuery]);

  // Filter Stock Alerts
  const filteredAlerts = useMemo(() => {
    if (!dashboardData?.stockAlerts) return [];

    return dashboardData.stockAlerts.filter((alert) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      const p = (alert.product || "").toLowerCase();
      const sku = (alert.sku || "").toLowerCase();
      const cat = (alert.category || "").toLowerCase();
      return p.includes(query) || sku.includes(query) || cat.includes(query);
    });
  }, [dashboardData, searchQuery]);

  const apiStats = dashboardData?.stats;

  // Safe numerical stats calculation
  const totalProductsNum = apiStats?.totalProducts ?? 0;
  const totalStockNum = Number(apiStats?.totalStockUnits || 0);
  const lowOrOutNum = apiStats?.lowOrOutOfStock ?? 0;
  const receiptsNum = apiStats?.pendingReceipts ?? 0;
  const deliveriesNum = apiStats?.pendingDeliveries ?? 0;
  const transfersNum = apiStats?.internalTransfers ?? 0;

  const stats = [
    {
      key: "totalProducts",
      title: "Total Products",
      value: totalProductsNum.toLocaleString(),
      description: "Active product catalog",
    },
    {
      key: "totalStock",
      title: "Total Units in Stock",
      value: totalStockNum.toLocaleString(),
      description: "Available quantity across inventory",
    },
    {
      key: "lowStock",
      title: "Low & Out of Stock",
      value: lowOrOutNum.toLocaleString(),
      description: "Items requiring reorder",
      type: "warning",
    },
    {
      key: "pendingReceipts",
      title: "Pending Receipts",
      value: receiptsNum.toLocaleString(),
      description: "Incoming shipments",
    },
    {
      key: "pendingDeliveries",
      title: "Pending Deliveries",
      value: deliveriesNum.toLocaleString(),
      description: "Outgoing shipments",
    },
    {
      key: "internalTransfers",
      title: "Scheduled Transfers",
      value: transfersNum.toLocaleString(),
      description: "Location transfers",
    },
  ];

  const warehouseOptions = dashboardData?.warehouses || [];
  const categoryOptions = dashboardData?.categories || [];
  const topProducts = dashboardData?.topProducts || [];

  // Max quantity for top products progress bars
  const maxTopQty = useMemo(() => {
    if (!topProducts.length) return 1;
    return Math.max(...topProducts.map((p) => Number(p.total_quantity) || 1));
  }, [topProducts]);

  // Dynamic Modal Contents with Fallbacks
  const modalData = useMemo(() => {
    if (!activeModal || !dashboardData) return { title: "", count: 0, columns: [], rows: [] };

    const query = modalSearch.toLowerCase().trim();

    switch (activeModal) {
      case "totalProducts": {
        const source = (dashboardData.productsList && dashboardData.productsList.length > 0)
          ? dashboardData.productsList
          : (dashboardData.topProducts || []);
        
        const list = source.filter((p) => {
          if (!query) return true;
          return (p.name || "").toLowerCase().includes(query) || (p.sku || "").toLowerCase().includes(query) || (p.category_name || "").toLowerCase().includes(query);
        });
        return {
          title: "All Products Catalog",
          count: list.length,
          columns: ["Product Name", "SKU", "Category", "Unit", "Stock Quantity"],
          rows: list.map((p) => [
            p.name,
            p.sku,
            p.category_name || "General",
            p.unit_of_measure || "pcs",
            p.initial_stock !== undefined ? p.initial_stock : (p.total_quantity || 0)
          ]),
        };
      }
      case "totalStock": {
        const source = (dashboardData.stockList && dashboardData.stockList.length > 0)
          ? dashboardData.stockList
          : (dashboardData.topProducts || []);
        
        const list = source.filter((s) => {
          if (!query) return true;
          const pName = s.product_name || s.name || "";
          const sku = s.sku || "";
          const loc = s.location_name || s.category_name || "";
          return pName.toLowerCase().includes(query) || sku.toLowerCase().includes(query) || loc.toLowerCase().includes(query);
        });
        return {
          title: "Stock Inventory Breakdown",
          count: list.length,
          columns: ["Product Name", "SKU", "Location / Category", "Quantity"],
          rows: list.map((s) => [
            s.product_name || s.name,
            s.sku,
            s.location_name || s.category_name || "Main Warehouse",
            `${s.quantity !== undefined ? s.quantity : (s.total_quantity || 0)} units`
          ]),
        };
      }
      case "lowStock": {
        const source = dashboardData.stockAlerts || [];
        const list = source.filter((a) => {
          if (!query) return true;
          return (a.product || "").toLowerCase().includes(query) || (a.sku || "").toLowerCase().includes(query);
        });
        return {
          title: "Low & Out of Stock Alerts",
          count: list.length,
          columns: ["Product Name", "SKU", "Category", "Location", "Status", "Remaining"],
          rows: list.map((a) => [
            a.product,
            a.sku || "-",
            a.category || "General",
            a.location || "Main Area",
            a.status,
            `${a.quantity || 0} units`
          ]),
        };
      }
      case "pendingReceipts": {
        const source = (dashboardData.receiptsList && dashboardData.receiptsList.length > 0)
          ? dashboardData.receiptsList
          : (dashboardData.operations || []).filter((o) => o.document_type === "Receipt");
        
        const list = source.filter((r) => {
          if (!query) return true;
          const ref = r.receipt_number || r.reference_no || "";
          const sup = r.supplier_name || r.warehouse_name || "";
          const addr = r.recipient_address || "";
          return ref.toLowerCase().includes(query) || sup.toLowerCase().includes(query) || addr.toLowerCase().includes(query);
        });
        return {
          title: "Receipts Overview",
          count: list.length,
          columns: ["Receipt Number", "Supplier / Warehouse", "Recipient Address", "Net Qty", "Status", "Date"],
          rows: list.map((r) => [
            r.receipt_number || r.reference_no,
            r.supplier_name || r.warehouse_name || "Main Warehouse",
            r.recipient_address || "Main Warehouse Dock",
            `${r.net_qty || 1} units`,
            r.status,
            r.receipt_date ? new Date(r.receipt_date).toLocaleDateString() : (r.created_at ? new Date(r.created_at).toLocaleDateString() : "-")
          ]),
        };
      }
      case "pendingDeliveries": {
        const source = (dashboardData.deliveriesList && dashboardData.deliveriesList.length > 0)
          ? dashboardData.deliveriesList
          : (dashboardData.operations || []).filter((o) => o.document_type === "Delivery");

        const list = source.filter((d) => {
          if (!query) return true;
          const ref = d.delivery_number || d.reference_no || "";
          const cust = d.customer_name || d.warehouse_name || "";
          return ref.toLowerCase().includes(query) || cust.toLowerCase().includes(query);
        });
        return {
          title: "Deliveries Overview",
          count: list.length,
          columns: ["Delivery Number", "Customer / Warehouse", "Status", "Date"],
          rows: list.map((d) => [
            d.delivery_number || d.reference_no,
            d.customer_name || d.warehouse_name || "Main Warehouse",
            d.status,
            d.created_at ? new Date(d.created_at).toLocaleDateString() : "-"
          ]),
        };
      }
      case "internalTransfers": {
        const source = (dashboardData.transfersList && dashboardData.transfersList.length > 0)
          ? dashboardData.transfersList
          : (dashboardData.operations || []).filter((o) => o.document_type === "Internal Transfer" || o.document_type === "Transfer");

        const list = source.filter((t) => {
          if (!query) return true;
          const ref = t.transfer_number || t.reference_no || "";
          const loc = t.from_location || t.warehouse_name || "";
          return ref.toLowerCase().includes(query) || loc.toLowerCase().includes(query);
        });
        return {
          title: "Scheduled Internal Transfers",
          count: list.length,
          columns: ["Transfer Number", "From Location", "To Location / Details", "Status", "Date"],
          rows: list.map((t) => [
            t.transfer_number || t.reference_no,
            t.from_location || "Rack A",
            t.to_location || t.warehouse_name || "Rack B",
            t.status,
            t.created_at ? new Date(t.created_at).toLocaleDateString() : "-"
          ]),
        };
      }
      default:
        return { title: "", count: 0, columns: [], rows: [] };
    }
  }, [activeModal, dashboardData, modalSearch]);

  return (
    <div className="dashboard-page">

      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>StockSense Operations Dashboard</h1>
          <p>
            Real-time control center for inventory, stock movements, and logistics.
          </p>
        </div>

        <div className="header-actions">
          <button className="action-btn" onClick={() => openCreateModal("receipt")}>
            + New Receipt
          </button>
          <button className="action-btn" onClick={() => openCreateModal("delivery")}>
            + New Delivery
          </button>
          <button className="action-btn" onClick={() => openCreateModal("transfer")}>
            + Stock Transfer
          </button>
        </div>
      </div>

      {loading && (
        <div style={{ padding: "1rem", color: "#475569" }}>
          <p>Loading real-time inventory statistics...</p>
        </div>
      )}

      {error && (
        <div style={{ padding: "1rem", backgroundColor: "#ffebee", borderRadius: "10px", marginBottom: "1.5rem", color: "#c62828" }}>
          <p>⚠️ {error}</p>
          <button 
            onClick={fetchDashboard}
            style={{ marginTop: "0.5rem", padding: "0.4rem 0.8rem", cursor: "pointer", borderRadius: "6px" }}
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="dashboard-stats">
        {stats.map((stat) => (
          <div 
            className={`stat-card ${stat.type || ""} clickable`} 
            key={stat.key}
            onClick={() => openModal(stat.key)}
            title="Click to view full details"
          >
            <div className="stat-card-content">
              <p className="stat-title">{stat.title}</p>
              <h2>{stat.value}</h2>
              <span>{stat.description}</span>
              <div className="click-hint">Click to view details →</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Dynamic Filters */}
      <section className="filter-section">
        <div className="search-bar-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Search products, SKU, reference numbers, or locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="dashboard-filters">
          <div className="filter-group">
            <label htmlFor="documentType">Document Type</label>
            <select
              id="documentType"
              name="documentType"
              value={filters.documentType}
              onChange={handleFilterChange}
            >
              <option value="All">All Types</option>
              <option value="Receipt">Receipts</option>
              <option value="Delivery">Deliveries</option>
              <option value="Internal Transfer">Internal Transfers</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="All">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="WAITING">Waiting</option>
              <option value="READY">Ready</option>
              <option value="DONE">Done</option>
              <option value="CANCELED">Canceled</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="warehouse">Warehouse</label>
            <select
              id="warehouse"
              name="warehouse"
              value={filters.warehouse}
              onChange={handleFilterChange}
            >
              <option value="All">All Warehouses</option>
              {warehouseOptions.map((wh) => (
                <option key={wh.id} value={wh.name}>
                  {wh.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
            >
              <option value="All">All Categories</option>
              {categoryOptions.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <button className="reset-btn" onClick={handleResetFilters}>
            Reset Filters
          </button>
        </div>
      </section>

      {/* Main Content 2-Column Grid */}
      <div className="dashboard-grid-2col">

        {/* Column 1: Inventory Operations Table */}
        <section className="dashboard-section">
          <div className="section-header">
            <div>
              <h2>Inventory Operations Feed</h2>
              <p>Showing {filteredOperations.length} operational documents</p>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Reference No</th>
                  <th>Warehouse / Location</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredOperations.length > 0 ? (
                  filteredOperations.slice(0, 15).map((op) => (
                    <tr key={`${op.document_type}-${op.id}`}>
                      <td>
                        <span className={`type-badge ${op.document_type.toLowerCase().replace(/\s+/g, '')}`}>
                          {op.document_type}
                        </span>
                      </td>
                      <td><strong>{op.reference_no}</strong></td>
                      <td>{op.warehouse_name || "Main Location"}</td>
                      <td>
                        <span className={`status-badge ${op.status.toLowerCase()}`}>
                          {op.status}
                        </span>
                      </td>
                      <td>{new Date(op.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "1.5rem", color: "#64748b" }}>
                      No matching operations found for selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Column 2: Top Products & Stock Alerts */}
        <div>

          {/* Top Products Visualizer */}
          <section className="dashboard-section">
            <div className="section-header">
              <div>
                <h2>Top Inventory Products</h2>
                <p>Highest quantity stocked items</p>
              </div>
            </div>

            <div className="progress-list">
              {topProducts.slice(0, 5).map((prod) => {
                const qty = Number(prod.total_quantity) || 0;
                const percentage = Math.min(100, Math.round((qty / maxTopQty) * 100));

                return (
                  <div className="progress-item" key={prod.id}>
                    <div className="progress-label">
                      <span>{prod.name} ({prod.sku})</span>
                      <strong>{qty} {prod.unit_of_measure || "pcs"}</strong>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Stock Alerts Section */}
          <section className="dashboard-section">
            <div className="section-header">
              <div>
                <h2>Critical Stock Alerts</h2>
                <p>Items requiring reorder attention</p>
              </div>
            </div>

            <div className="alert-list">
              {filteredAlerts.length > 0 ? (
                filteredAlerts.slice(0, 6).map((alert) => (
                  <div className="alert-item" key={alert.id || alert.product}>
                    <div>
                      <h3>{alert.product}</h3>
                      <p>SKU: {alert.sku || "-"} · {alert.quantity} units remaining</p>
                    </div>

                    <span
                      className={`alert-status ${
                        alert.status === "Out of Stock"
                          ? "out-of-stock"
                          : alert.status === "Low Stock"
                          ? "low-stock"
                          : "optimal"
                      }`}
                    >
                      {alert.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="alert-item">
                  <div>
                    <h3>No Active Alerts</h3>
                    <p>All matching inventory levels normal.</p>
                  </div>
                  <span className="alert-status optimal">Optimal</span>
                </div>
              )}
            </div>
          </section>

        </div>

      </div>

      {/* Card Detail Modal */}
      {activeModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {modalData.title}
                <span className="modal-count-badge">{modalData.count} Records</span>
              </h2>
              <button className="modal-close-btn" onClick={closeModal}>✕</button>
            </div>

            <div className="modal-body">
              <div className="modal-search">
                <input
                  type="text"
                  className="modal-search-input"
                  placeholder="🔍 Filter records inside modal..."
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                />
              </div>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      {modalData.columns.map((col) => (
                        <th key={col}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {modalData.rows.length > 0 ? (
                      modalData.rows.map((row, idx) => (
                        <tr key={idx}>
                          {row.map((cell, cellIdx) => (
                            <td key={cellIdx}>
                              {typeof cell === "string" && ["DRAFT", "WAITING", "READY", "DONE", "CANCELED"].includes(cell) ? (
                                <span className={`status-badge ${cell.toLowerCase()}`}>{cell}</span>
                              ) : typeof cell === "string" && ["Out of Stock", "Low Stock", "Optimal"].includes(cell) ? (
                                <span className={`alert-status ${cell === "Out of Stock" ? "out-of-stock" : cell === "Low Stock" ? "low-stock" : "optimal"}`}>{cell}</span>
                              ) : (
                                cell
                              )}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={modalData.columns.length} style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                          No records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Creation Modal for + New Receipt / + New Delivery / + Stock Transfer */}
      {createModalType && (
        <div className="modal-overlay" onClick={closeCreateModal}>
          <div className="modal-content" style={{ maxWidth: "600px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {createModalType === "receipt" && "📥 Create New Receipt"}
                {createModalType === "delivery" && "🚚 Create New Delivery"}
                {createModalType === "transfer" && "🔄 Create Stock Transfer"}
              </h2>
              <button className="modal-close-btn" onClick={closeCreateModal}>✕</button>
            </div>

            <div className="modal-body">
              {createSuccess && (
                <div style={{ padding: "0.75rem 1rem", background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d", borderRadius: "8px", marginBottom: "1rem", fontWeight: "600" }}>
                  {createSuccess}
                </div>
              )}

              {createError && (
                <div style={{ padding: "0.75rem 1rem", background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", borderRadius: "8px", marginBottom: "1rem" }}>
                  ⚠️ {createError}
                </div>
              )}

              <form onSubmit={handleCreateSubmit} className="create-form">
                <div className="form-row-2">
                  <div className="form-group">
                    <label htmlFor="referenceNo">Reference No</label>
                    <input
                      type="text"
                      id="referenceNo"
                      name="referenceNo"
                      className="form-input"
                      value={createFormData.referenceNo}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="status">Status</label>
                    <select
                      id="status"
                      name="status"
                      className="form-select"
                      value={createFormData.status}
                      onChange={handleFormChange}
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="WAITING">Waiting</option>
                      <option value="READY">Ready</option>
                      <option value="DONE">Done (Updates Inventory)</option>
                      <option value="CANCELED">Canceled</option>
                    </select>
                  </div>
                </div>

                {createModalType === "receipt" && (
                  <>
                    <div className="form-row-2">
                      <div className="form-group">
                        <label htmlFor="supplierId">Supplier</label>
                        <select
                          id="supplierId"
                          name="supplierId"
                          className="form-select"
                          value={createFormData.supplierId}
                          onChange={handleFormChange}
                        >
                          <option value="">Select Supplier</option>
                          {(dashboardData?.suppliers || []).map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="warehouseId">Destination Warehouse</label>
                        <select
                          id="warehouseId"
                          name="warehouseId"
                          className="form-select"
                          value={createFormData.warehouseId}
                          onChange={handleFormChange}
                        >
                          <option value="">Select Warehouse</option>
                          {(dashboardData?.warehouses || []).map((w) => (
                            <option key={w.id} value={w.id}>
                              {w.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="form-row-2">
                      <div className="form-group">
                        <label htmlFor="receiptDate">Receipt Date</label>
                        <input
                          type="date"
                          id="receiptDate"
                          name="receiptDate"
                          className="form-input"
                          value={createFormData.receiptDate}
                          onChange={handleFormChange}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="recipientAddress">Recipient Address</label>
                        <input
                          type="text"
                          id="recipientAddress"
                          name="recipientAddress"
                          className="form-input"
                          placeholder="e.g. Dock 4, North Cargo Bay"
                          value={createFormData.recipientAddress}
                          onChange={handleFormChange}
                        />
                      </div>
                    </div>

                    {/* Multi-Products Line Items Section */}
                    <div className="items-section">
                      <div className="items-header">
                        <span>📦 Multi-Product Line Items</span>
                        <span className="net-qty-badge">Net Qty: {computedNetQty} units</span>
                      </div>

                      {(createFormData.items || []).map((item, idx) => (
                        <div key={idx} className="item-row">
                          <select
                            className="form-select"
                            value={item.productId}
                            onChange={(e) => handleItemChange(idx, "productId", e.target.value)}
                            required
                          >
                            <option value="">Select Product</option>
                            {(dashboardData?.productsList || dashboardData?.topProducts || []).map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.sku || "No SKU"})
                              </option>
                            ))}
                          </select>

                          <input
                            type="number"
                            className="form-input"
                            min="1"
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                            required
                          />

                          {createFormData.items.length > 1 ? (
                            <button
                              type="button"
                              className="remove-item-btn"
                              onClick={() => handleRemoveItemRow(idx)}
                              title="Remove item"
                            >
                              ✕
                            </button>
                          ) : (
                            <div></div>
                          )}
                        </div>
                      ))}

                      <button type="button" className="add-item-btn" onClick={handleAddItemRow}>
                        + Add Another Product Item
                      </button>
                    </div>
                  </>
                )}

                {createModalType === "delivery" && (
                  <>
                    <div className="form-row-2">
                      <div className="form-group">
                        <label htmlFor="customerName">Customer Name</label>
                        <input
                          type="text"
                          id="customerName"
                          name="customerName"
                          className="form-input"
                          placeholder="e.g. Acme Corporation"
                          value={createFormData.customerName}
                          onChange={handleFormChange}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="warehouseId">Source Warehouse</label>
                        <select
                          id="warehouseId"
                          name="warehouseId"
                          className="form-select"
                          value={createFormData.warehouseId}
                          onChange={handleFormChange}
                        >
                          <option value="">Select Warehouse</option>
                          {(dashboardData?.warehouses || []).map((w) => (
                            <option key={w.id} value={w.id}>
                              {w.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="form-row-2">
                      <div className="form-group">
                        <label htmlFor="productId">Product Item</label>
                        <select
                          id="productId"
                          name="productId"
                          className="form-select"
                          value={createFormData.productId}
                          onChange={handleFormChange}
                        >
                          <option value="">Select Product</option>
                          {(dashboardData?.productsList || dashboardData?.topProducts || []).map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.sku || "No SKU"})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="quantity">Quantity</label>
                        <input
                          type="number"
                          id="quantity"
                          name="quantity"
                          className="form-input"
                          min="1"
                          value={createFormData.quantity}
                          onChange={handleFormChange}
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                {createModalType === "transfer" && (
                  <>
                    <div className="form-row-2">
                      <div className="form-group">
                        <label htmlFor="fromLocationId">From Location</label>
                        <select
                          id="fromLocationId"
                          name="fromLocationId"
                          className="form-select"
                          value={createFormData.fromLocationId}
                          onChange={handleFormChange}
                        >
                          <option value="">Select Source Location</option>
                          {(dashboardData?.locations || []).map((l) => (
                            <option key={l.id} value={l.id}>
                              {l.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="toLocationId">To Location</label>
                        <select
                          id="toLocationId"
                          name="toLocationId"
                          className="form-select"
                          value={createFormData.toLocationId}
                          onChange={handleFormChange}
                        >
                          <option value="">Select Target Location</option>
                          {(dashboardData?.locations || []).map((l) => (
                            <option key={l.id} value={l.id}>
                              {l.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="form-row-2">
                      <div className="form-group">
                        <label htmlFor="productId">Product Item</label>
                        <select
                          id="productId"
                          name="productId"
                          className="form-select"
                          value={createFormData.productId}
                          onChange={handleFormChange}
                        >
                          <option value="">Select Product</option>
                          {(dashboardData?.productsList || dashboardData?.topProducts || []).map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.sku || "No SKU"})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="quantity">Quantity</label>
                        <input
                          type="number"
                          id="quantity"
                          name="quantity"
                          className="form-input"
                          min="1"
                          value={createFormData.quantity}
                          onChange={handleFormChange}
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={closeCreateModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting
                      ? "Saving Record..."
                      : createModalType === "receipt"
                      ? "Create Receipt"
                      : createModalType === "delivery"
                      ? "Create Delivery"
                      : "Create Transfer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* New Delivery Modal Overlay Component */}
      <NewDeliveryComponent
        isOpen={isDeliveryModalOpen}
        onClose={() => setIsDeliveryModalOpen(false)}
        onSuccess={fetchDashboard}
        warehouses={dashboardData?.warehouses || []}
        products={dashboardData?.productsList || dashboardData?.topProducts || []}
        locations={dashboardData?.locations || []}
        stockList={dashboardData?.stockList || []}
      />

    </div>
  );
}

export default DashboardComponent;
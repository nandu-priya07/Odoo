import { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import NewDeliveryComponent from "./NewDeliveryComponent";
import "./Dashboard.css";

/* ------------------------------------------------------------------ */
/* Accessible Inline SVG Icons                                        */
/* ------------------------------------------------------------------ */

function Icon({ children, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

const LayoutDashboardIcon = (props) => (
  <Icon {...props}>
    <rect width="7" height="9" x="3" y="3" rx="1" />
    <rect width="7" height="5" x="14" y="3" rx="1" />
    <rect width="7" height="9" x="14" y="12" rx="1" />
    <rect width="7" height="5" x="3" y="16" rx="1" />
  </Icon>
);

const PackageIcon = (props) => (
  <Icon {...props}>
    <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />
    <path d="M12 22V12" />
    <path d="m3.3 7 7.7 4.73a2 2 0 0 0 2 0L20.7 7" />
  </Icon>
);

const ArrowDownLeftIcon = (props) => (
  <Icon {...props}>
    <line x1="17" y1="7" x2="7" y2="17" />
    <polyline points="17 17 7 17 7 7" />
  </Icon>
);

const ArrowUpRightIcon = (props) => (
  <Icon {...props}>
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="7 7 17 7 17 17" />
  </Icon>
);

const RepeatIcon = (props) => (
  <Icon {...props}>
    <path d="m17 2 4 4-4 4" />
    <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
    <path d="m7 22-4-4 4-4" />
    <path d="M21 13v1a4 4 0 0 1-4 4H3" />
  </Icon>
);

const HistoryIcon = (props) => (
  <Icon {...props}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M12 7v5l4 2" />
  </Icon>
);

const WarehouseIcon = (props) => (
  <Icon {...props}>
    <path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z" />
    <path d="M6 18h12" />
    <path d="M6 14h12" />
    <rect width="12" height="12" x="6" y="10" />
  </Icon>
);

const SlidersIcon = (props) => (
  <Icon {...props}>
    <line x1="4" x2="4" y1="21" y2="14" />
    <line x1="4" x2="4" y1="10" y2="3" />
    <line x1="12" x2="12" y1="21" y2="12" />
    <line x1="12" x2="12" y1="8" y2="3" />
    <line x1="20" x2="20" y1="21" y2="16" />
    <line x1="20" x2="20" y1="12" y2="3" />
    <line x1="1" x2="7" y1="14" y2="14" />
    <line x1="9" x2="15" y1="8" y2="8" />
    <line x1="17" x2="23" y1="16" y2="16" />
  </Icon>
);

const SettingsIcon = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </Icon>
);

const SearchIcon = (props) => (
  <Icon {...props}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </Icon>
);

const BellIcon = (props) => (
  <Icon {...props}>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </Icon>
);

const MenuIcon = (props) => (
  <Icon {...props}>
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </Icon>
);

const PlusIcon = (props) => (
  <Icon {...props}>
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </Icon>
);

const AlertTriangleIcon = (props) => (
  <Icon {...props}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </Icon>
);

const CheckCircleIcon = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </Icon>
);

const LogoutIcon = (props) => (
  <Icon {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </Icon>
);

const RefreshIcon = (props) => (
  <Icon {...props}>
    <path d="M21 2v6h-6" />
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
    <path d="M3 22v-6h6" />
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
  </Icon>
);

function BrandMark() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path d="M16 4.5 26.5 10.5 16 16.5 5.5 10.5Z" fill="#fff" />
      <path d="M5.5 10.5 16 16.5v11L5.5 21.5Z" fill="#fff" fillOpacity=".72" />
      <path d="M26.5 10.5 16 16.5v11l10.5-6Z" fill="#fff" fillOpacity=".45" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Main Dashboard Component                                           */
/* ------------------------------------------------------------------ */

function DashboardComponent() {
  const location = useLocation();

  // Navigation sidebar responsive state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    documentType: "All",
    status: "All",
    warehouse: "All",
  });

  // Data fetching state
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // Modal State for Card Details Drilldown
  const [activeModal, setActiveModal] = useState(null);
  const [modalSearch, setModalSearch] = useState("");

  // Modal State for Operations Creation
  const [createModalType, setCreateModalType] = useState(null); // 'receipt' | 'transfer'
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    referenceNo: "",
    supplierId: "",
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

  // Fetch Dashboard data from backend on mount
  useEffect(() => {
    let ignore = false;

    async function loadDashboard() {
      try {
        const response = await fetch("http://localhost:5000/api/dashboard");
        const json = await response.json();

        if (!ignore) {
          if (response.ok && json.success) {
            setDashboardData(json.data);
          } else {
            setError(json.message || "Failed to load dashboard data");
          }
        }
      } catch (err) {
        if (!ignore) {
          console.error("Dashboard fetch error:", err);
          setError("Unable to connect to StockSense server. Ensure backend is active on port 5000.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadDashboard();
    return () => {
      ignore = true;
    };
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
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
      setError("Unable to connect to StockSense server. Ensure backend is active on port 5000.");
    } finally {
      setRefreshing(false);
    }
  };

  const defaultProductId = useMemo(() => {
    return (dashboardData?.productsList?.[0] || dashboardData?.topProducts?.[0])?.id || "";
  }, [dashboardData]);

  const openCreateModal = (type) => {
    if (type === "delivery") {
      setIsDeliveryModalOpen(true);
      return;
    }
    const randNum = Math.floor(10000 + Math.random() * 90000);
    const prefix = type === "receipt" ? "REC" : "TRF";
    const firstProd = defaultProductId;

    setCreateModalType(type);
    setCreateError("");
    setCreateSuccess("");
    setCreateFormData({
      referenceNo: `${prefix}-${randNum}`,
      supplierId: dashboardData?.suppliers?.[0]?.id || "",
      warehouseId: dashboardData?.warehouses?.[0]?.id || "",
      fromLocationId: dashboardData?.locations?.[0]?.id || "",
      toLocationId: dashboardData?.locations?.[1]?.id || dashboardData?.locations?.[0]?.id || "",
      productId: firstProd,
      quantity: 1,
      receiptDate: new Date().toISOString().split("T")[0],
      recipientAddress: "Main Central Depot Dock A",
      items: [{ productId: firstProd, quantity: 1 }],
      status: "DRAFT",
    });
  };

  const closeCreateModal = () => {
    setCreateModalType(null);
    setCreateError("");
    setCreateSuccess("");
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

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setCreateFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const computedNetQty = useMemo(() => {
    if (createModalType === "receipt") {
      return (createFormData.items || []).reduce(
        (sum, item) => sum + (Number(item.quantity) || 0),
        0
      );
    }
    return Number(createFormData.quantity) || 1;
  }, [createFormData.items, createFormData.quantity, createModalType]);

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
        warehouseId: createFormData.warehouseId || null,
        fromLocationId: createFormData.fromLocationId || null,
        toLocationId: createFormData.toLocationId || null,
        receiptDate: createFormData.receiptDate || null,
        recipientAddress: createFormData.recipientAddress || null,
        netQty: computedNetQty,
        items:
          createModalType === "receipt"
            ? createFormData.items
            : [{ productId: createFormData.productId, quantity: Number(createFormData.quantity) || 1 }],
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
        setCreateSuccess(json.message || "Operation created successfully!");
        setTimeout(() => {
          closeCreateModal();
          handleRefresh();
        }, 900);
      } else {
        setCreateError(json.message || "Failed to create operation");
      }
    } catch (err) {
      console.error("Submit error:", err);
      setCreateError("Failed to submit request to server");
    } finally {
      setSubmitting(false);
    }
  };

  // KPI Calculations
  const apiStats = dashboardData?.stats;
  const totalProductsNum = apiStats?.totalProducts ?? 0;
  const totalStockNum = Number(apiStats?.totalStockUnits || 0);
  const lowOrOutNum = apiStats?.lowOrOutOfStock ?? 0;
  const receiptsNum = apiStats?.pendingReceipts ?? 0;
  const deliveriesNum = apiStats?.pendingDeliveries ?? 0;
  const transfersNum = apiStats?.internalTransfers ?? 0;

  const kpis = [
    {
      key: "totalProducts",
      title: "Total Catalog Items",
      value: totalProductsNum.toLocaleString(),
      change: "+8.4%",
      isPositive: true,
      hint: "Active catalog products",
      icon: <PackageIcon />,
      theme: "cyan",
    },
    {
      key: "totalStock",
      title: "Total Units in Stock",
      value: totalStockNum.toLocaleString(),
      change: "+12.1%",
      isPositive: true,
      hint: "Across all locations",
      icon: <WarehouseIcon />,
      theme: "blue",
    },
    {
      key: "lowStock",
      title: "Low & Out of Stock",
      value: lowOrOutNum.toLocaleString(),
      change: lowOrOutNum > 0 ? "Requires reorder" : "Optimal",
      isPositive: lowOrOutNum === 0,
      hint: "Inventory warnings",
      icon: <AlertTriangleIcon />,
      theme: "warning",
    },
    {
      key: "pendingReceipts",
      title: "Pending Inflow",
      value: receiptsNum.toLocaleString(),
      change: "Incoming",
      isNeutral: true,
      hint: "Awaiting warehouse intake",
      icon: <ArrowDownLeftIcon />,
      theme: "cyan",
    },
    {
      key: "pendingDeliveries",
      title: "Pending Deliveries",
      value: deliveriesNum.toLocaleString(),
      change: "Outgoing",
      isNeutral: true,
      hint: "Scheduled shipments",
      icon: <ArrowUpRightIcon />,
      theme: "blue",
    },
    {
      key: "internalTransfers",
      title: "Scheduled Transfers",
      value: transfersNum.toLocaleString(),
      change: "Inter-hub",
      isNeutral: true,
      hint: "Location reallocations",
      icon: <RepeatIcon />,
      theme: "purple",
    },
  ];

  // Filter Operations Feed
  const filteredOperations = useMemo(() => {
    if (!dashboardData?.operations) return [];

    return dashboardData.operations.filter((op) => {
      if (
        filters.documentType !== "All" &&
        op.document_type.toLowerCase() !== filters.documentType.toLowerCase()
      ) {
        return false;
      }
      if (
        filters.status !== "All" &&
        op.status.toLowerCase() !== filters.status.toLowerCase()
      ) {
        return false;
      }
      if (
        filters.warehouse !== "All" &&
        op.warehouse_name !== filters.warehouse
      ) {
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

  // Inventory Health Distribution (Doughnut chart)
  const healthMetrics = useMemo(() => {
    const total = totalProductsNum || 1;
    const low = apiStats?.lowStock || 0;
    const out = apiStats?.outOfStock || 0;
    const healthy = Math.max(0, total - (low + out));

    const healthyPct = Math.round((healthy / total) * 100);
    const lowPct = Math.round((low / total) * 100);
    const outPct = Math.round((out / total) * 100);

    return {
      healthy,
      low,
      out,
      healthyPct,
      lowPct,
      outPct,
    };
  }, [apiStats, totalProductsNum]);

  // Filter Stock Alerts
  const filteredAlerts = useMemo(() => {
    if (!dashboardData?.stockAlerts) return [];
    if (!searchQuery.trim()) return dashboardData.stockAlerts;

    const query = searchQuery.toLowerCase();
    return dashboardData.stockAlerts.filter((a) => {
      const p = (a.product || "").toLowerCase();
      const s = (a.sku || "").toLowerCase();
      return p.includes(query) || s.includes(query);
    });
  }, [dashboardData, searchQuery]);

  // Modal Detail Content Builder (Preserving drilldowns)
  const modalData = useMemo(() => {
    if (!activeModal || !dashboardData) return { title: "", count: 0, columns: [], rows: [] };
    const query = modalSearch.toLowerCase().trim();

    switch (activeModal) {
      case "totalProducts": {
        const source = dashboardData.productsList || dashboardData.topProducts || [];
        const list = source.filter((p) => {
          if (!query) return true;
          return (
            (p.name || "").toLowerCase().includes(query) ||
            (p.sku || "").toLowerCase().includes(query) ||
            (p.category_name || "").toLowerCase().includes(query)
          );
        });
        return {
          title: "All Products Catalog",
          count: list.length,
          columns: ["Product Name", "SKU", "Category", "UoM", "Initial Stock"],
          rows: list.map((p) => [
            p.name,
            p.sku || "-",
            p.category_name || "General",
            p.unit_of_measure || "pcs",
            p.initial_stock !== undefined ? p.initial_stock : p.total_quantity || 0,
          ]),
        };
      }
      case "totalStock": {
        const source = dashboardData.stockList || dashboardData.topProducts || [];
        const list = source.filter((s) => {
          if (!query) return true;
          const pName = s.product_name || s.name || "";
          const sku = s.sku || "";
          return pName.toLowerCase().includes(query) || sku.toLowerCase().includes(query);
        });
        return {
          title: "Stock Units Breakdown",
          count: list.length,
          columns: ["Product Name", "SKU", "Warehouse / Location", "Quantity"],
          rows: list.map((s) => [
            s.product_name || s.name,
            s.sku || "-",
            s.warehouse_name || s.location_name || "Main Facility",
            `${s.quantity !== undefined ? s.quantity : s.total_quantity || 0} units`,
          ]),
        };
      }
      case "lowStock": {
        const source = dashboardData.stockAlerts || [];
        const list = source.filter((a) => {
          if (!query) return true;
          return (
            (a.product || "").toLowerCase().includes(query) ||
            (a.sku || "").toLowerCase().includes(query)
          );
        });
        return {
          title: "Critical & Low Stock Items",
          count: list.length,
          columns: ["Product", "SKU", "Category", "Location", "Status", "Units Remaining"],
          rows: list.map((a) => [
            a.product,
            a.sku || "-",
            a.category || "General",
            a.location || "Main Area",
            a.status,
            `${a.quantity || 0} units`,
          ]),
        };
      }
      case "pendingReceipts": {
        const source =
          dashboardData.receiptsList ||
          (dashboardData.operations || []).filter((o) => o.document_type === "Receipt");
        const list = source.filter((r) => {
          if (!query) return true;
          const ref = r.receipt_number || r.reference_no || "";
          const sup = r.supplier_name || r.warehouse_name || "";
          return ref.toLowerCase().includes(query) || sup.toLowerCase().includes(query);
        });
        return {
          title: "Pending Inflow Receipts",
          count: list.length,
          columns: ["Receipt Number", "Supplier / Warehouse", "Net Qty", "Status", "Date"],
          rows: list.map((r) => [
            r.receipt_number || r.reference_no,
            r.supplier_name || r.warehouse_name || "Main Warehouse",
            `${r.net_qty || 1} units`,
            r.status,
            r.receipt_date
              ? new Date(r.receipt_date).toLocaleDateString()
              : new Date(r.created_at).toLocaleDateString(),
          ]),
        };
      }
      case "pendingDeliveries": {
        const source =
          dashboardData.deliveriesList ||
          (dashboardData.operations || []).filter((o) => o.document_type === "Delivery");
        const list = source.filter((d) => {
          if (!query) return true;
          const ref = d.delivery_number || d.reference_no || "";
          const cust = d.customer_name || d.warehouse_name || "";
          return ref.toLowerCase().includes(query) || cust.toLowerCase().includes(query);
        });
        return {
          title: "Pending Outbound Deliveries",
          count: list.length,
          columns: ["Delivery Number", "Customer / Destination", "Status", "Date"],
          rows: list.map((d) => [
            d.delivery_number || d.reference_no,
            d.customer_name || d.warehouse_name || "Regional Client",
            d.status,
            d.created_at ? new Date(d.created_at).toLocaleDateString() : "-",
          ]),
        };
      }
      case "internalTransfers": {
        const source =
          dashboardData.transfersList ||
          (dashboardData.operations || []).filter(
            (o) => o.document_type === "Internal Transfer" || o.document_type === "Transfer"
          );
        const list = source.filter((t) => {
          if (!query) return true;
          const ref = t.transfer_number || t.reference_no || "";
          return ref.toLowerCase().includes(query);
        });
        return {
          title: "Scheduled Inter-Hub Transfers",
          count: list.length,
          columns: ["Transfer Number", "Source Location", "Destination", "Status", "Date"],
          rows: list.map((t) => [
            t.transfer_number || t.reference_no,
            t.from_location || "Dock A",
            t.to_location || "Rack B",
            t.status,
            t.created_at ? new Date(t.created_at).toLocaleDateString() : "-",
          ]),
        };
      }
      default:
        return { title: "", count: 0, columns: [], rows: [] };
    }
  }, [activeModal, dashboardData, modalSearch]);

  const navLinks = [
    { label: "Dashboard", path: "/dashboard", icon: <LayoutDashboardIcon /> },
    { label: "Products Catalog", path: "/products", icon: <PackageIcon /> },
    { label: "Receipts (Inflow)", path: "/receipts", icon: <ArrowDownLeftIcon /> },
    { label: "Deliveries (Outflow)", path: "/deliveries", icon: <ArrowUpRightIcon /> },
    { label: "Stock Transfers", path: "/transfers", icon: <RepeatIcon /> },
    { label: "Move History", path: "/move-history", icon: <HistoryIcon /> },
    { label: "Warehouses", path: "/warehouses", icon: <WarehouseIcon /> },
    { label: "Reorder Rules", path: "/reorder-rules", icon: <SlidersIcon /> },
    { label: "Settings", path: "/settings", icon: <SettingsIcon /> },
  ];

  return (
    <div className="dashboard-content-root">
      {/* Quick Action & Controls Toolbar */}
      <div className="dash-toolbar-card">
        <div className="dash-toolbar-left">
          <div className="dash-toolbar-search">
            <span className="dash-topbar__search-icon">
              <SearchIcon />
            </span>
            <input
              type="text"
              className="dash-topbar__search-input"
              placeholder="Search operations reference, SKU, or facility..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Filter operations"
            />
          </div>
        </div>

        <div className="dash-toolbar-actions">
          <button
            type="button"
            className="dash-toolbar-btn"
            onClick={handleRefresh}
            title="Refresh telemetry data"
          >
            <span style={{ display: "flex", animation: refreshing ? "dash-fade-in 0.6s infinite" : "none" }}>
              <RefreshIcon />
            </span>
            <span>Refresh</span>
          </button>

          <button
            type="button"
            className="dash-toolbar-btn"
            onClick={() => setActiveModal("lowStock")}
            title="View stock alerts"
          >
            <BellIcon />
            <span>Alerts</span>
            {lowOrOutNum > 0 && <span className="dash-topbar__badge-dot" style={{ position: "static", display: "inline-block" }} />}
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => openCreateModal("receipt")}
          >
            <PlusIcon />
            <span>+ Receipt</span>
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsDeliveryModalOpen(true)}
          >
            <PlusIcon />
            <span>+ Delivery</span>
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => openCreateModal("transfer")}
          >
            <PlusIcon />
            <span>+ Transfer</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* DASHBOARD BODY                                               */}
      {/* ============================================================ */}
      <div className="dash-body">
          {/* Welcome Banner */}
          <section className="dash-welcome" aria-labelledby="dash-welcome-heading">
            <div className="dash-welcome__left">
              <div className="dash-welcome__eyebrow">
                <span>Enterprise Telemetry</span> · Real-time Control
              </div>
              <h1 id="dash-welcome-heading" className="dash-welcome__title">
                Good morning, Admin
              </h1>
              <p className="dash-welcome__subtitle">
                Here is your live inventory health, stock movement velocity, and scheduled shipments.
              </p>
            </div>

            <div className="dash-welcome__actions">
              <button
                type="button"
                className="dash-action-btn dash-action-btn--cyan"
                onClick={() => openCreateModal("receipt")}
              >
                <ArrowDownLeftIcon />
                <span>+ New Receipt</span>
              </button>
              <button
                type="button"
                className="dash-action-btn dash-action-btn--blue"
                onClick={() => openCreateModal("delivery")}
              >
                <ArrowUpRightIcon />
                <span>+ New Delivery</span>
              </button>
              <button
                type="button"
                className="dash-action-btn dash-action-btn--purple"
                onClick={() => openCreateModal("transfer")}
              >
                <RepeatIcon />
                <span>🔄 Stock Transfer</span>
              </button>
            </div>
          </section>

          {/* Error Banner */}
          {error && (
            <div
              style={{
                padding: "1rem 1.25rem",
                borderRadius: "12px",
                background: "#fef2f2",
                border: "1px solid #fee2e2",
                color: "#b91c1c",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: "600" }}>
                <AlertTriangleIcon />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={handleRefresh}
                style={{
                  padding: "0.35rem 0.75rem",
                  borderRadius: "6px",
                  background: "#ffffff",
                  border: "1px solid #fca5a5",
                  color: "#991b1b",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Retry
              </button>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && !dashboardData && (
            <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
              <p>Gathering real-time inventory metrics across all warehouse nodes…</p>
            </div>
          )}

          {/* KPI CARDS GRID */}
          <section className="dash-kpi-grid" aria-label="Key Performance Indicators">
            {kpis.map((kpi) => (
              <div
                key={kpi.key}
                className="dash-kpi-card"
                onClick={() => setActiveModal(kpi.key)}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => e.key === "Enter" && setActiveModal(kpi.key)}
                aria-label={`View details for ${kpi.title}`}
              >
                <div className="dash-kpi-card__top">
                  <span className={`dash-kpi-card__icon dash-kpi-card__icon--${kpi.theme}`}>
                    {kpi.icon}
                  </span>
                  <span
                    className={`dash-kpi-card__trend ${
                      kpi.isNeutral
                        ? "dash-kpi-card__trend--neutral"
                        : kpi.isPositive
                        ? "dash-kpi-card__trend--pos"
                        : "dash-kpi-card__trend--warn"
                    }`}
                  >
                    {kpi.change}
                  </span>
                </div>
                <h3 className="dash-kpi-card__value">{kpi.value}</h3>
                <p className="dash-kpi-card__title">{kpi.title}</p>
                <div className="dash-kpi-card__hint">
                  <span>{kpi.hint}</span>
                  <span>View records →</span>
                </div>
              </div>
            ))}
          </section>

          {/* ============================================================ */}
          {/* ANALYTICS SECTION                                            */}
          {/* ============================================================ */}
          <section className="dash-analytics-grid" aria-label="Inventory Analytics">
            {/* 7-Day Stock Movement SVG Chart */}
            <div className="dash-card">
              <div className="dash-card__header">
                <div>
                  <h2 className="dash-card__title">Stock Movement Velocity</h2>
                  <p className="dash-card__subtitle">
                    7-day inflow (supplier receipts) vs outflow (customer deliveries)
                  </p>
                </div>
                <div className="dash-chart-legend">
                  <div className="dash-chart-legend__item">
                    <span
                      className="dash-chart-legend__color"
                      style={{ backgroundColor: "var(--dash-primary)" }}
                    />
                    <span>Receipt Inflow</span>
                  </div>
                  <div className="dash-chart-legend__item">
                    <span
                      className="dash-chart-legend__color"
                      style={{ backgroundColor: "var(--dash-secondary)" }}
                    />
                    <span>Deliveries</span>
                  </div>
                </div>
              </div>

              <div className="dash-chart-container">
                <svg
                  className="dash-chart-svg"
                  viewBox="0 0 540 180"
                  preserveAspectRatio="none"
                  aria-label="Stock movement line chart"
                >
                  <defs>
                    <linearGradient id="dash-receipts-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#20b8c2" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#20b8c2" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="dash-deliveries-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38cbf4" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#38cbf4" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  <line x1="40" y1="30" x2="520" y2="30" className="dash-chart__grid-line" />
                  <line x1="40" y1="75" x2="520" y2="75" className="dash-chart__grid-line" />
                  <line x1="40" y1="120" x2="520" y2="120" className="dash-chart__grid-line" />
                  <line x1="40" y1="150" x2="520" y2="150" className="dash-chart__grid-line" />

                  {/* Axis values */}
                  <text x="15" y="34" className="dash-chart__axis-text">120u</text>
                  <text x="20" y="79" className="dash-chart__axis-text">80u</text>
                  <text x="20" y="124" className="dash-chart__axis-text">40u</text>
                  <text x="25" y="154" className="dash-chart__axis-text">0</text>

                  {/* Inflow Area & Curve */}
                  <path
                    className="dash-chart__area-receipts"
                    d="M 50 150 L 50 100 Q 120 70, 190 90 T 330 50 T 470 35 L 510 40 L 510 150 Z"
                  />
                  <path
                    className="dash-chart__line-receipts"
                    d="M 50 100 Q 120 70, 190 90 T 330 50 T 470 35 L 510 40"
                  />

                  {/* Outflow Area & Curve */}
                  <path
                    className="dash-chart__area-deliveries"
                    d="M 50 150 L 50 120 Q 120 110, 190 115 T 330 75 T 470 60 L 510 70 L 510 150 Z"
                  />
                  <path
                    className="dash-chart__line-deliveries"
                    d="M 50 120 Q 120 110, 190 115 T 330 75 T 470 60 L 510 70"
                  />

                  {/* Data Point Circles */}
                  <circle cx="50" cy="100" r="4" stroke="#20b8c2" className="dash-chart__dot" />
                  <circle cx="190" cy="90" r="4" stroke="#20b8c2" className="dash-chart__dot" />
                  <circle cx="330" cy="50" r="4" stroke="#20b8c2" className="dash-chart__dot" />
                  <circle cx="470" cy="35" r="4" stroke="#20b8c2" className="dash-chart__dot" />

                  {/* Day labels */}
                  <text x="50" y="172" textAnchor="middle" className="dash-chart__axis-text">Mon</text>
                  <text x="125" y="172" textAnchor="middle" className="dash-chart__axis-text">Tue</text>
                  <text x="200" y="172" textAnchor="middle" className="dash-chart__axis-text">Wed</text>
                  <text x="275" y="172" textAnchor="middle" className="dash-chart__axis-text">Thu</text>
                  <text x="350" y="172" textAnchor="middle" className="dash-chart__axis-text">Fri</text>
                  <text x="425" y="172" textAnchor="middle" className="dash-chart__axis-text">Sat</text>
                  <text x="500" y="172" textAnchor="middle" className="dash-chart__axis-text">Sun</text>
                </svg>
              </div>
            </div>

            {/* Inventory Health Ring Gauge */}
            <div className="dash-card">
              <div className="dash-card__header">
                <div>
                  <h2 className="dash-card__title">Inventory Stock Health</h2>
                  <p className="dash-card__subtitle">Catalog status breakdown</p>
                </div>
              </div>

              <div className="dash-health-visual">
                <div className="dash-ring-wrapper">
                  <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="38" className="dash-ring-track" />
                    {/* Healthy segment */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      className="dash-ring-segment"
                      stroke="var(--dash-primary)"
                      strokeDasharray={`${(healthMetrics.healthyPct * 238) / 100} 238`}
                      strokeDashoffset="0"
                    />
                    {/* Low stock segment */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      className="dash-ring-segment"
                      stroke="var(--dash-warning)"
                      strokeDasharray={`${(healthMetrics.lowPct * 238) / 100} 238`}
                      strokeDashoffset={`-${(healthMetrics.healthyPct * 238) / 100}`}
                    />
                    {/* Out of stock segment */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      className="dash-ring-segment"
                      stroke="var(--dash-error)"
                      strokeDasharray={`${(healthMetrics.outPct * 238) / 100} 238`}
                      strokeDashoffset={`-${((healthMetrics.healthyPct + healthMetrics.lowPct) * 238) / 100}`}
                    />
                  </svg>
                  <div className="dash-ring-center">
                    <span className="dash-ring-percent">{healthMetrics.healthyPct}%</span>
                    <span className="dash-ring-label">Optimal</span>
                  </div>
                </div>

                <div className="dash-health-legend">
                  <div className="dash-health-legend__row">
                    <div className="dash-health-legend__title">
                      <span
                        className="dash-health-legend__dot"
                        style={{ backgroundColor: "var(--dash-primary)" }}
                      />
                      <span>Healthy Stock</span>
                    </div>
                    <span className="dash-health-legend__val">{healthMetrics.healthy} items</span>
                  </div>

                  <div className="dash-health-legend__row">
                    <div className="dash-health-legend__title">
                      <span
                        className="dash-health-legend__dot"
                        style={{ backgroundColor: "var(--dash-warning)" }}
                      />
                      <span>Low Stock (&le; 50)</span>
                    </div>
                    <span className="dash-health-legend__val">{healthMetrics.low} items</span>
                  </div>

                  <div className="dash-health-legend__row">
                    <div className="dash-health-legend__title">
                      <span
                        className="dash-health-legend__dot"
                        style={{ backgroundColor: "var(--dash-error)" }}
                      />
                      <span>Out of Stock (0)</span>
                    </div>
                    <span className="dash-health-legend__val">{healthMetrics.out} items</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ============================================================ */}
          {/* FILTER TOOLBAR                                               */}
          {/* ============================================================ */}
          <div className="dash-filter-bar">
            <div className="dash-filter-controls">
              <span style={{ fontSize: "0.8125rem", fontWeight: "700", color: "var(--dash-text-strong)" }}>
                Filter Operations:
              </span>

              <select
                className="dash-filter-select"
                value={filters.documentType}
                onChange={(e) => setFilters((prev) => ({ ...prev, documentType: e.target.value }))}
                aria-label="Filter by document type"
              >
                <option value="All">All Document Types</option>
                <option value="Receipt">Receipts (Inbound)</option>
                <option value="Delivery">Deliveries (Outbound)</option>
                <option value="Internal Transfer">Internal Transfers</option>
              </select>

              <select
                className="dash-filter-select"
                value={filters.status}
                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                aria-label="Filter by status"
              >
                <option value="All">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="WAITING">Waiting</option>
                <option value="READY">Ready</option>
                <option value="DONE">Done</option>
                <option value="CANCELED">Canceled</option>
              </select>

              <select
                className="dash-filter-select"
                value={filters.warehouse}
                onChange={(e) => setFilters((prev) => ({ ...prev, warehouse: e.target.value }))}
                aria-label="Filter by warehouse"
              >
                <option value="All">All Warehouses</option>
                {(dashboardData?.warehouses || []).map((w) => (
                  <option key={w.id} value={w.name}>
                    {w.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                className="dash-reset-btn"
                onClick={() => {
                  setSearchQuery("");
                  setFilters({ documentType: "All", status: "All", warehouse: "All" });
                }}
              >
                Reset
              </button>
            </div>

            <div style={{ fontSize: "0.8125rem", color: "var(--dash-text-muted)" }}>
              Showing <strong>{filteredOperations.length}</strong> operational documents
            </div>
          </div>

          {/* ============================================================ */}
          {/* TWO-COLUMN OPERATIONAL FEED & ALERTS                         */}
          {/* ============================================================ */}
          <div className="dash-feed-grid">
            {/* Column 1: Operations Feed Table */}
            <div className="dash-card">
              <div className="dash-card__header">
                <div>
                  <h2 className="dash-card__title">Recent Inventory Operations</h2>
                  <p className="dash-card__subtitle">Live movement ledger and fulfillment status</p>
                </div>
              </div>

              <div className="dash-table-wrapper">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Document</th>
                      <th>Reference No</th>
                      <th>Facility / Node</th>
                      <th>Status</th>
                      <th>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOperations.length > 0 ? (
                      filteredOperations.slice(0, 10).map((op) => (
                        <tr key={`${op.document_type}-${op.id}`}>
                          <td>
                            <span
                              className={`dash-badge dash-badge--${op.document_type
                                .toLowerCase()
                                .replace(/\s+/g, "")}`}
                            >
                              {op.document_type}
                            </span>
                          </td>
                          <td>
                            <span className="dash-ref-code">{op.reference_no}</span>
                          </td>
                          <td>{op.warehouse_name || "Central Logistics"}</td>
                          <td>
                            <span className={`dash-badge dash-status--${op.status.toLowerCase()}`}>
                              {op.status}
                            </span>
                          </td>
                          <td style={{ color: "var(--dash-text-muted)", fontSize: "0.8125rem" }}>
                            {new Date(op.created_at).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          style={{
                            textAlign: "center",
                            padding: "2rem",
                            color: "var(--dash-text-muted)",
                          }}
                        >
                          No matching operations found for current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Column 2: Critical Alerts & Activity */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Critical Stock Alerts */}
              <div className="dash-card">
                <div className="dash-card__header">
                  <div>
                    <h2 className="dash-card__title">Critical Stock Alerts</h2>
                    <p className="dash-card__subtitle">Items below safety reorder threshold</p>
                  </div>
                  <span className="dash-sidebar__badge">{filteredAlerts.length} Active</span>
                </div>

                <div className="dash-alert-list">
                  {filteredAlerts.length > 0 ? (
                    filteredAlerts.slice(0, 4).map((alert) => (
                      <div
                        key={alert.id || alert.product}
                        className={`dash-alert-item ${
                          alert.status === "Low Stock" ? "dash-alert-item--low" : ""
                        }`}
                      >
                        <div className="dash-alert-item__content">
                          <h4 className="dash-alert-item__title">{alert.product}</h4>
                          <p className="dash-alert-item__meta">
                            SKU: {alert.sku || "-"} · {alert.location} · {alert.quantity} units left
                          </p>
                        </div>
                        <span
                          className={`dash-alert-badge ${
                            alert.status === "Out of Stock"
                              ? "dash-alert-badge--out"
                              : "dash-alert-badge--low"
                          }`}
                        >
                          {alert.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: "1.5rem", textAlign: "center", color: "#15803d" }}>
                      <CheckCircleIcon style={{ width: "2rem", height: "2rem", margin: "0 auto 0.5rem" }} />
                      <div style={{ fontWeight: "700" }}>All stock levels healthy</div>
                      <div style={{ fontSize: "0.8125rem", color: "#475569" }}>
                        No items currently breach reorder triggers.
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Activity Timeline */}
              <div className="dash-card">
                <div className="dash-card__header">
                  <div>
                    <h2 className="dash-card__title">Warehouse Activity Log</h2>
                    <p className="dash-card__subtitle">Real-time ledger events</p>
                  </div>
                </div>

                <div className="dash-timeline">
                  {(dashboardData?.recentActivity || []).slice(0, 5).map((act) => (
                    <div key={act.id} className="dash-timeline__item">
                      <span
                        className={`dash-timeline__node dash-timeline__node--${
                          act.move_type === "IN" ? "in" : act.move_type === "OUT" ? "out" : "trf"
                        }`}
                      />
                      <p className="dash-timeline__title">
                        {act.item || "Stock Item"} ({act.move_type === "IN" ? "+" : "-"}
                        {act.quantity} units)
                      </p>
                      <p className="dash-timeline__desc">
                        Node: {act.location || "Central Storage"} · SKU: {act.sku || "-"}
                      </p>
                      <span className="dash-timeline__time">
                        {new Date(act.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  ))}
                  {(!dashboardData?.recentActivity || dashboardData.recentActivity.length === 0) && (
                    <div style={{ color: "var(--dash-text-muted)", fontSize: "0.8125rem" }}>
                      Awaiting ledger operations.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* ============================================================ */}
      {/* MODAL: CARD DETAILS DRILLDOWN                                */}
      {/* ============================================================ */}
      {activeModal && (
        <div className="dash-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="dash-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="dash-modal-header">
              <h2>
                {modalData.title}
                <span className="dash-modal-count">{modalData.count} Records</span>
              </h2>
              <button
                type="button"
                className="dash-modal-close"
                onClick={() => setActiveModal(null)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="dash-modal-body">
              <div style={{ marginBottom: "1rem" }}>
                <input
                  type="text"
                  className="dash-form-input"
                  placeholder="Filter records inside modal..."
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                />
              </div>

              <div className="dash-table-wrapper">
                <table className="dash-table">
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
                          {row.map((cell, cIdx) => (
                            <td key={cIdx}>
                              {typeof cell === "string" &&
                              ["DRAFT", "WAITING", "READY", "DONE", "CANCELED"].includes(cell) ? (
                                <span className={`dash-badge dash-status--${cell.toLowerCase()}`}>
                                  {cell}
                                </span>
                              ) : typeof cell === "string" &&
                                ["Out of Stock", "Low Stock"].includes(cell) ? (
                                <span
                                  className={`dash-alert-badge ${
                                    cell === "Out of Stock"
                                      ? "dash-alert-badge--out"
                                      : "dash-alert-badge--low"
                                  }`}
                                >
                                  {cell}
                                </span>
                              ) : (
                                cell
                              )}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={modalData.columns.length}
                          style={{
                            textAlign: "center",
                            padding: "2rem",
                            color: "var(--dash-text-muted)",
                          }}
                        >
                          No matching records found.
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

      {/* ============================================================ */}
      {/* MODAL: CREATE OPERATION (RECEIPT / TRANSFER)                 */}
      {/* ============================================================ */}
      {createModalType && (
        <div className="dash-modal-overlay" onClick={closeCreateModal}>
          <div
            className="dash-modal-container"
            style={{ maxWidth: "620px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dash-modal-header">
              <h2>
                {createModalType === "receipt" ? "📥 Create Inbound Receipt" : "🔄 Initiate Stock Transfer"}
              </h2>
              <button
                type="button"
                className="dash-modal-close"
                onClick={closeCreateModal}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="dash-modal-body">
              {createSuccess && (
                <div
                  style={{
                    padding: "0.75rem 1rem",
                    borderRadius: "8px",
                    background: "#ecfdf3",
                    border: "1px solid #abefc6",
                    color: "#067647",
                    marginBottom: "1rem",
                    fontWeight: "600",
                  }}
                >
                  {createSuccess}
                </div>
              )}

              {createError && (
                <div
                  style={{
                    padding: "0.75rem 1rem",
                    borderRadius: "8px",
                    background: "#fef3f2",
                    border: "1px solid #fecdca",
                    color: "#b42318",
                    marginBottom: "1rem",
                    fontWeight: "600",
                  }}
                >
                  {createError}
                </div>
              )}

              <form onSubmit={handleCreateSubmit} className="dash-form">
                <div className="dash-form-row">
                  <div className="dash-form-group">
                    <label htmlFor="referenceNo">Reference Number</label>
                    <input
                      type="text"
                      id="referenceNo"
                      name="referenceNo"
                      className="dash-form-input"
                      value={createFormData.referenceNo}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className="dash-form-group">
                    <label htmlFor="status">Initial Status</label>
                    <select
                      id="status"
                      name="status"
                      className="dash-form-select"
                      value={createFormData.status}
                      onChange={handleFormChange}
                    >
                      <option value="DRAFT">DRAFT</option>
                      <option value="WAITING">WAITING</option>
                      <option value="READY">READY</option>
                    </select>
                  </div>
                </div>

                {createModalType === "receipt" ? (
                  <>
                    <div className="dash-form-row">
                      <div className="dash-form-group">
                        <label htmlFor="supplierId">Supplier</label>
                        <select
                          id="supplierId"
                          name="supplierId"
                          className="dash-form-select"
                          value={createFormData.supplierId}
                          onChange={handleFormChange}
                          required
                        >
                          <option value="">Select Supplier</option>
                          {(dashboardData?.suppliers || []).map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="dash-form-group">
                        <label htmlFor="warehouseId">Target Warehouse</label>
                        <select
                          id="warehouseId"
                          name="warehouseId"
                          className="dash-form-select"
                          value={createFormData.warehouseId}
                          onChange={handleFormChange}
                          required
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

                    <div className="dash-form-group">
                      <label>Receipt Line Items (Total: {computedNetQty} units)</label>
                      {createFormData.items.map((it, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            gap: "0.5rem",
                            marginBottom: "0.5rem",
                            alignItems: "center",
                          }}
                        >
                          <select
                            className="dash-form-select"
                            style={{ flex: 2 }}
                            value={it.productId}
                            onChange={(e) => handleItemChange(idx, "productId", e.target.value)}
                            required
                          >
                            <option value="">Select Product</option>
                            {(dashboardData?.productsList || dashboardData?.topProducts || []).map(
                              (p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} ({p.sku || "No SKU"})
                                </option>
                              )
                            )}
                          </select>
                          <input
                            type="number"
                            min="1"
                            className="dash-form-input"
                            style={{ width: "90px" }}
                            value={it.quantity}
                            onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                            required
                          />
                          {createFormData.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItemRow(idx)}
                              style={{
                                border: 0,
                                background: "#fee2e2",
                                color: "#b91c1c",
                                borderRadius: "8px",
                                padding: "0.5rem",
                                cursor: "pointer",
                              }}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={handleAddItemRow}
                        style={{
                          alignSelf: "flex-start",
                          background: "#eff6ff",
                          border: "1px solid #bfdbfe",
                          color: "#1d4ed8",
                          padding: "0.4rem 0.75rem",
                          borderRadius: "8px",
                          fontWeight: "600",
                          cursor: "pointer",
                          fontSize: "0.8125rem",
                        }}
                      >
                        + Add Line Item
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="dash-form-row">
                      <div className="dash-form-group">
                        <label htmlFor="fromLocationId">Source Location</label>
                        <select
                          id="fromLocationId"
                          name="fromLocationId"
                          className="dash-form-select"
                          value={createFormData.fromLocationId}
                          onChange={handleFormChange}
                          required
                        >
                          <option value="">Select Origin Location</option>
                          {(dashboardData?.locations || []).map((l) => (
                            <option key={l.id} value={l.id}>
                              {l.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="dash-form-group">
                        <label htmlFor="toLocationId">Destination Location</label>
                        <select
                          id="toLocationId"
                          name="toLocationId"
                          className="dash-form-select"
                          value={createFormData.toLocationId}
                          onChange={handleFormChange}
                          required
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

                    <div className="dash-form-row">
                      <div className="dash-form-group">
                        <label htmlFor="productId">Item to Transfer</label>
                        <select
                          id="productId"
                          name="productId"
                          className="dash-form-select"
                          value={createFormData.productId}
                          onChange={handleFormChange}
                          required
                        >
                          <option value="">Select Catalog Item</option>
                          {(dashboardData?.productsList || dashboardData?.topProducts || []).map(
                            (p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.sku || "No SKU"})
                              </option>
                            )
                          )}
                        </select>
                      </div>

                      <div className="dash-form-group">
                        <label htmlFor="quantity">Quantity</label>
                        <input
                          type="number"
                          id="quantity"
                          name="quantity"
                          min="1"
                          className="dash-form-input"
                          value={createFormData.quantity}
                          onChange={handleFormChange}
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="dash-form-actions">
                  <button type="button" className="dash-btn-cancel" onClick={closeCreateModal}>
                    Cancel
                  </button>
                  <button type="submit" className="dash-btn-primary" disabled={submitting}>
                    {submitting ? "Processing…" : "Submit Operation"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* New Delivery Modal Overlay Integration */}
      <NewDeliveryComponent
        isOpen={isDeliveryModalOpen}
        onClose={() => setIsDeliveryModalOpen(false)}
        onSuccess={handleRefresh}
        warehouses={dashboardData?.warehouses || []}
        products={dashboardData?.productsList || dashboardData?.topProducts || []}
        locations={dashboardData?.locations || []}
        stockList={dashboardData?.stockList || []}
      />
    </div>
  );
}

export default DashboardComponent;
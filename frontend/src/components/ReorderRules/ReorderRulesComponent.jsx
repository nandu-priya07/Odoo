import React, { useState, useEffect } from "react";
import { fetchReorderRules, saveReorderRule, deleteReorderRule } from "../../services/reorderService";
import ReorderRuleForm from "./ReorderRuleForm";

const ReorderRulesComponent = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState("ALL"); // 'ALL', 'LOW_OR_OUT', 'OUT_OF_STOCK'

  const loadRules = async () => {
    try {
      setLoading(true);
      const data = await fetchReorderRules();
      setRules(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const handleSave = async (formData) => {
    try {
      setSubmitting(true);
      await saveReorderRule(formData);
      setShowForm(false);
      setEditingRule(null);
      loadRules();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this reorder rule?")) return;
    try {
      await deleteReorderRule(id);
      loadRules();
    } catch (err) {
      alert(err.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "OUT OF STOCK":
        return <span className="badge badge-danger">OUT OF STOCK</span>;
      case "LOW STOCK":
        return <span className="badge badge-warning">LOW STOCK</span>;
      default:
        return <span className="badge badge-success">NORMAL</span>;
    }
  };

  const filteredRules = rules.filter((r) => {
    if (filter === "LOW_OR_OUT") {
      return r.stock_status === "LOW STOCK" || r.stock_status === "OUT OF STOCK";
    }
    if (filter === "OUT_OF_STOCK") {
      return r.stock_status === "OUT OF STOCK";
    }
    return true;
  });

  return (
    <div className="dashboard-container">
      {showForm ? (
        <ReorderRuleForm
          initialData={editingRule}
          onSubmit={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingRule(null);
          }}
          submitting={submitting}
        />
      ) : (
        <>
          <div className="dashboard-header" style={{ marginBottom: "20px" }}>
            <div>
              <h1 className="dashboard-title">Reorder Rules & Low-Stock Alerts</h1>
              <p className="dashboard-subtitle">Monitor product stock levels and automated threshold triggers</p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditingRule(null);
                setShowForm(true);
              }}
            >
              + Create Reorder Rule
            </button>
          </div>

          <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
            <button
              className={`btn ${filter === "ALL" ? "btn-primary" : "btn-outline"}`}
              onClick={() => setFilter("ALL")}
            >
              All Rules ({rules.length})
            </button>
            <button
              className={`btn ${filter === "LOW_OR_OUT" ? "btn-primary" : "btn-outline"}`}
              onClick={() => setFilter("LOW_OR_OUT")}
            >
              Alerts / Action Required ({rules.filter((r) => r.stock_status !== "NORMAL").length})
            </button>
            <button
              className={`btn ${filter === "OUT_OF_STOCK" ? "btn-primary" : "btn-outline"}`}
              onClick={() => setFilter("OUT_OF_STOCK")}
            >
              Out of Stock ({rules.filter((r) => r.stock_status === "OUT OF STOCK").length})
            </button>
          </div>

          <div className="card">
            {loading ? (
              <div className="loading-state">Loading reorder rules...</div>
            ) : filteredRules.length === 0 ? (
              <div className="empty-state">No reorder rules found matching criteria.</div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Category</th>
                      <th>Current Stock</th>
                      <th>Min Stock</th>
                      <th>Reorder Qty</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRules.map((rule) => (
                      <tr key={rule.id}>
                        <td>
                          <strong style={{ color: "#0f172a" }}>{rule.product_name}</strong>
                        </td>
                        <td><code>{rule.sku}</code></td>
                        <td>{rule.category_name}</td>
                        <td>
                          <strong style={{ color: parseFloat(rule.current_stock) <= parseFloat(rule.minimum_stock) ? "#ef4444" : "#0f172a" }}>
                            {rule.current_stock}
                          </strong> {rule.unit_of_measure}
                        </td>
                        <td>{rule.minimum_stock}</td>
                        <td>{rule.reorder_quantity}</td>
                        <td>{getStatusBadge(rule.stock_status)}</td>
                        <td>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              className="btn btn-outline"
                              style={{ padding: "4px 8px", fontSize: "12px" }}
                              onClick={() => {
                                setEditingRule(rule);
                                setShowForm(true);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-outline"
                              style={{ padding: "4px 8px", fontSize: "12px", color: "#ef4444", borderColor: "#fca5a5" }}
                              onClick={() => handleDelete(rule.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ReorderRulesComponent;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../services/authService";

const SettingsComponent = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    defaultWarehouse: "Main Warehouse",
    autoValidateReceipts: false,
    lowStockThresholdDefault: 10,
    notifyEmail: true,
    currencySymbol: "$",
    dateFormat: "YYYY-MM-DD",
  });
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header" style={{ marginBottom: "20px" }}>
        <div>
          <h1 className="dashboard-title">System Settings</h1>
          <p className="dashboard-subtitle">Configure warehouse operations and application defaults</p>
        </div>
        <button className="btn btn-outline" style={{ color: "#ef4444", borderColor: "#fca5a5" }} onClick={handleLogout}>
          Logout
        </button>
      </div>

      {saved && (
        <div style={{ padding: "12px 16px", background: "#dcfce7", color: "#15803d", borderRadius: "6px", marginBottom: "20px", fontWeight: "500" }}>
          ✓ Settings saved successfully!
        </div>
      )}

      <form onSubmit={handleSave}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Warehouse Operational Settings</h3>
            </div>
            <div className="card-body">
              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label className="form-label" style={{ display: "block", marginBottom: "6px" }}>
                  Default Receiving Warehouse
                </label>
                <input
                  type="text"
                  name="defaultWarehouse"
                  className="form-control"
                  value={settings.defaultWarehouse}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label className="form-label" style={{ display: "block", marginBottom: "6px" }}>
                  Global Low-Stock Threshold
                </label>
                <input
                  type="number"
                  name="lowStockThresholdDefault"
                  className="form-control"
                  value={settings.lowStockThresholdDefault}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group" style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
                <input
                  type="checkbox"
                  id="autoValidateReceipts"
                  name="autoValidateReceipts"
                  checked={settings.autoValidateReceipts}
                  onChange={handleChange}
                  style={{ width: "18px", height: "18px" }}
                />
                <label htmlFor="autoValidateReceipts" className="form-label" style={{ margin: 0, cursor: "pointer" }}>
                  Auto-validate new incoming receipts upon creation
                </label>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Application Preferences</h3>
            </div>
            <div className="card-body">
              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label className="form-label" style={{ display: "block", marginBottom: "6px" }}>
                  Display Currency Symbol
                </label>
                <input
                  type="text"
                  name="currencySymbol"
                  className="form-control"
                  value={settings.currencySymbol}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label className="form-label" style={{ display: "block", marginBottom: "6px" }}>
                  Date Display Format
                </label>
                <select
                  name="dateFormat"
                  className="form-control"
                  value={settings.dateFormat}
                  onChange={handleChange}
                >
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
                <input
                  type="checkbox"
                  id="notifyEmail"
                  name="notifyEmail"
                  checked={settings.notifyEmail}
                  onChange={handleChange}
                  style={{ width: "18px", height: "18px" }}
                />
                <label htmlFor="notifyEmail" className="form-label" style={{ margin: 0, cursor: "pointer" }}>
                  Send email notifications for out-of-stock items
                </label>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
          <button type="submit" className="btn btn-primary" style={{ padding: "10px 24px" }}>
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsComponent;

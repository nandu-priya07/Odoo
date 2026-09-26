import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logoutUser } from "../../services/authService";

const ProfileComponent = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    } else {
      setUser({
        name: "Admin User",
        email: "admin@stocksense.com",
        role: "System Administrator",
      });
    }
  }, []);

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header" style={{ marginBottom: "20px" }}>
        <div>
          <h1 className="dashboard-title">User Profile</h1>
          <p className="dashboard-subtitle">Manage your personal details and account credentials</p>
        </div>
        <button className="btn btn-primary" style={{ background: "#ef4444", borderColor: "#ef4444" }} onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" }}>
        <div className="card" style={{ textAlign: "center", padding: "32px 20px" }}>
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "#3b82f6",
              color: "#fff",
              fontSize: "32px",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px auto",
              boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <h3 style={{ margin: "0 0 4px 0", fontSize: "18px", color: "#0f172a" }}>{user?.name || "User"}</h3>
          <p style={{ margin: "0 0 16px 0", color: "#64748b", fontSize: "14px" }}>{user?.email || "user@example.com"}</p>
          <span className="badge badge-info">{user?.role || "Inventory Staff"}</span>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Account Details</h3>
          </div>
          <div className="card-body">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
              <div>
                <label className="form-label" style={{ color: "#64748b", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Full Name
                </label>
                <div style={{ fontSize: "15px", fontWeight: "600", color: "#0f172a", marginTop: "4px" }}>
                  {user?.name || "-"}
                </div>
              </div>
              <div>
                <label className="form-label" style={{ color: "#64748b", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Email Address
                </label>
                <div style={{ fontSize: "15px", fontWeight: "600", color: "#0f172a", marginTop: "4px" }}>
                  {user?.email || "-"}
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
              <div>
                <label className="form-label" style={{ color: "#64748b", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Assigned Role
                </label>
                <div style={{ fontSize: "15px", fontWeight: "600", color: "#0f172a", marginTop: "4px" }}>
                  {user?.role || "Inventory Specialist"}
                </div>
              </div>
              <div>
                <label className="form-label" style={{ color: "#64748b", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Account Status
                </label>
                <div style={{ marginTop: "4px" }}>
                  <span className="badge badge-success">ACTIVE</span>
                </div>
              </div>
            </div>

            <hr style={{ border: 0, borderTop: "1px solid #e2e8f0", margin: "20px 0" }} />

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button className="btn btn-outline" onClick={handleLogout}>
                Sign Out of Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileComponent;

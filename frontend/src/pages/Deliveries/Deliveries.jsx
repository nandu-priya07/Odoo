import React from "react";
import NewDeliveryComponent from "../../components/Dashboard/NewDeliveryComponent";

const Deliveries = () => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header" style={{ marginBottom: "20px" }}>
        <div>
          <h1 className="dashboard-title">Deliveries & Outgoing Stock</h1>
          <p className="dashboard-subtitle">Create and fulfill outgoing inventory deliveries to customers</p>
        </div>
      </div>
      <NewDeliveryComponent
        isOpen={true}
        onClose={() => window.history.back()}
        onSuccess={() => window.location.href = "/dashboard"}
      />
    </div>
  );
};

export default Deliveries;

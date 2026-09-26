const API_BASE_URL = "http://localhost:5000/api";

/**
 * Creates a new outgoing delivery order (status: DRAFT)
 * @param {Object} deliveryData
 * @param {string} deliveryData.customerName
 * @param {string} deliveryData.warehouseId
 * @param {Array<{productId: string, locationId: string, quantity: number}>} deliveryData.items
 */
export const createDelivery = async (deliveryData) => {
  const response = await fetch(`${API_BASE_URL}/deliveries`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(deliveryData),
  });

  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || "Failed to create delivery");
  }

  return json;
};

export default {
  createDelivery,
};

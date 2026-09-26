import bcrypt from "bcrypt";
import { pool, createTables } from "../config/database.js";

const RECORD_COUNT = 50;

const seedData = async () => {
  try {
    console.log("🚀 Starting StockSense database seeding...");
    await createTables();

    /* ============================================================
       1. USERS - 50
       ============================================================ */

    console.log("🌱 Seeding Users...");

    const hashedPassword = await bcrypt.hash("password123", 10);

    const users = [];

    for (let i = 1; i <= RECORD_COUNT; i++) {
      const roles = [
        "admin",
        "warehouse_staff",
        "inventory_manager",
      ];

      const role = roles[(i - 1) % roles.length];

      const result = await pool.query(
        `
        INSERT INTO users
          (name, email, password, role)
        VALUES
          ($1, $2, $3, $4)
        ON CONFLICT (email)
        DO UPDATE SET
          name = EXCLUDED.name,
          password = EXCLUDED.password,
          role = EXCLUDED.role
        RETURNING id, name, email, role
        `,
        [
          `StockSense User ${i}`,
          `user${i}@stocksense.com`,
          hashedPassword,
          role,
        ]
      );

      users.push(result.rows[0]);
    }

    console.log(`✅ Users: ${users.length}`);


    /* ============================================================
       2. CATEGORIES - 50
       ============================================================ */

    console.log("🌱 Seeding Categories...");

    const categories = [];

    for (let i = 1; i <= RECORD_COUNT; i++) {
      const result = await pool.query(
        `
        INSERT INTO categories
          (name, description)
        VALUES
          ($1, $2)
        ON CONFLICT (name)
        DO UPDATE SET
          description = EXCLUDED.description
        RETURNING id, name
        `,
        [
          `Product Category ${i}`,
          `StockSense product category ${i}`,
        ]
      );

      categories.push(result.rows[0]);
    }

    console.log(`✅ Categories: ${categories.length}`);


    /* ============================================================
       3. WAREHOUSES - 50
       ============================================================ */

    console.log("🌱 Seeding Warehouses...");

    const warehouses = [];

    for (let i = 1; i <= RECORD_COUNT; i++) {
      const result = await pool.query(
        `
        INSERT INTO warehouses
          (name, address)
        VALUES
          ($1, $2)
        RETURNING id, name
        `,
        [
          `Warehouse ${i}`,
          `${100 + i} Industrial Road, Zone ${i}, City`,
        ]
      );

      warehouses.push(result.rows[0]);
    }

    console.log(`✅ Warehouses: ${warehouses.length}`);


    /* ============================================================
       4. LOCATIONS - 50
       ============================================================ */

    console.log("🌱 Seeding Locations...");

    const locations = [];

    for (let i = 1; i <= RECORD_COUNT; i++) {
      const warehouse = warehouses[(i - 1) % warehouses.length];

      const result = await pool.query(
        `
        INSERT INTO locations
          (warehouse_id, name)
        VALUES
          ($1, $2)
        RETURNING id, name, warehouse_id
        `,
        [
          warehouse.id,
          `Rack ${String.fromCharCode(65 + ((i - 1) % 26))} - Shelf ${i}`,
        ]
      );

      locations.push(result.rows[0]);
    }

    console.log(`✅ Locations: ${locations.length}`);


    /* ============================================================
       5. SUPPLIERS - 50
       ============================================================ */

    console.log("🌱 Seeding Suppliers...");

    const suppliers = [];

    for (let i = 1; i <= RECORD_COUNT; i++) {
      const result = await pool.query(
        `
        INSERT INTO suppliers
          (name, phone, email, address)
        VALUES
          ($1, $2, $3, $4)
        RETURNING id, name
        `,
        [
          `Supplier Company ${i}`,
          `+91-90000-${String(i).padStart(5, "0")}`,
          `supplier${i}@example.com`,
          `${i} Supplier Street, Chennai`,
        ]
      );

      suppliers.push(result.rows[0]);
    }

    console.log(`✅ Suppliers: ${suppliers.length}`);


    /* ============================================================
       6. PRODUCTS - 50
       ============================================================ */

    console.log("🌱 Seeding Products...");

    const products = [];

    for (let i = 1; i <= RECORD_COUNT; i++) {
      const category = categories[(i - 1) % categories.length];

      const result = await pool.query(
        `
        INSERT INTO products
          (
            name,
            sku,
            category_id,
            unit_of_measure,
            initial_stock
          )
        VALUES
          ($1, $2, $3, $4, $5)
        ON CONFLICT (sku)
        DO UPDATE SET
          name = EXCLUDED.name,
          category_id = EXCLUDED.category_id,
          unit_of_measure = EXCLUDED.unit_of_measure,
          initial_stock = EXCLUDED.initial_stock
        RETURNING id, name, sku
        `,
        [
          `Stock Product ${i}`,
          `SKU-${String(i).padStart(5, "0")}`,
          category.id,
          i % 3 === 0 ? "kg" : "pcs",
          100 + i * 10,
        ]
      );

      products.push(result.rows[0]);
    }

    console.log(`✅ Products: ${products.length}`);


    /* ============================================================
       7. STOCK - 50
       ============================================================ */

    console.log("🌱 Seeding Stock...");

    const stockRecords = [];

    for (let i = 0; i < RECORD_COUNT; i++) {
      const product = products[i];
      const location = locations[i];

      const result = await pool.query(
        `
        INSERT INTO stock
          (product_id, location_id, quantity)
        VALUES
          ($1, $2, $3)
        ON CONFLICT (product_id, location_id)
        DO UPDATE SET
          quantity = EXCLUDED.quantity
        RETURNING id, product_id, location_id, quantity
        `,
        [
          product.id,
          location.id,
          50 + i * 5,
        ]
      );

      stockRecords.push(result.rows[0]);
    }

    console.log(`✅ Stock records: ${stockRecords.length}`);


    /* ============================================================
       8. REORDER RULES - 50
       ============================================================ */

    console.log("🌱 Seeding Reorder Rules...");

    for (let i = 0; i < RECORD_COUNT; i++) {
      const product = products[i];

      await pool.query(
        `
        INSERT INTO reorder_rules
          (
            product_id,
            minimum_stock,
            reorder_quantity
          )
        VALUES
          ($1, $2, $3)
        ON CONFLICT (product_id)
        DO UPDATE SET
          minimum_stock = EXCLUDED.minimum_stock,
          reorder_quantity = EXCLUDED.reorder_quantity
        `,
        [
          product.id,
          20 + i,
          100 + i * 10,
        ]
      );
    }

    console.log(`✅ Reorder rules: ${RECORD_COUNT}`);


    /* ============================================================
       9. RECEIPTS - 50
       ============================================================ */

    console.log("🌱 Seeding Receipts...");

    const receipts = [];

    const receiptStatuses = [
      "DRAFT",
      "WAITING",
      "READY",
      "DONE",
      "CANCELED",
    ];

    for (let i = 1; i <= RECORD_COUNT; i++) {
      const supplier = suppliers[(i - 1) % suppliers.length];
      const warehouse = warehouses[(i - 1) % warehouses.length];
      const user = users[(i - 1) % users.length];

      const result = await pool.query(
        `
        INSERT INTO receipts
          (
            receipt_number,
            supplier_id,
            warehouse_id,
            status,
            created_by
          )
        VALUES
          ($1, $2, $3, $4, $5)
        RETURNING *
        `,
        [
          `REC-${String(i).padStart(5, "0")}`,
          supplier.id,
          warehouse.id,
          receiptStatuses[(i - 1) % receiptStatuses.length],
          user.id,
        ]
      );

      receipts.push(result.rows[0]);
    }

    console.log(`✅ Receipts: ${receipts.length}`);


    /* ============================================================
       10. RECEIPT ITEMS - 50
       ============================================================ */

    console.log("🌱 Seeding Receipt Items...");

    for (let i = 0; i < RECORD_COUNT; i++) {
      const receipt = receipts[i];
      const product = products[i];
      const location = locations[i];

      await pool.query(
        `
        INSERT INTO receipt_items
          (
            receipt_id,
            product_id,
            location_id,
            quantity
          )
        VALUES
          ($1, $2, $3, $4)
        `,
        [
          receipt.id,
          product.id,
          location.id,
          10 + i,
        ]
      );
    }

    console.log(`✅ Receipt items: ${RECORD_COUNT}`);


    /* ============================================================
       11. DELIVERIES - 50
       ============================================================ */

    console.log("🌱 Seeding Deliveries...");

    const deliveries = [];

    for (let i = 1; i <= RECORD_COUNT; i++) {
      const warehouse = warehouses[(i - 1) % warehouses.length];
      const user = users[(i - 1) % users.length];

      const result = await pool.query(
        `
        INSERT INTO deliveries
          (
            delivery_number,
            customer_name,
            warehouse_id,
            status,
            created_by
          )
        VALUES
          ($1, $2, $3, $4, $5)
        RETURNING *
        `,
        [
          `DEL-${String(i).padStart(5, "0")}`,
          `Customer ${i}`,
          warehouse.id,
          receiptStatuses[(i - 1) % receiptStatuses.length],
          user.id,
        ]
      );

      deliveries.push(result.rows[0]);
    }

    console.log(`✅ Deliveries: ${deliveries.length}`);


    /* ============================================================
       12. DELIVERY ITEMS - 50
       ============================================================ */

    console.log("🌱 Seeding Delivery Items...");

    for (let i = 0; i < RECORD_COUNT; i++) {
      const delivery = deliveries[i];
      const product = products[i];
      const location = locations[i];

      await pool.query(
        `
        INSERT INTO delivery_items
          (
            delivery_id,
            product_id,
            location_id,
            quantity
          )
        VALUES
          ($1, $2, $3, $4)
        `,
        [
          delivery.id,
          product.id,
          location.id,
          5 + i,
        ]
      );
    }

    console.log(`✅ Delivery items: ${RECORD_COUNT}`);


    /* ============================================================
       13. INTERNAL TRANSFERS - 50
       ============================================================ */

    console.log("🌱 Seeding Internal Transfers...");

    const transfers = [];

    for (let i = 1; i <= RECORD_COUNT; i++) {
      let fromLocation = locations[(i - 1) % locations.length];
      let toLocation = locations[i % locations.length];

      if (fromLocation.id === toLocation.id) {
        toLocation = locations[(i + 1) % locations.length];
      }

      const user = users[(i - 1) % users.length];

      const result = await pool.query(
        `
        INSERT INTO internal_transfers
          (
            transfer_number,
            from_location_id,
            to_location_id,
            status,
            created_by
          )
        VALUES
          ($1, $2, $3, $4, $5)
        RETURNING *
        `,
        [
          `TRF-${String(i).padStart(5, "0")}`,
          fromLocation.id,
          toLocation.id,
          receiptStatuses[(i - 1) % receiptStatuses.length],
          user.id,
        ]
      );

      transfers.push(result.rows[0]);
    }

    console.log(`✅ Internal transfers: ${transfers.length}`);


    /* ============================================================
       14. TRANSFER ITEMS - 50
       ============================================================ */

    console.log("🌱 Seeding Transfer Items...");

    for (let i = 0; i < RECORD_COUNT; i++) {
      const transfer = transfers[i];
      const product = products[i];

      await pool.query(
        `
        INSERT INTO transfer_items
          (
            transfer_id,
            product_id,
            quantity
          )
        VALUES
          ($1, $2, $3)
        `,
        [
          transfer.id,
          product.id,
          3 + i,
        ]
      );
    }

    console.log(`✅ Transfer items: ${RECORD_COUNT}`);


    /* ============================================================
       15. STOCK ADJUSTMENTS - 50
       ============================================================ */

    console.log("🌱 Seeding Stock Adjustments...");

    const adjustments = [];

    for (let i = 1; i <= RECORD_COUNT; i++) {
      const location = locations[(i - 1) % locations.length];
      const user = users[(i - 1) % users.length];

      const result = await pool.query(
        `
        INSERT INTO stock_adjustments
          (
            adjustment_number,
            location_id,
            reason,
            status,
            created_by
          )
        VALUES
          ($1, $2, $3, $4, $5)
        RETURNING *
        `,
        [
          `ADJ-${String(i).padStart(5, "0")}`,
          location.id,
          i % 2 === 0
            ? "Physical stock count"
            : "Damaged stock correction",
          receiptStatuses[(i - 1) % receiptStatuses.length],
          user.id,
        ]
      );

      adjustments.push(result.rows[0]);
    }

    console.log(`✅ Stock adjustments: ${adjustments.length}`);


    /* ============================================================
       16. STOCK ADJUSTMENT ITEMS - 50
       ============================================================ */

    console.log("🌱 Seeding Stock Adjustment Items...");

    for (let i = 0; i < RECORD_COUNT; i++) {
      const adjustment = adjustments[i];
      const product = products[i];

      const systemQuantity = 100 + i;
      const countedQuantity =
        i % 3 === 0
          ? systemQuantity - 3
          : systemQuantity + 2;

      const difference =
        countedQuantity - systemQuantity;

      await pool.query(
        `
        INSERT INTO stock_adjustment_items
          (
            adjustment_id,
            product_id,
            system_quantity,
            counted_quantity,
            difference
          )
        VALUES
          ($1, $2, $3, $4, $5)
        `,
        [
          adjustment.id,
          product.id,
          systemQuantity,
          countedQuantity,
          difference,
        ]
      );
    }

    console.log(
      `✅ Stock adjustment items: ${RECORD_COUNT}`
    );


    /* ============================================================
       17. STOCK LEDGER - 50
       ============================================================ */

    console.log("🌱 Seeding Stock Ledger...");

    const transactionTypes = [
      "RECEIPT",
      "DELIVERY",
      "TRANSFER_IN",
      "TRANSFER_OUT",
      "ADJUSTMENT",
    ];

    for (let i = 0; i < RECORD_COUNT; i++) {
      const product = products[i];
      const location = locations[i];
      const user = users[i % users.length];

      const quantityChange =
        i % 2 === 0
          ? 20 + i
          : -(5 + i);

      const quantityAfter =
        100 + quantityChange;

      await pool.query(
        `
        INSERT INTO stock_ledger
          (
            product_id,
            location_id,
            transaction_type,
            reference_id,
            quantity_change,
            quantity_after,
            created_by
          )
        VALUES
          ($1, $2, $3, $4, $5, $6, $7)
        `,
        [
          product.id,
          location.id,
          transactionTypes[
            i % transactionTypes.length
          ],
          receipts[i].id,
          quantityChange,
          quantityAfter,
          user.id,
        ]
      );
    }

    console.log(`✅ Stock ledger: ${RECORD_COUNT}`);


    /* ============================================================
       18. OTP CODES - 50
       ============================================================ */

    console.log("🌱 Seeding OTP Codes...");

    for (let i = 0; i < RECORD_COUNT; i++) {
      const user = users[i];

      const otp = String(100000 + i);

      await pool.query(
        `
        INSERT INTO otp_codes
          (
            user_id,
            otp,
            expires_at,
            used
          )
        VALUES
          (
            $1,
            $2,
            CURRENT_TIMESTAMP + INTERVAL '10 minutes',
            $3
          )
        `,
        [
          user.id,
          otp,
          i % 3 === 0,
        ]
      );
    }

    console.log(`✅ OTP codes: ${RECORD_COUNT}`);


    /* ============================================================
       COMPLETE
       ============================================================ */

    console.log("\n========================================");
    console.log("🎉 DATABASE SEEDING COMPLETED");
    console.log("========================================");
    console.log(`Users              : ${RECORD_COUNT}`);
    console.log(`Categories         : ${RECORD_COUNT}`);
    console.log(`Warehouses         : ${RECORD_COUNT}`);
    console.log(`Locations          : ${RECORD_COUNT}`);
    console.log(`Suppliers          : ${RECORD_COUNT}`);
    console.log(`Products           : ${RECORD_COUNT}`);
    console.log(`Stock              : ${RECORD_COUNT}`);
    console.log(`Reorder Rules      : ${RECORD_COUNT}`);
    console.log(`Receipts           : ${RECORD_COUNT}`);
    console.log(`Receipt Items      : ${RECORD_COUNT}`);
    console.log(`Deliveries         : ${RECORD_COUNT}`);
    console.log(`Delivery Items     : ${RECORD_COUNT}`);
    console.log(`Internal Transfers : ${RECORD_COUNT}`);
    console.log(`Transfer Items     : ${RECORD_COUNT}`);
    console.log(`Adjustments        : ${RECORD_COUNT}`);
    console.log(`Adjustment Items   : ${RECORD_COUNT}`);
    console.log(`Stock Ledger       : ${RECORD_COUNT}`);
    console.log(`OTP Codes          : ${RECORD_COUNT}`);
    console.log("========================================");
  } catch (error) {
    console.error("❌ Database seeding failed:");
    console.error(error);
  } finally {
    await pool.end();
  }
};

seedData();
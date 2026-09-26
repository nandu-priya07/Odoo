import bcrypt from "bcrypt";
import { pool, createTables } from "../config/database.js";

const seedData = async () => {
  try {
    console.log("🚀 Starting database seeding process...");

    // Ensure database tables exist
    await createTables();

    // 1. Seed Users
    console.log("🌱 Seeding Users...");
    const hashedPassword = await bcrypt.hash("password123", 10);

    const userRes = await pool.query(`
      INSERT INTO users (name, email, password, role)
      VALUES 
        ('Admin User', 'admin@stocksense.com', $1, 'admin'),
        ('Warehouse Staff', 'staff@stocksense.com', $1, 'warehouse_staff'),
        ('Inventory Manager', 'manager@stocksense.com', $1, 'inventory_manager')
      ON CONFLICT (email) DO UPDATE 
      SET name = EXCLUDED.name, password = EXCLUDED.password, role = EXCLUDED.role    
      RETURNING id, name, email, role;

    `, [hashedPassword]);

    const users = userRes.rows;
    console.log(`✅ Seeded ${users.length} users.`);

    // 2. Seed Categories
    console.log("🌱 Seeding Categories...");
    const categoryRes = await pool.query(`
      INSERT INTO categories (name, description)
      VALUES 
        ('Electronics', 'Electronic components, microcontrollers, and sensors'),
        ('Raw Materials', 'Unprocessed materials and hardware parts'),
        ('Packaging', 'Boxes, bubble wrap, tape, and packing supplies')
      ON CONFLICT (name) DO UPDATE 
      SET description = EXCLUDED.description
      RETURNING id, name;
    `);

    const categories = categoryRes.rows;
    const electronicsCat = categories.find((c) => c.name === "Electronics");
    const packagingCat = categories.find((c) => c.name === "Packaging");
    console.log(`✅ Seeded ${categories.length} categories.`);

    // 3. Seed Warehouses
    console.log("🌱 Seeding Warehouses...");
    const warehouseRes = await pool.query(`
      INSERT INTO warehouses (name, address)
      VALUES 
        ('Main Warehouse', '100 Industrial Parkway, Zone A, Cityville'),
        ('Secondary Storage', '45 Logistics Blvd, Hub East, Cityville')
      RETURNING id, name;
    `);

    const warehouses = warehouseRes.rows;
    const mainWarehouse = warehouses[0];
    console.log(`✅ Seeded ${warehouses.length} warehouses.`);

    // 4. Seed Locations
    console.log("🌱 Seeding Locations...");
    const locationRes = await pool.query(`
      INSERT INTO locations (warehouse_id, name)
      VALUES 
        ($1, 'Rack A - Shelf 1'),
        ($1, 'Rack B - Shelf 3'),
        ($1, 'Pallet Storage Area 2')
      RETURNING id, name;
    `, [mainWarehouse.id]);

    const locations = locationRes.rows;
    const rackA = locations[0];
    const rackB = locations[1];
    console.log(`✅ Seeded ${locations.length} locations.`);

    // 5. Seed Suppliers
    console.log("🌱 Seeding Suppliers...");
    const supplierRes = await pool.query(`
      INSERT INTO suppliers (name, phone, email, address)
      VALUES 
        ('Global Component Tech', '+1-555-0192', 'sales@globalcomp.com', '12 Tech Park, Silicon Valley'),
        ('Apex Packaging Solutions', '+1-555-0144', 'orders@apexpack.com', '88 Factory Lane, Industry City')
      RETURNING id, name;
    `);

    const suppliers = supplierRes.rows;
    console.log(`✅ Seeded ${suppliers.length} suppliers.`);

    // 6. Seed Products
    console.log("🌱 Seeding Products...");
    const productRes = await pool.query(`
      INSERT INTO products (name, sku, category_id, unit_of_measure, initial_stock)
      VALUES 
        ('ESP32 Microcontroller Board', 'SKU-ELEC-001', $1, 'pcs', 150),
        ('Temperature & Humidity Sensor Module', 'SKU-ELEC-002', $1, 'pcs', 300),
        ('Heavy Duty Shipping Box 12x12x12', 'SKU-PACK-001', $2, 'pcs', 500)
      ON CONFLICT (sku) DO UPDATE 
      SET name = EXCLUDED.name, initial_stock = EXCLUDED.initial_stock
      RETURNING id, name, sku;
    `, [electronicsCat?.id, packagingCat?.id]);

    const products = productRes.rows;
    const esp32Product = products[0];
    const sensorProduct = products[1];
    console.log(`✅ Seeded ${products.length} products.`);

    // 7. Seed Stock
    console.log("🌱 Seeding Stock...");
    if (esp32Product && sensorProduct && rackA && rackB) {
      await pool.query(`
        INSERT INTO stock (product_id, location_id, quantity)
        VALUES 
          ($1, $3, 100),
          ($2, $4, 250)
        ON CONFLICT (product_id, location_id) DO UPDATE 
        SET quantity = EXCLUDED.quantity;
      `, [esp32Product.id, sensorProduct.id, rackA.id, rackB.id]);
      console.log("✅ Seeded stock records.");
    }

    // 8. Seed Reorder Rules
    console.log("🌱 Seeding Reorder Rules...");
    if (esp32Product && sensorProduct) {
      await pool.query(`
        INSERT INTO reorder_rules (product_id, minimum_stock, reorder_quantity)
        VALUES 
          ($1, 20, 100),
          ($2, 50, 200)
        ON CONFLICT (product_id) DO UPDATE 
        SET minimum_stock = EXCLUDED.minimum_stock, reorder_quantity = EXCLUDED.reorder_quantity;
      `, [esp32Product.id, sensorProduct.id]);
      console.log("✅ Seeded reorder rules.");
    }

    console.log("\n🎉 Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    await pool.end();
  }
};

seedData();

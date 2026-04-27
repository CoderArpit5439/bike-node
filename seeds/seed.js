require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

const schemaPath = path.join(__dirname, "..", "sql", "schema.sql");

const seed = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true
  });

  try {
    const schema = fs.readFileSync(schemaPath, "utf8");
    await connection.query(schema);
    await connection.query(`USE ${process.env.DB_NAME}`);

    const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || "Admin@123", 10);
    await connection.query(
      `INSERT INTO admins (name, email, password, role, status)
       VALUES (?, ?, ?, 'admin', 'active')
       ON DUPLICATE KEY UPDATE name = VALUES(name), password = VALUES(password)`,
      [process.env.ADMIN_NAME || "BikeXpert Admin", process.env.ADMIN_EMAIL || "admin@bikexpert.local", adminPassword]
    );

    const scsoPassword = await bcrypt.hash("Owner@123", 10);
    const [scsoResult] = await connection.query(
      `INSERT INTO scso_users (name, email, phone, password, shop_name, shop_address, whatsapp_number, role, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'scso', 'active')
       ON DUPLICATE KEY UPDATE phone = VALUES(phone), shop_name = VALUES(shop_name), shop_address = VALUES(shop_address)`,
      [
        "Demo Shop Owner",
        "owner@bikexpert.local",
        "9876543210",
        scsoPassword,
        "Demo Bike Care",
        "MG Road, Bengaluru",
        "9876543210"
      ]
    );

    const [ownerRows] = await connection.query("SELECT id FROM scso_users WHERE email = ? LIMIT 1", [
      "owner@bikexpert.local"
    ]);
    const ownerId = ownerRows[0].id;

    await connection.query(
      `INSERT INTO settings (scope_type, scope_id, setting_key, setting_value)
       VALUES ('global', NULL, 'map_iframe_url', ?)
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
      [process.env.DEFAULT_MAP_IFRAME || "https://www.google.com/maps?q=Delhi%20India&z=12&output=embed"]
    );

    await connection.query(
      `INSERT INTO settings (scope_type, scope_id, setting_key, setting_value)
       VALUES ('scso', ?, 'shop_address', ?),
              ('scso', ?, 'shop_phone', ?),
              ('scso', ?, 'map_iframe_url', ?)
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
      [
        ownerId,
        "MG Road, Bengaluru",
        ownerId,
        "9876543210",
        ownerId,
        process.env.DEFAULT_MAP_IFRAME || "https://www.google.com/maps?q=Delhi%20India&z=12&output=embed"
      ]
    );

    const [customerRows] = await connection.query("SELECT id FROM customers WHERE phone_number = ? LIMIT 1", [
      "9999999999"
    ]);

    let customerId = customerRows[0]?.id;
    if (!customerId) {
      const [customerResult] = await connection.query(
        `INSERT INTO customers (scso_user_id, full_name, phone_number, whatsapp_number, address, last_service_date, notes)
         VALUES (?, ?, ?, ?, ?, CURDATE(), ?)`,
        [ownerId, "Rahul Sharma", "9999999999", "9999999999", "Indiranagar, Bengaluru", "Regular customer"]
      );
      customerId = customerResult.insertId;

      await connection.query(
        "INSERT INTO bikes (customer_id, bike_model, bike_number, is_primary) VALUES (?, ?, ?, 1)",
        [customerId, "Honda Shine", "KA01AB1234"]
      );
      await connection.query("INSERT INTO reward_wallets (customer_id, current_balance) VALUES (?, 120)", [customerId]);
    }

    const demoServices = [
      ["Oil Change", "Engine oil replacement and check", 450, 20],
      ["Washing", "Foam wash and drying", 150, 5],
      ["General Service", "Complete service and inspection", 1200, 60],
      ["Brake Check", "Brake wire and pad inspection", 300, 15]
    ];

    for (const [serviceName, description, price, rewardPoints] of demoServices) {
      await connection.query(
        `INSERT INTO services (scso_user_id, service_name, description, price, reward_points, status)
         SELECT ?, ?, ?, ?, ?, 'active'
         WHERE NOT EXISTS (
           SELECT 1 FROM services WHERE scso_user_id = ? AND service_name = ?
         )`,
        [ownerId, serviceName, description, price, rewardPoints, ownerId, serviceName]
      );
    }

    console.log("Seed completed successfully.");
    console.log("Admin:", process.env.ADMIN_EMAIL || "admin@bikexpert.local", "/", process.env.ADMIN_PASSWORD || "Admin@123");
    console.log("SCSO:", "owner@bikexpert.local / Owner@123");
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
};

seed();

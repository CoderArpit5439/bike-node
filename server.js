require("dotenv").config();
const app = require("./app");
const { testConnection } = require("./config/db");
const { getEnvValue } = require("./config/env");

const PORT = Number(getEnvValue("PORT", 5000));

const startServer = async () => {
  try {
    await testConnection();
    app.listen(PORT, () => {
      console.log(`BikeXpert backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

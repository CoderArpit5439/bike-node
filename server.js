import "dotenv/config";
import app from "./app.js";
import { testConnection } from "./config/database.js";
import { getEnvValue } from "./config/env.config.js";

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

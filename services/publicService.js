const { pool } = require("../config/db");
const { getPublicSettings } = require("./settingService");

const submitContactMessage = async ({ name, email, phone, message }) => {
  await pool.query(
    "INSERT INTO contact_messages (name, email, phone, message) VALUES (?, ?, ?, ?)",
    [name, email, phone || null, message]
  );
};

const getPublicBootstrap = async () => {
  const settings = await getPublicSettings();

  return {
    mapIframeUrl: settings.mapIframeUrl,
    testimonials: [
      {
        id: 1,
        name: "Rakesh Verma",
        shop: "Verma Auto Garage",
        message: "BikeXpert helped us track repeat customers and service reminders without any confusion."
      },
      {
        id: 2,
        name: "Imran Shaikh",
        shop: "Speed Care Motors",
        message: "Billing and wallet points made our service desk much more professional for customers."
      },
      {
        id: 3,
        name: "Amit Patel",
        shop: "Patel Two Wheeler Works",
        message: "We now have customer history, reminders, and WhatsApp bills in one place. It saves us time every day."
      }
    ]
  };
};

module.exports = {
  submitContactMessage,
  getPublicBootstrap
};

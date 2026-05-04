import Admin from "./Admin.model.js";
import Bike from "./Bike.model.js";
import ContactMessage from "./ContactMessage.model.js";
import Customer from "./Customer.model.js";
import Invoice from "./Invoice.model.js";
import Reminder from "./Reminder.model.js";
import RewardTransaction from "./RewardTransaction.model.js";
import RewardWallet from "./RewardWallet.model.js";
import ScsoUser from "./ScsoUser.model.js";
import Service from "./Service.model.js";
import ServiceRecord from "./ServiceRecord.model.js";
import ServiceRecordItem from "./ServiceRecordItem.model.js";
import Setting from "./Setting.model.js";

Admin.hasMany(ScsoUser, { foreignKey: "created_by_admin_id", as: "created_scso_users" });
ScsoUser.belongsTo(Admin, { foreignKey: "created_by_admin_id", as: "created_by_admin" });

ScsoUser.hasMany(Customer, { foreignKey: "scso_user_id", as: "customers" });
Customer.belongsTo(ScsoUser, { foreignKey: "scso_user_id", as: "scso_user" });

Customer.hasMany(Bike, { foreignKey: "customer_id", as: "bikes" });
Customer.hasOne(Bike, { foreignKey: "customer_id", as: "primary_bike", scope: { is_primary: true } });
Bike.belongsTo(Customer, { foreignKey: "customer_id", as: "customer" });

ScsoUser.hasMany(Service, { foreignKey: "scso_user_id", as: "services" });
Service.belongsTo(ScsoUser, { foreignKey: "scso_user_id", as: "scso_user" });

ScsoUser.hasMany(ServiceRecord, { foreignKey: "scso_user_id", as: "service_records" });
Customer.hasMany(ServiceRecord, { foreignKey: "customer_id", as: "service_records" });
Bike.hasMany(ServiceRecord, { foreignKey: "bike_id", as: "service_records" });
ServiceRecord.belongsTo(ScsoUser, { foreignKey: "scso_user_id", as: "scso_user" });
ServiceRecord.belongsTo(Customer, { foreignKey: "customer_id", as: "customer" });
ServiceRecord.belongsTo(Bike, { foreignKey: "bike_id", as: "bike" });

ServiceRecord.hasMany(ServiceRecordItem, { foreignKey: "service_record_id", as: "items" });
ServiceRecordItem.belongsTo(ServiceRecord, { foreignKey: "service_record_id", as: "service_record" });
Service.hasMany(ServiceRecordItem, { foreignKey: "service_id", as: "record_items" });
ServiceRecordItem.belongsTo(Service, { foreignKey: "service_id", as: "service" });

Customer.hasOne(RewardWallet, { foreignKey: "customer_id", as: "reward_wallet" });
RewardWallet.belongsTo(Customer, { foreignKey: "customer_id", as: "customer" });
RewardWallet.hasMany(RewardTransaction, { foreignKey: "wallet_id", as: "transactions" });
RewardTransaction.belongsTo(RewardWallet, { foreignKey: "wallet_id", as: "wallet" });
ServiceRecord.hasMany(RewardTransaction, { foreignKey: "service_record_id", as: "reward_transactions" });
RewardTransaction.belongsTo(ServiceRecord, { foreignKey: "service_record_id", as: "service_record" });

ScsoUser.hasMany(Reminder, { foreignKey: "scso_user_id", as: "reminders" });
Customer.hasMany(Reminder, { foreignKey: "customer_id", as: "reminders" });
ServiceRecord.hasMany(Reminder, { foreignKey: "service_record_id", as: "reminders" });
Reminder.belongsTo(ScsoUser, { foreignKey: "scso_user_id", as: "scso_user" });
Reminder.belongsTo(Customer, { foreignKey: "customer_id", as: "customer" });
Reminder.belongsTo(ServiceRecord, { foreignKey: "service_record_id", as: "service_record" });

ServiceRecord.hasOne(Invoice, { foreignKey: "service_record_id", as: "invoice" });
Invoice.belongsTo(ServiceRecord, { foreignKey: "service_record_id", as: "service_record" });

export {
  Admin,
  Bike,
  ContactMessage,
  Customer,
  Invoice,
  Reminder,
  RewardTransaction,
  RewardWallet,
  ScsoUser,
  Service,
  ServiceRecord,
  ServiceRecordItem,
  Setting
};

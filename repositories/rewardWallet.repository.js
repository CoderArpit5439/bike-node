import { RewardWallet } from "../models/index.js";

const rewardWalletRepository = {
  create(payload, options = {}) {
    return RewardWallet.create(payload, options);
  },

  findByCustomerId(customerId, options = {}) {
    return RewardWallet.findOne({
      where: { customer_id: customerId },
      ...options
    });
  },

  updateBalance(id, currentBalance, options = {}) {
    return RewardWallet.update(
      { current_balance: currentBalance },
      {
        where: { id },
        ...options
      }
    );
  }
};

export default rewardWalletRepository;

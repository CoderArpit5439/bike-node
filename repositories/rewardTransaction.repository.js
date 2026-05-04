import { RewardTransaction } from "../models/index.js";

const rewardTransactionRepository = {
  create(payload, options = {}) {
    return RewardTransaction.create(payload, options);
  },

  findByWalletId(walletId) {
    return RewardTransaction.findAll({
      where: { wallet_id: walletId },
      order: [["created_at", "DESC"]]
    });
  }
};

export default rewardTransactionRepository;

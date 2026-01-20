"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ShopCart extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {}
  }
  ShopCart.init(
    {
      userId: DataTypes.INTEGER,
      productdetailsizeId: DataTypes.INTEGER,
      quantity: DataTypes.INTEGER,
      statusId: DataTypes.STRING,

      orderCode: DataTypes.STRING, // Mã đơn hàng gửi sang VNPAY
      vnp_TransactionNo: DataTypes.STRING, // Mã giao dịch của VNPAY trả về
      paymentDate: DataTypes.DATE, // Ngày giờ thanh toán thành công
    },
    {
      sequelize,
      modelName: "ShopCart",
    },
  );
  return ShopCart;
};

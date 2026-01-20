import db from "../models/index";
const { Op } = require("sequelize");

let addShopCart = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.userId || !data.productdetailsizeId || !data.quantity) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameter !",
        });
      } else {
        let cart = await db.ShopCart.findOne({
          where: {
            userId: data.userId,
            productdetailsizeId: data.productdetailsizeId,
            statusId: 0,
          },
          raw: false,
        });
        if (cart) {
          let res = await db.ProductDetailSize.findOne({
            where: { id: data.productdetailsizeId },
          });
          if (res) {
            let receiptDetail = await db.ReceiptDetail.findAll({
              where: { productDetailSizeId: res.id },
            });
            let orderDetail = await db.OrderDetail.findAll({
              where: { productId: res.id },
            });
            let quantity = 0;
            for (let j = 0; j < receiptDetail.length; j++) {
              quantity = quantity + receiptDetail[j].quantity;
            }
            for (let k = 0; k < orderDetail.length; k++) {
              let order = await db.OrderProduct.findOne({
                where: { id: orderDetail[k].orderId },
              });
              if (order.statusId != "S7") {
                quantity = quantity - orderDetail[k].quantity;
              }
            }
            res.stock = quantity;
          }

          if (data.type === "UPDATE_QUANTITY") {
            if (+data.quantity > res.stock) {
              resolve({
                errCode: 2,
                errMessage: `Chỉ còn ${res.stock} sản phẩm`,
                quantity: res.stock,
              });
            } else {
              cart.quantity = +data.quantity;
              await cart.save();
            }
          } else {
            if (+cart.quantity + +data.quantity > res.stock) {
              resolve({
                errCode: 2,
                errMessage: `Chỉ còn ${res.stock} sản phẩm`,
                quantity: res.stock,
              });
            } else {
              cart.quantity = +cart.quantity + +data.quantity;
              await cart.save();
            }
          }
        } else {
          let res = await db.ProductDetailSize.findOne({
            where: { id: data.productdetailsizeId },
          });
          if (res) {
            let receiptDetail = await db.ReceiptDetail.findAll({
              where: { productDetailSizeId: res.id },
            });
            let orderDetail = await db.OrderDetail.findAll({
              where: { productId: res.id },
            });
            let quantity = 0;
            for (let j = 0; j < receiptDetail.length; j++) {
              quantity = quantity + receiptDetail[j].quantity;
            }
            for (let k = 0; k < orderDetail.length; k++) {
              let order = await db.OrderProduct.findOne({
                where: { id: orderDetail[k].orderId },
              });
              if (order.statusId != "S7") {
                quantity = quantity - orderDetail[k].quantity;
              }
            }
            res.stock = quantity;
          }

          if (data.quantity > res.stock) {
            resolve({
              errCode: 2,
              errMessage: `Chỉ còn ${res.stock} sản phẩm`,
              quantity: res.stock,
            });
          } else {
            await db.ShopCart.create({
              userId: data.userId,
              productdetailsizeId: data.productdetailsizeId,
              quantity: data.quantity,
              statusId: 0,
            });
          }
        }
        resolve({
          errCode: 0,
          errMessage: "ok",
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};
let getAllShopCartByUserId = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!id) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameter !",
        });
      } else {
        let res = await db.ShopCart.findAll({
          where: { userId: id, statusId: 0 },
        });
        for (let i = 0; i < res.length; i++) {
          res[i].productdetailsizeData = await db.ProductDetailSize.findOne({
            where: { id: res[i].productdetailsizeId },
            include: [
              {
                model: db.Allcode,
                as: "sizeData",
                attributes: ["value", "code"],
              },
            ],
            raw: true,
            nest: true,
          });
          res[i].productDetail = await db.ProductDetail.findOne({
            where: { id: res[i].productdetailsizeData.productdetailId },
          });
          res[i].productDetailImage = await db.ProductImage.findAll({
            where: { productdetailId: res[i].productDetail.id },
          });
          if (
            res[i].productDetailImage &&
            res[i].productDetailImage.length > 0
          ) {
            for (let j = 0; j < res[i].productDetailImage.length; j++) {
              res[i].productDetailImage[j].image = new Buffer(
                res[i].productDetailImage[j].image,
                "base64",
              ).toString("binary");
            }
          }
          res[i].productData = await db.Product.findOne({
            where: { id: res[i].productDetail.productId },
          });
        }
        if (res) {
          resolve({
            errCode: 0,
            data: res,
          });
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};
let deleteItemShopCart = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.id) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameter !",
        });
      } else {
        let res = await db.ShopCart.findOne({
          where: { id: data.id, statusId: 0 },
        });
        if (res) {
          await db.ShopCart.destroy({
            where: { id: data.id },
          });
          resolve({
            errCode: 0,
            errMessage: "ok",
          });
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

let updateStatusPayment = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Tìm các item trong giỏ hàng có cùng orderCode và cập nhật trạng thái
      // Giả sử 'S2' là mã trạng thái "Đã thanh toán thành công"
      await db.ShopCart.update(
        {
          statusId: "S2",
          vnp_TransactionNo: data.vnp_TransactionNo,
          paymentDate: new Date(),
        },
        { where: { orderCode: data.orderCode } },
      );
      resolve({ errCode: 0, errMessage: "Update payment status success" });
    } catch (e) {
      reject(e);
    }
  });
};

let getOrderDetailByProductName = (productName) => {
  return new Promise(async (resolve, reject) => {
    try {
      let order = await db.ShopCart.findOne({
        // Tìm đơn hàng mà trong đó tên sản phẩm có chứa từ khóa productName
        where: {
          productName: { [Op.like]: `%${productName}%` },
        },
        order: [["createdAt", "DESC"]], // Lấy đơn mới nhất
        raw: true,
      });
      resolve(order);
    } catch (e) {
      reject(e);
    }
  });
};
module.exports = {
  addShopCart: addShopCart,
  getAllShopCartByUserId: getAllShopCartByUserId,
  deleteItemShopCart: deleteItemShopCart,
  updateStatusPayment: updateStatusPayment,
  getOrderDetailByProductName: getOrderDetailByProductName,
};

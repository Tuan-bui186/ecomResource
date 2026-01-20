import shopCartService from "../services/shopCartService";

let addShopCart = async (req, res) => {
  try {
    let data = await shopCartService.addShopCart(req.body);
    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};
let getAllShopCartByUserId = async (req, res) => {
  try {
    let data = await shopCartService.getAllShopCartByUserId(req.query.id);
    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};
let deleteItemShopCart = async (req, res) => {
  try {
    let data = await shopCartService.deleteItemShopCart(req.body);
    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};

const crypto = require("crypto");
const querystring = require("qs");

// Hàm sắp xếp tham số (Bắt buộc cho bảo mật VNPAY)
function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

let vnpayIpn = async (req, res) => {
  try {
    let vnp_Params = req.query;
    let secureHash = vnp_Params["vnp_SecureHash"];

    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    vnp_Params = sortObject(vnp_Params);
    let secretKey = process.env.VNP_HASHSECRET;
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    if (secureHash === signed) {
      let orderCode = vnp_Params["vnp_TxnRef"];
      let rspCode = vnp_Params["vnp_ResponseCode"];

      if (rspCode === "00") {
        // Giao dịch thành công tại VNPAY
        // Gọi sang service để cập nhật trạng thái trong Database
        await shopCartService.updateStatusPayment({
          orderCode: orderCode,
          vnp_TransactionNo: vnp_Params["vnp_TransactionNo"],
        });
        return res
          .status(200)
          .json({ RspCode: "00", Message: "Confirm Success" });
      } else {
        return res
          .status(200)
          .json({ RspCode: "01", Message: "Payment Failed" });
      }
    } else {
      return res
        .status(200)
        .json({ RspCode: "97", Message: "Invalid Checksum" });
    }
  } catch (e) {
    console.log(e);
    return res.status(200).json({ RspCode: "99", Message: "Unknown Error" });
  }
};

let createPaymentUrl = async (req, res) => {
  try {
    let date = new Date();
    let createDate = moment(date).format("YYYYMMDDHHmmss");

    let tmnCode = process.env.VNP_TMNCODE;
    let secretKey = process.env.VNP_HASHSECRET;
    let vnpUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    let returnUrl = "http://localhost:3000/payment/success"; // Link web của bạn

    let orderId = moment(date).format("DDHHmmss"); // Tạo mã đơn hàng tạm
    let amount = req.body.amount;

    let vnp_Params = {};
    vnp_Params["vnp_Version"] = "2.1.0";
    vnp_Params["vnp_Command"] = "pay";
    vnp_Params["vnp_TmnCode"] = tmnCode;
    vnp_Params["vnp_Locale"] = "vn";
    vnp_Params["vnp_CurrCode"] = "VND";
    vnp_Params["vnp_TxnRef"] = orderId;
    vnp_Params["vnp_OrderInfo"] = "Thanh toan cho ma don hang:" + orderId;
    vnp_Params["vnp_OrderType"] = "other";
    vnp_Params["vnp_Amount"] = amount * 100;
    vnp_Params["vnp_ReturnUrl"] = returnUrl;
    vnp_Params["vnp_IpAddr"] = "127.0.0.1";
    vnp_Params["vnp_CreateDate"] = createDate;

    // --- DÒNG QUAN TRỌNG NHẤT CHO CHƯƠNG 5 ---
    vnp_Params["vnp_IpnUrl"] =
      "https://unvarnished-lyla-unpositive.ngrok-free.dev/api/vnpay_ipn";
    // -----------------------------------------

    vnp_Params = sortObject(vnp_Params);
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
    vnp_Params["vnp_SecureHash"] = signed;

    let finalUrl =
      vnpUrl + "?" + querystring.stringify(vnp_Params, { encode: false });

    return res.status(200).json({ code: "00", data: finalUrl });
  } catch (e) {
    return res.status(200).json({ errCode: -1, message: "Error from server" });
  }
};
let chatbotWebhook = async (req, res) => {
  try {
    // 1. Lấy dữ liệu từ Dialogflow gửi sang
    let intentName = req.body.queryResult.intent.displayName;

    // Đổi tên biến từ orderCode thành productName cho đúng ý nghĩa tìm kiếm
    let rawProductName = req.body.queryResult.parameters.productName;
    let productName = rawProductName ? rawProductName.toString().trim() : null;

    // 2. Kiểm tra đúng Intent tra cứu
    if (intentName === "CheckOrderStatus") {
      if (!productName) {
        return res.json({
          fulfillmentText:
            "Bạn vui lòng cho mình biết tên sản phẩm bạn đã mua để mình kiểm tra nhé!",
        });
      }

      // 3. Gọi hàm tìm kiếm theo tên sản phẩm trong Service
      // Lưu ý: Bạn cần tạo hàm getOrderDetailByProductName trong shopCartService
      let order =
        await shopCartService.getOrderDetailByProductName(productName);

      let speech = "";
      if (order) {
        // Kiểm tra trạng thái dựa trên statusId (S2 là thành công)
        let statusName =
          order.statusId === "S2"
            ? "đã được thanh toán thành công"
            : "đang trong trạng thái chờ thanh toán";

        speech = `🔍 Kết quả: Đơn hàng chứa sản phẩm "${productName}" của bạn hiện ${statusName}. Cảm ơn bạn!`;
      } else {
        speech = `❌ Hệ thống không tìm thấy đơn hàng nào có tên sản phẩm là "${productName}". Bạn kiểm tra lại tên sản phẩm nhé!`;
      }

      // 4. Trả kết quả về cho Chatbot hiển thị
      return res.json({
        fulfillmentText: speech,
        source: "webhook-product-search",
      });
    }
  } catch (e) {
    console.error(">>> Chatbot Error:", e);
    return res.json({
      fulfillmentText:
        "🤖 Xin lỗi, mình đang gặp chút trục trặc khi kết nối dữ liệu. Bạn thử lại sau nhé!",
    });
  }
};

module.exports = {
  addShopCart: addShopCart,
  getAllShopCartByUserId: getAllShopCartByUserId,
  deleteItemShopCart: deleteItemShopCart,
  vnpayIpn: vnpayIpn,
  createPaymentUrl: createPaymentUrl,
  chatbotWebhook: chatbotWebhook,
};

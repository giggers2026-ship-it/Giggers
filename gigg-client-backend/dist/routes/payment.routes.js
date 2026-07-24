"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const payment_controller_1 = require("../controllers/payment.controller");
const router = (0, express_1.Router)();
// Webhook must receive raw body — mount before express.json() parses it
router.post('/webhook', (req, res, next) => {
    (0, payment_controller_1.razorpayWebhook)(req, res).catch(next);
});
router.use(auth_1.requireAuth);
router.post('/order', payment_controller_1.createOrder);
router.post('/verify', payment_controller_1.verifyPayment);
router.get('/history', payment_controller_1.paymentHistory);
router.get('/wallet', payment_controller_1.getWallet);
exports.default = router;
//# sourceMappingURL=payment.routes.js.map
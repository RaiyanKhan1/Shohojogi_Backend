import express from "express";
import checkToken from "../middlewares/checkToken.js";
import checkRole from "../middlewares/checkRole.js";
import {
  initPayment,
  paymentSuccess,
  paymentFail,
  paymentCancel,
  paymentIpn,
} from "../Controller/paymentController.js";

const router = express.Router();

// SSLCommerz posts its callbacks as form data.
router.use(express.urlencoded({ extended: true }));

// Client starts a payment to accept an application.
router.post(
  "/init/:applicationId",
  checkToken,
  checkRole("client"),
  initPayment,
);

// SSLCommerz callbacks (no auth cookie is sent by the gateway).
router.post("/success", paymentSuccess);

router.post("/fail", paymentFail);

router.post("/cancel", paymentCancel);

router.post("/ipn", paymentIpn);

export default router;

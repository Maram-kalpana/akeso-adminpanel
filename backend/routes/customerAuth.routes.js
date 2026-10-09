const express = require("express");

const controller = require(
  "../controllers/customerAuth.controller"
);

const router = express.Router();

router.post(
  "/register",
  controller.register
);

router.post(
  "/set-password",
  controller.setPassword
);

router.post(
  "/login",
  controller.login
);

router.post(
  "/forgot-password",
  controller.forgotPassword
);

router.post(
  "/reset-password",
  controller.resetPassword
);

module.exports = router;
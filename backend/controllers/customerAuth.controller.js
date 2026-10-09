const crypto =
  require("crypto");

const bcrypt =
  require("bcryptjs");

const jwt =
  require("jsonwebtoken");

const Customer =
  require("../models/customer.model");

const {
  sendActivationEmail,
  sendResetPasswordEmail,
} = require("../services/mail.service");


function createRawToken() {
  return crypto
    .randomBytes(32)
    .toString("hex");
}


function hashToken(token) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}


function expiresIn24Hours() {
  return new Date(
    Date.now() +
      24 * 60 * 60 * 1000
  );
}


function signCustomerToken(customer) {
  return jwt.sign(
    {
      id: customer.id,
      email: customer.email,
      type: "customer",
    },

    process.env.CUSTOMER_JWT_SECRET,

    {
      expiresIn:
        process.env
          .CUSTOMER_JWT_EXPIRES_IN ||
        "7d",
    }
  );
}


/* =========================================
   REGISTER
========================================= */

exports.register =
  async (req, res, next) => {

    try {

      const {
        name,
        email,
        phone,
      } = req.body;


      if (
        !name?.trim() ||
        !email?.trim() ||
        !phone?.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Name, email and mobile number are required.",
        });
      }


      const normalizedEmail =
        email.trim().toLowerCase();


      const existing =
        await Customer.findByEmail(
          normalizedEmail
        );


      if (
        existing &&
        existing.status === "active"
      ) {
        return res.status(409).json({
          success: false,
          message:
            "An account already exists with this email. Please login.",
        });
      }


      const rawToken =
        createRawToken();

      const tokenHash =
        hashToken(rawToken);

      const expiresAt =
        expiresIn24Hours();


      let customerId;


      if (existing) {

        await Customer.refreshActivation({
          id: existing.id,
          name: name.trim(),
          phone: phone.trim(),
          tokenHash,
          expiresAt,
        });

        customerId =
          existing.id;

      } else {

        customerId =
          await Customer.createPending({
            name: name.trim(),
            email:
              normalizedEmail,
            phone: phone.trim(),
            tokenHash,
            expiresAt,
          });

      }


      await sendActivationEmail({
        name: name.trim(),
        email: normalizedEmail,
        token: rawToken,
      });


      return res.status(201).json({
        success: true,

        message:
          "Account created successfully. Please check your email to set your password.",

        customerId,
      });

    } catch (error) {
      next(error);
    }
  };


/* =========================================
   SET PASSWORD
========================================= */

exports.setPassword =
  async (req, res, next) => {

    try {

      const {
        token,
        password,
      } = req.body;


      if (!token || !password) {
        return res.status(400).json({
          success: false,
          message:
            "Token and password are required.",
        });
      }


      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message:
            "Password must contain at least 6 characters.",
        });
      }


      const customer =
        await Customer.findByActivationToken(
          hashToken(token)
        );


      if (!customer) {
        return res.status(400).json({
          success: false,
          message:
            "This activation link is invalid or has expired.",
        });
      }


      const passwordHash =
        await bcrypt.hash(
          password,
          12
        );


      await Customer.activate({
        id: customer.id,
        password: passwordHash,
      });


      return res.json({
        success: true,

        message:
          "Password set successfully. You can now login.",
      });

    } catch (error) {
      next(error);
    }
  };


/* =========================================
   LOGIN
========================================= */

exports.login =
  async (req, res, next) => {

    try {

      const {
        email,
        password,
      } = req.body;


      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message:
            "Email and password are required.",
        });
      }


      const customer =
        await Customer.findByEmail(
          email.trim().toLowerCase()
        );


      if (!customer) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid email or password.",
        });
      }


      if (
        customer.status ===
        "pending"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Please activate your account by setting your password from the email we sent you.",
        });
      }


      if (
        customer.status ===
        "blocked"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Your account is currently unavailable.",
        });
      }


      if (!customer.password) {
        return res.status(403).json({
          success: false,
          message:
            "Please set your password first.",
        });
      }


      const valid =
        await bcrypt.compare(
          password,
          customer.password
        );


      if (!valid) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid email or password.",
        });
      }


      const token =
        signCustomerToken(
          customer
        );


      await Customer.updateLastLogin(
        customer.id
      );


      return res.json({
        success: true,

        token,

        user: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
        },
      });

    } catch (error) {
      next(error);
    }
  };


/* =========================================
   FORGOT PASSWORD
========================================= */

exports.forgotPassword =
  async (req, res, next) => {

    try {

      const { email } =
        req.body;


      if (!email?.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Email address is required.",
        });
      }


      const customer =
        await Customer.findByEmail(
          email
            .trim()
            .toLowerCase()
        );


      /*
        Don't reveal whether an
        email exists in database.
      */

      if (
        customer &&
        customer.status === "active"
      ) {

        const rawToken =
          createRawToken();

        await Customer.saveResetToken({
          id: customer.id,

          tokenHash:
            hashToken(rawToken),

          expiresAt:
            expiresIn24Hours(),
        });


        await sendResetPasswordEmail({
          name: customer.name,
          email: customer.email,
          token: rawToken,
        });
      }


      return res.json({
        success: true,

        message:
          "If an account exists with this email, a password reset link has been sent.",
      });

    } catch (error) {
      next(error);
    }
  };


/* =========================================
   RESET PASSWORD
========================================= */

exports.resetPassword =
  async (req, res, next) => {

    try {

      const {
        token,
        password,
      } = req.body;


      if (!token || !password) {
        return res.status(400).json({
          success: false,
          message:
            "Token and password are required.",
        });
      }


      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message:
            "Password must contain at least 6 characters.",
        });
      }


      const customer =
        await Customer.findByResetToken(
          hashToken(token)
        );


      if (!customer) {
        return res.status(400).json({
          success: false,
          message:
            "This password reset link is invalid or has expired.",
        });
      }


      const passwordHash =
        await bcrypt.hash(
          password,
          12
        );


      await Customer.resetPassword({
        id: customer.id,
        password: passwordHash,
      });


      return res.json({
        success: true,

        message:
          "Password reset successfully. Please login with your new password.",
      });

    } catch (error) {
      next(error);
    }
  };
const express = require("express");
const { check, body } = require("express-validator");

const authController = require("../controllers/auth");

const router = express.Router();

router.get("/login", authController.getLogin);

router.get("/signup", authController.getSignup);

router.post(
  "/login",
  body("email").isEmail().withMessage("email is not valid"),
  body("password").isLength({ min: 5 }).withMessage("password too short"),
  authController.postLogin
);

router.post("/signup", authController.postSignup);

router.post("/logout", authController.postLogout);

module.exports = router;

const { body } = require("express-validator");

const nullError = "cannot be empty";
const passwordError = "must contain minimum 8 characters";
const userNameError = "must contain minimum 6 characters";

const signUpValidator = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage(`Username ${nullError}`)
    .isLength({ min: 6 })
    .withMessage(`Username ${userNameError}`),
  body("email")
    .trim()
    .notEmpty()
    .withMessage(`Email ${nullError}`)
    .isEmail()
    .withMessage("Email must be a valid address"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage(`Password ${nullError}`)
    .isLength({ min: 6 })
    .withMessage(`Password ${passwordError}`),
  body("confirmPassword")
    .trim()
    .notEmpty()
    .withMessage(`Confirm password ${nullError}`)
    .custom((value, { req }) => {
      if (value != req.body.password) {
        throw new Error("Passwords must match!");
      }
      return true;
    }),
];

module.exports = signUpValidator;

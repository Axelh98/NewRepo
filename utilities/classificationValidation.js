const { body, validationResult } = require("express-validator");
const utilities = require("./index");
const inventoryModel = require("../models/inventory-model");
const validateClassification = {};

/* ******************************
 *  New Classification Validation Rules
 * ***************************** */
validateClassification.classificationRules = () => {
  return [
    // classificationName is required and must be at least 2 characters long
    body("classificationName")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a valid classification name (minimum 2 characters).")
      .custom(async (classificationName) => {
        const exists = await inventoryModel.checkExistingClassification(classificationName);
        if (exists) {
          throw new Error("Classification already exists. Please choose another name.");
        }
      })
  ];
};

/* ******************************
 * Check data and return errors or continue to add classification
 * ***************************** */
validateClassification.checkClassificationData = async (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav();
      res.render("./inventory/new-classification", {
        title: "Add New Classification",
        nav,
        errors: errors.array(),
        classificationName: req.body.classificationName,
      });
      return;
    }
    next();
  };
  

module.exports = validateClassification;

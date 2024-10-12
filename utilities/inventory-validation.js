const { body, validationResult } = require("express-validator");
const inventoryModel = require("../models/inventory-model");
const validateInventory = {};
const utilities = require("../utilities");

// Reglas de validación para el formulario de nuevo inventario
validateInventory.newInventoryRules = () => {
  return [
    body("classification_id")
      .trim()
      .notEmpty()
      .withMessage("Classification is required."),

    body("inv_make").trim().notEmpty().withMessage("Make is required."),

    body("inv_model").trim().notEmpty().withMessage("Model is required."),

    body("inv_description")
      .trim()
      .notEmpty()
      .withMessage("Description is required."),

    body("inv_image").isURL().withMessage("A valid image URL is required."),

    body("inv_thumbnail").isURL().withMessage("A valid thumbnail URL is required."),

    body("inv_price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number."),

    body("inv_year")
      .isInt({ min: 1900, max: new Date().getFullYear() })
      .withMessage("Year must be a valid number."),

    body("inv_miles")
      .isInt({ min: 0 })
      .withMessage("Miles must be a positive integer."),

    body("inv_color").trim().notEmpty().withMessage("Color is required."),
  ];
};

// Middleware para manejar los errores de validación
validateInventory.checkNewInventoryData = async (req, res, next) => {
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
  } = req.body;
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    const classification = await utilities.buildClassificationList();
    return res.render("inventory/new-inventory", {
      errors: errors.array(),
      title: "Add New Vehicle",
      nav,
      classification_id: classification,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
    });
  }
  next();
};

module.exports = validateInventory;

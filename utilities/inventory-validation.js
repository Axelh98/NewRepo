const { body, validationResult } = require("express-validator");
const inventoryModel = require("../models/inventory-model");
const validateInventory = {};
const utilities = require("../utilities");

// Reglas de validación para el formulario de nuevo inventario
validateInventory.newInventoryRules = () => {
  return [
    body("classification")
      .trim()
      .notEmpty()
      .withMessage("Classification is required."),

    body("make").trim().notEmpty().withMessage("Make is required."),

    body("model").trim().notEmpty().withMessage("Model is required."),

    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is required."),

    body("image").isURL().withMessage("A valid image URL is required."),

    body("thumbnail").isURL().withMessage("A valid thumbnail URL is required."),

    body("price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number."),

    body("year")
      .isInt({ min: 1900, max: new Date().getFullYear() })
      .withMessage("Year must be a valid number."),

    body("miles")
      .isInt({ min: 0 })
      .withMessage("Miles must be a positive integer."),

    body("color").trim().notEmpty().withMessage("Color is required."),
  ];
};

// Middleware para manejar los errores de validación
validateInventory.checkNewInventoryData = async (req, res, next) => {
  const {
    classification,
    make,
    model,
    description,
    image,
    thumbnail,
    price,
    year,
    miles,
    color,
  } = req.body;
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    const classifications = await utilities.buildClassificationList();
    return res.render("inventory/new-inventory", {
      errors: errors.array(),
      title: "Add New Vehicle",
      nav,
      classifications,
      make,
      model,
      description,
      image,
      thumbnail,
      price,
      year,
      miles,
      color,
    });
  }
  next();
};

module.exports = validateInventory;

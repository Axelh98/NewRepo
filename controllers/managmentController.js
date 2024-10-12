const pool = require("../database");
const utilities = require("../utilities");
const inventoryModel = require("../models/inventory-model");
const validateInventory = require("../utilities/inventory-validation");

async function buildManagement(req, res, next) {
  let nav = await utilities.getNav();
  res.render("./inventory/management", {
    title: "Vehicule Management",
    nav,
  });
}

async function showNewClassificationForm(req, res, next) {
  let nav = await utilities.getNav();
  res.render("./inventory/new-classification", {
    title: "Add New classification",
    nav,
    errors: [],
  });
}

const showNewInventoryForm = async (req, res) => {
  let nav = await utilities.getNav();
  const classification_id = await utilities.buildClassificationList(); 
  res.render("inventory/new-inventory", {
    title: "New Inventory",
    nav,
    classification_id: classification_id, 
    errors: req.flash("errors"),
  });
};

// INSERTING DATA ! ! !
// INSERTING DATA ! ! !
// INSERTING DATA ! ! !

const addNewClassification = async (req, res) => {
  const { classificationName } = req.body;

  try {
    await pool.query(
      "INSERT INTO classification (classification_name) VALUES ($1)",
      [classificationName]
    );
    res.redirect("/inv"); // Redirige a la página de inventario o donde necesites
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding new classification"); // Manejo de errores básico
  }
};

const addNewInventory = async (req, res) => {
    const {
      classification_id, // Cambiado aquí
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
  
    try {
      // Aquí asegúrate de que classification_id no esté vacío
      if (!classification_id) {
        req.flash('error', 'Classification is required');
        return res.redirect('/inv/new-inventory'); // Redirigir a la página del formulario
      }
  
      await inventoryModel.addVehicle({
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
      });
  
      req.flash('success', 'Vehicle added successfully');
      res.redirect('/inv');
    } catch (error) {
      console.error("Error adding new vehicle:", error);
      req.flash('error', 'Could not add vehicle');
      res.redirect('/inv');
    }
  };
  
  

module.exports = {
  buildManagement,
  showNewClassificationForm,
  showNewInventoryForm,
  addNewClassification,
  addNewInventory,
};

const pool = require("../database");
const utilities = require("../utilities");
const inventoryModel = require("../models/inventory-model");
const validateInventory = require("../utilities/inventory-validation");

async function buildManagement(req, res, next) {
  try {
    let nav = await utilities.getNav();
    const classificationSelect = await utilities.buildClassificationList();

    const messages = {
      success: req.flash("success"),
      error: req.flash("error"),
    };

    res.render("./inventory/management", {
      title: "Vehicle Management",
      nav,
      classificationSelect,
      messages,
    });
  } catch (error) {
    next(error);
  }
}

async function showNewClassificationForm(req, res, next) {
  let nav = await utilities.getNav();
  res.render("./inventory/new-classification", {
    title: "Add New classification",
    nav,
    user: req.user,
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
    user: req.user,
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
      req.flash("error", "Classification is required");
      return res.redirect("/inv/new-inventory"); // Redirigir a la página del formulario
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

    req.flash("success", "Vehicle added successfully");
    res.redirect("/inv");
  } catch (error) {
    console.error("Error adding new vehicle:", error);
    req.flash("error", "Could not add vehicle");
    res.redirect("/inv");
  }
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
async function getInventoryJSON(req, res, next) {
  const classification_id = parseInt(req.params.classification_id);
  const invData = await inventoryModel.getInventoryByClassificationId(
    classification_id
  );
  if (invData[0].inv_id) {
    return res.json(invData);
  } else {
    next(new Error("No data returned"));
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
async function editInventoryView(req, res, next) {
  const inv_id = parseInt(req.params.inv_id);
  let nav = await utilities.getNav();
  const itemData = await inventoryModel.getVehicleDetail(inv_id);
  const classificationSelect = await utilities.buildClassificationList(
    itemData.classification_id
  );
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id,
  });
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(req, res, next) {
  let nav = await utilities.getNav();
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body;
  const updateResult = await inventoryModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  );

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model;
    req.flash("notice", `The ${itemName} was successfully updated.`);
    res.redirect("/inv/");
  } else {
    const classificationSelect = await utilities.buildClassificationList(
      classification_id
    );
    const itemName = `${inv_make} ${inv_model}`;
    req.flash("notice", "Sorry, the insert failed.");
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect: classificationSelect,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    });
  }
}

// ***************************
// Build and deliver the delete confirmation view
// ***************************
async function buildDeleteConfirmationView(req, res, next) {
  const inv_id = parseInt(req.params.inv_id);
  let nav = await utilities.getNav();
  try {
    const vehicleData = await inventoryModel.getInventoryById(inv_id);
    const name = `${vehicleData.inv_make} ${vehicleData.inv_model}`;

    // Pasar el objeto `vehicle` a la vista
    res.render("inventory/delete-confirm", {
      title: `Delete ${name}`,
      nav,
      errors: null,
      vehicle: vehicleData,
      user: req.user,
    });
  } catch (error) {
    console.error("Error building delete confirmation view:", error);
    next(error);
  }
}

// ***************************
// Process the delete of the vehicle
// ***************************
async function deleteVehicle(req, res, next) {
  const inv_id = parseInt(req.body.inv_id);
  let nav = await utilities.getNav();
  try {
    const deleteResult = await inventoryModel.deleteInventoryById(inv_id);
    if (deleteResult) {
      req.flash("success", "Vehicle successfully deleted.");
      res.redirect("/inv");
    } else {
      req.flash("error", "Failed to delete the vehicle.");
      res.redirect(`/inv/delete/${inv_id}`);
    }
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    req.flash("error", "Error deleting the vehicle.");
    res.redirect(`/inv/delete/${inv_id}`);
  }
}

// ***************************
// Dashboard
// ***************************
async function buildDashboard(req, res, next) {
  let nav = await utilities.getNav();

  try {
    const vehicleCounts = await inventoryModel.getVehicleCountByClassification();
    const totalVehicles = vehicleCounts.reduce((sum, vehicle) => sum + parseInt(vehicle.vehicle_count, 10), 0); 
    const totalClassifications = vehicleCounts.length
    const milesPrices = await inventoryModel.getMilesAndPrices();

    // Pasar el objeto `vehicle` a la vista
    res.render("inventory/dashboard", {
      title: "Inventory Dashboard",
      nav,
      errors: null,
      vehicleCounts,
      totalVehicles,
      totalClassifications,
      milesPrices
    });
  } catch (error) {
    console.error("Error building dashboard:", error);
    res.status(500).send("Error al generar el dashboard.");
  }
}

module.exports = {
  buildManagement,
  showNewClassificationForm,
  showNewInventoryForm,
  addNewClassification,
  addNewInventory,
  getInventoryJSON,
  editInventoryView,
  updateInventory,
  buildDeleteConfirmationView,
  deleteVehicle,
  buildDashboard,
};

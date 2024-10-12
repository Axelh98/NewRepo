const express = require("express");
const router = express.Router();
const utilities = require("../utilities")
const validation = require("../utilities/classificationValidation");
const inventoryValidation = require("../utilities/inventory-validation")
const managementController = require("../controllers/managmentController")


router.get("/", utilities.handleErrors(managementController.buildManagement))

router.get("/new-classification", utilities.handleErrors(managementController.showNewClassificationForm));

router.get("/new-inventory", utilities.handleErrors(managementController.showNewInventoryForm));

// POST route to add new classification with validation
router.post(
    "/new-classification", 
    validation.classificationRules(),
    validation.checkClassificationData,
    utilities.handleErrors(managementController.addNewClassification)
  );

  router.post(
    "/new-inventory",
    inventoryValidation.newInventoryRules(),
    inventoryValidation.checkNewInventoryData,
    utilities.handleErrors(managementController.addNewInventory)
  );

  

module.exports = router;

// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const vehicleController = require("../controllers/vehiculeController")


// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);
// route to vehicule detail
router.get("/detail/:vehicleId", vehicleController.buildVehicleDetail);

module.exports = router;
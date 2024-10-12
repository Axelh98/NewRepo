// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const vehicleController = require("../controllers/vehiculeController")
const managementController = require('../controllers/managmentController');
const utilities = require("../utilities")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);
// route to vehicule detail
router.get("/detail/:vehicleId", vehicleController.buildVehicleDetail);

// error in the footter
router.get('/cause-error', (req, res, next) => {
    const error = new Error('Error intencional generado');
    error.status = 500; // Código de error 500
    next(error); // Pasa el error al middleware de manejo de errores
  });

module.exports = router;
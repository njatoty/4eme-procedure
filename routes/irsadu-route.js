// routes/irsaRoutes.js

const express = require('express');
const irsaController = require('../controllers/irsa-du/controller');

const router = express.Router();

// Route to get the single IRSA entry (create if not exists)
router.get('/', irsaController.getIRSA);

// Route to update the single IRSA entry
router.put('/', irsaController.updateIRSA);

// Route to add a new tranche
router.post('/tranches', irsaController.addTranche);

// Route to add a new tranche
router.post('/tranches/many', irsaController.addManyTranches);

// Route to update a specific tranche
router.put('/tranches/:trancheId', irsaController.updateTranche);

// Route to delete all tranches
router.delete('/tranches/all', irsaController.deleteAllTranches);

// Route to delete a specific tranche
router.delete('/tranches/:trancheId', irsaController.deleteTranche);

module.exports = router;

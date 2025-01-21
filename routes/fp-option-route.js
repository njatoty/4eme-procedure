// routes/irsaRoutes.js

const express = require('express');
const FPOptionController = require('../controllers/fp-option/controller');

const router = express.Router();

// Route to get the single IRSA entry (create if not exists)
router.get('/', FPOptionController.getIRSA);

// Route to update the single IRSA entry
router.put('/', FPOptionController.updateIRSA);

// Route to update the single PlafondCNAPS entry
router.put('/plafond-cnaps', FPOptionController.updatePladfondCNAPS);

// Route to add a new tranche
router.post('/tranches', FPOptionController.addTranche);

// Route to add a new tranche
router.post('/tranches/many', FPOptionController.addManyTranches);

// Route to update a specific tranche
router.put('/tranches/:trancheId', FPOptionController.updateTranche);

// Route to delete all tranches
router.delete('/tranches/all', FPOptionController.deleteAllTranches);

// Route to delete a specific tranche
router.delete('/tranches/:trancheId', FPOptionController.deleteTranche);

module.exports = router;

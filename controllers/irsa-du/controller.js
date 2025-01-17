// controllers/irsaController.js

const IRSA = require('../../models/IRSADuModel');

const defaultTranches = [
    { seuil: 350000, plage: 50000, taux: 5 },
    { seuil: 400000, plage: 100000, taux: 10 },
    { seuil: 500000, plage: 100000, taux: 15 },
    { seuil: 600000, plage: Infinity, taux: 20 },
];

// Get the single IRSA entry (create if not exists)
const getIRSA = async (req, res) => {
    try {
        let irsaEntry = await IRSA.findOne();
        if (!irsaEntry) {
            // Create default IRSA if none exists
            irsaEntry = new IRSA({ valeurMinimum: 3000, tranches: [...defaultTranches] });
            await irsaEntry.save();
        }
        res.status(200).json(irsaEntry);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update the single IRSA entry
const updateIRSA = async (req, res) => {
    try {
        const { valeurMinimum } = req.body;
        const updatedIRSA = await IRSA.findOneAndUpdate(
            {},
            { valeurMinimum },
            { new: true, upsert: true, runValidators: true } // Create if not exists
        );
        res.status(200).json(updatedIRSA);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Add a new tranche to the IRSA
const addTranche = async (req, res) => {
    try {
        const { seuil, plage, taux } = req.body;
        const updatedIRSA = await IRSA.findOneAndUpdate(
            {},
            { $push: { tranches: { seuil, plage, taux } } },
            { new: true }
        );
        res.status(200).json(updatedIRSA);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


// Add many tranches to the IRSA
const addManyTranches = async (req, res) => {
    try {
        const { tranches } = req.body;
        if (Array.isArray(tranches)) {
            const updatedIRSA = await IRSA.findOneAndUpdate(
                {},
                { $push: { tranches: { $each: tranches } } },
                { new: true }
            );
            res.status(200).json(updatedIRSA);
        } else {
            res.status(400).json({ error: "Tranches is not an array!"});
        }
        
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update a specific tranche
const updateTranche = async (req, res) => {
    try {
        const { trancheId } = req.params;
        const { seuil, plage, taux } = req.body;
        const updatedIRSA = await IRSA.findOneAndUpdate(
            { 'tranches._id': trancheId },
            {
                $set: {
                    'tranches.$.seuil': seuil,
                    'tranches.$.plage': plage,
                    'tranches.$.taux': taux,
                },
            },
            { new: true }
        );

        if (!updatedIRSA) {
            return res.status(404).json({ error: 'Tranche not found' });
        }

        res.status(200).json(updatedIRSA);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a specific tranche
const deleteTranche = async (req, res) => {
    try {
        const { trancheId } = req.params;
        const updatedIRSA = await IRSA.findOneAndUpdate(
            {},
            { $pull: { tranches: { _id: trancheId } } },
            { new: true }
        );

        if (!updatedIRSA) {
            return res.status(404).json({ error: 'Tranche not found' });
        }

        res.status(200).json(updatedIRSA);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a specific tranche
const deleteAllTranches = async (req, res) => {
    try {
        
        const updatedIRSA = await IRSA.findOneAndUpdate(
            {},
            { $set: { tranches: [] } },
            { new: true }
        );

        res.status(200).json(updatedIRSA);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getIRSA,
    updateIRSA,
    addTranche,
    addManyTranches,
    updateTranche,
    deleteTranche,
    deleteAllTranches,
};

const mongoose = require('mongoose');

const trancheSchema = new mongoose.Schema({
    seuil: { type: Number, required: true },
    plage: { type: Number, required: true },
    taux: { type: Number, required: true },
});

const irsaSchema = new mongoose.Schema({
    valeurMinimum: { type: Number, required: true },
    tranches: [trancheSchema], // Use trancheSchema directly in an array
    // cnaps
    plafondCNAPS: {
        type: Number,
        default: 262680
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});


// Function to generate the Excel formula based on the thresholds (tranches)
const generateExcelFormula = (thresholds, w10Variable = "W10", x10Variable = "X10", minValue = 3000) => {
    const formulaParts = thresholds.map(({ seuil, plage, taux }) => {
        return plage === Infinity || plage === null
            ? `MAX(0;${w10Variable}-${seuil})*${taux}%`
            : `MIN(MAX(0;${w10Variable}-${seuil});${plage})*${taux}%`;
    });

    return `=MAX(${minValue};0+${formulaParts.join("+")}-${x10Variable})`;
};


// Virtual for the `formula` field to dynamically calculate it
irsaSchema.virtual('formula').get(function() {
    return generateExcelFormula(this.tranches, "W10", "X10", this.valeurMinimum);
});

module.exports = mongoose.model('FPOption', irsaSchema);

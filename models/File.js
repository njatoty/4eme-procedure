const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const FileSchema = new Schema({
    nom: { type: String},
    matricule: { type: String},
    salaire_base: { type: Number},
    temps_travaille: { type: Number},
    salaire_correspondant: { type: Number},

    heure_suppl_30: { type: Number},
    heure_suppl_50: { type: Number},
    heure_suppl_100: { type: Number},
    heure_suppl_130: { type: Number},
    heure_suppl_150: { type: Number},

    transport: { type: Number},
    repas: { type: Number},

    preavis: { type: Number},
    conge_paye: { type: Number},

    exceptionelle: { type: Number},
    gratifications: { type: Number},
    fonction: { type: Number},
    rendements: { type: Number},

    alloc_fam: { type: Number},
    salaire_brut: { type: Number},

    cnaps: { type: Number},
    ostie: { type: Number},

    salaire_imposable: { type: Number},
    personne_a_charge: { type: Number},
    avance_salaire: { type: Number},
    irsa: { type: Number},
    reajustement: { type: Number},
    total_retenues: { type: Number},
    renumeration_dues: { type: Number},
    mode_paiement: { type: String},
    observation: { type: String},
    observation2: { type: String},

    total_maj_nuit: { type: Number},
    total_maj_weekend: { type: Number},
    total_maj_ferie: { type: Number},
    total_maj_heure_suppl_130: { type: Number},
    total_maj_heure_suppl_150: { type: Number},

    usuel: { type: String},
    m_code: { type: String},
    numbering: { type: String},
    matricule_cnaps: { type: String},
    cin: { type: String},
    embauche: { type: Date},
    adresse: { type: String},
    ordre: { type: String}
});

module.exports = mongoose.model('File', FileSchema);
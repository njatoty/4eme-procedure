const path = require("path");
const { extractDataInGSS, generateReport } = require("../../methods/methods");
const fs = require('fs');

// get upload paths folder
const uploadsPath = path.join(__dirname, '../../uploads/fiche-paie');
// method to check if a file exists in upload folder
const fileExists = (filename) => {
    const filePath = path.join(uploadsPath, filename);
    // check if file exist
    return fs.existsSync(filePath);
}

async function uploadGSS(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ ok: false, message: 'Pas de fichier téléchargé ou type de fichier invalide.' });
        }
    
        const filePath = req.file.path;
    
        const gssData = await extractDataInGSS(filePath);
    
        // fs.unlinkSync(filePath);
    
        res.status(200).json({
            ok: true,
            file: req.file,
            data: gssData
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false
        })
    }
}

async function uploadTemplate(req, res) {
    try {

        if (!req.file) {
            return res.status(400).json({ message: 'Pas de fichier téléchargé ou type de fichier invalide.' });
        }

        res.status(200).json({
            ok: true,
            file: req.file,
            message: 'Le template a été mis à jour!'
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false
        })
    }
}

async function getFileByName(req, res) {
    const { filename } = req.params;
    // check if file exist
    if (fileExists(filename)) {
        res.download(uploadsPath + "/" + filename);
    } else {
        res.json({
            exists: false
        })
    }
}


// Method to process
async function startProcessus(req, res) {

    // get body
    const {
        dateDebut,
        dateFin,
        jourOuvrables,
        jourOuvres,
        joursCalendaires,
        platFond
    } = req.body;

    // Access the uploaded files
    const gssFile = req.files['gss'] ? req.files['gss'][0] : null; // First (and only) 'gss' file
    const templateFile = req.files['template'] ? req.files['template'][0] : null; //

    // check gss file
    if (!gssFile) {
        return res.status(400).json({
            ok: false,
            message: 'Merci de charger le fichier GSS.'
        });
    }

    // extract data in gss file
    const data = await extractDataInGSS(gssFile.path);

    res.json({
        ok: true,
        data: data
    });

}


async function copyDataInTheTemplate(req, res) {
    try {
        
        const { data } = req.body;
        const templatePath = uploadsPath + '/template.xlsx';
        const outFileName = 'result.xlsx'
        const out = await generateReport(templatePath, outFileName, data);

        res.download(out);
        
    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            message: 'Failed to copy data to the Template'
        });
    }
}

module.exports = {
    uploadGSS,
    uploadTemplate,
    getFileByName,
    startProcessus,
    copyDataInTheTemplate
}
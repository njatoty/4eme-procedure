const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadGSS, uploadTemplate, getFileByName, startProcessus, copyDataInTheTemplate } = require('../controllers/fiche-paie/controller');
const path = require('path');

// Configure Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/fiche-paie'); // Upload destination folder
    },
    filename: (req, file, cb) => {
        // Retain the original extension
        const extension = path.extname(file.originalname);
        // Create the final file name
        cb(null, `${file.fieldname}${extension}`);
    }
});

const fileFilter = (req, file, cb) => {
    // Accept only .xlsx files
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only .xlsx files are allowed.'));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

/**
 * ==========================================================================
 * ROUTERS
 * ==========================================================================
 */

router.get('/', (req, res) => res.send('hi!'));
/**
 * Method to upload gss file
 */
router.post('/upload-gss', upload.single('gss'), uploadGSS);
/**
 * Method to upload template file
 */
router.post('/upload-template', upload.single('template'), uploadTemplate);
/**
 * Method to get file by name
 */
router.get('/file/:filename', getFileByName);
/**
 * Method to start processus
 */
router.post('/start-processus', 
    upload.fields([
        { name: 'gss', maxCount: 1 },
        { name: 'template', maxCount: 1 },
        { name: 'majoration', maxCount: 1 },
    ]),
    
    startProcessus
);
/**
 * Method to copy data to the template and download outputfile
 */
router.post('/copy-data-template', copyDataInTheTemplate);


module.exports = router;
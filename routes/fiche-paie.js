const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadGSS } = require('../controllers/fiche-paie/controller');
const path = require('path');

// Configure Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/fiche-paie'); // Upload destination folder
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
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

router.get('/', (req, res) => res.send('hi!'));
router.post('/upload-gss', upload.single('gss'), uploadGSS);


module.exports = router;
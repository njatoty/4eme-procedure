const express = require('express');
const router = express.Router();
const { 
    createFile, 
    getAllColumns, 
    getFileById, 
    updateFileById, 
    deleteFileById, createSheet 
} = require('../controllers/template/template_controlleur');

      
router.post('/files', createFile);
router.get('/allColumns', getAllColumns);
router.get('/files/:id', getFileById);
router.patch('/files/:id', updateFileById);
router.delete('/files/:id', deleteFileById);

//sheet
router.post('/sheet', createSheet);
// router.get('/sheet/:id', getSheetById);
// router.patch('/sheet/:id', updateSheetById);
// router.delete('/sheet/:id', deleteSheetById);


module.exports = router;
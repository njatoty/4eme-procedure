const express = require('express');
const router = express.Router();
const { 
    addOrUpdateColumn, 
    removeColumn, 
    getColumns, 
    allColumns,
    // updateFileById, 
    updateColumn,
    deleteSheetById, 
    createSheet 
} = require('../controllers/template/template_controlleur');

      
router.post('/addColumn', addOrUpdateColumn);
router.post('/removeColumn', removeColumn);
router.get('/getColumns', getColumns);
router.get('/allColumns', allColumns);
router.put('/updateColumn', updateColumn);
// router.patch('/files/:id', updateFileById);
// router.delete('/files/:id', deleteFileById);

//sheet
router.post('/sheet', createSheet);
router.delete('/removeSheet/:id', deleteSheetById);
// router.get('/sheet/:id', getSheetById);
// router.patch('/sheet/:id', updateSheetById);


module.exports = router;
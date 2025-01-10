const File = require('../../models/File');

// Add or update a single column
const addOrUpdateColumn = async (req, res) => {
  try {
    const { sheetName,  columnName, columnValue } = req.body;
    
    // Validate input
    if (!sheetName || ! columnName || columnValue === undefined) {
      return res.status(400).json({ error: 'Invalid data provided' });
    }

    // Find the sheet and update the specific column
    const updatedSheet = await File.findOneAndUpdate(
      { sheetName },
      { $set: { [`columns.${columnName}`]: columnValue } }, // Dynamically set column
      { new: true }
    );

    

    if (!updatedSheet) {
      return res.status(404).json({ error: 'Sheet not found' });
    }

    res.status(200).json({ message: 'ok', sheet: updatedSheet });
  } catch (error) {
    console.error('Error updating column:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// update more columns
const updateColumn = async (req, res) => {
  try {
    const { sheetName,  columns } = req.body;
    
    // Validate input
    if (!sheetName || ! columns ) {
      return res.status(400).json({ error: 'Invalid data provided' });
    }

    // Find the sheet and update the specific column
    const updatedSheet = await File.findOneAndUpdate(
      { sheetName },
      { $set: { columns } }, // Dynamically set column
      { new: true }
    );    

    if (!updatedSheet) {
      return res.status(404).json({ error: 'Sheet not found' });
    }

    res.status(200).json({ message: 'ok', sheet: updatedSheet });
  } catch (error) {
    console.error('Error updating column:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Remove a column from the sheet
const removeColumn = async (req, res) => {
  try {
    const { sheetName, columnName } = req.body;
    
    // Validate input
    if (!sheetName || !columnName) {
      return res.status(400).json({ error: 'Invalid data provided' });
    }

    // Find the sheet and remove the specific column
    const updatedSheet = await File.findOneAndUpdate(
      { sheetName },
      { $unset: { [`columns.${columnName}`]: '' } }, // Dynamically unset column
      { new: true }
    );

    if (!updatedSheet) {
      return res.status(404).json({ error: 'Sheet not found' });
    }
    
    res.status(200).json({ message: 'ok', sheet: updatedSheet });
  } catch (error) {
    console.error('Error removing column:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all columns of a specific sheet
const getColumns = async (req, res) => {
  try {
    const { sheetName } = req.params;

    // Find the sheet
    const sheet = await File.findOne({ sheetName });

    if (!sheet) {
      return res.status(404).json({ error: 'Sheet not found' });
    }

    res.status(200).json({ columns: sheet.columns });
  } catch (error) {
    console.error('Error retrieving columns:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


async function createSheet (req, res)  {
    try {
        const file = new File(req.body);
        await file.save();
        
        res.status(201).send(file);
    } catch (error) {
        res.status(400).send({ error: 'Unable to create file', details: error.message });
    }
};


// Remove a sheet from the sheet
async function deleteSheetById (req, res) {
  try {

    const { id } = req.params;

    // Validate input
    if (!id) {
      return res.status(400).json({ error: 'Invalid data provided' });
    }

    // Find the sheet and remove it
    const deletedSheet = await File.findByIdAndDelete(id);
    
    if (!deletedSheet) {
      return res.status(404).json({ error: 'Sheet not found' });
    }

    res.status(200).json({ message: 'Sheet deleted successfully', sheet: deletedSheet });
    
  } catch (error) {
    console.error('Error removing column:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


async function allColumns (req, res) {
    try {
        const files = await File.find();
        
        res.status(200).send(files);
    } catch (error) {
        res.status(500).send({ error: 'Unable to fetch files', details: error.message });
    }
}

async function getAllColumns (req, res) {
      const files = await File.find();
      
      return files
}
module.exports = {
  addOrUpdateColumn,
  removeColumn,
  getColumns,
  createSheet,
  allColumns,
  deleteSheetById,
  updateColumn, 
  getAllColumns
};

// (router) => {
//     router.post('/files', createFile);
//     router.get('/files', getAllFiles);
//     router.get('/files/:id', getFileById);
//     router.patch('/files/:id', updateFileById);
//     router.delete('/files/:id', deleteFileById);
// };

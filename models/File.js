const mongoose = require('mongoose');

const GSSColumnSchema = new mongoose.Schema(
    {
      sheetName: { type: String, required: true, unique: true },
      columns: {
        type: Map, // Use a map to support dynamic fields
        of: String, // Each value in the map will be a string
      },
    },
    { strict: false } // Allows saving fields not defined in the schema
  );
  

module.exports = mongoose.model('File', GSSColumnSchema);
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fichePaieRouter = require('./routes/fiche-paie')
// Initialize the app
const app = express();

// Middleware
app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cors()); // Enable CORS

// Define a port
const PORT = process.env.PORT || 6969;

// Routes
app.use('/fiche-paie', fichePaieRouter);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

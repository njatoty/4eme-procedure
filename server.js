const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fichePaieRouter = require('./routes/fiche-paie-route');
const templateRouter = require('./routes/template-route');

const path = require("path");
// Initialize the app
const app = express();

// Middleware
app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cors()); // Enable CORS
// Set the uploads folder to serve static files
app.use(express.static(path.join(__dirname, "uploads")));

// Define a port
const PORT = process.env.PORT || 6969;

// Routes
app.use('/fiche-paie', fichePaieRouter);
app.use('/template', templateRouter);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

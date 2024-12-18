const { extractDataInGSS } = require("../../methods/methods");
const fs = require('fs')

async function uploadGSS(req, res) {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded or invalid file type' });
    }

    const filePath = req.file.path;

    const gssData = await extractDataInGSS(filePath);


    fs.unlinkSync(filePath);

    res.status(200).json({
        ok: true,
        data: gssData
    });
}

module.exports = {
    uploadGSS
}
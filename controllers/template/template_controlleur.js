const File = require('../../models/File');

async function createFile (req, res)  {
    try {
        const file = new File(req.body);
        await file.save();
        res.status(201).send(file);
    } catch (error) {
        res.status(400).send({ error: 'Unable to create file', details: error.message });
    }
};

async function getAllColumns (req, res)   {
    try {
        const files = await File.find({});
        res.status(200).send(files);
    } catch (error) {
        res.status(500).send({ error: 'Unable to fetch files', details: error.message });
    }
};

const getFileById = async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        if (!file) {
            return res.status(404).send({ error: 'File not found' });
        }
        res.status(200).send(file);
    } catch (error) {
        res.status(500).send({ error: 'Unable to fetch file', details: error.message });
    }
};

const updateFileById = async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'content']; // Add other fields as necessary
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        const file = await File.findById(req.params.id);
        if (!file) {
            return res.status(404).send({ error: 'File not found' });
        }

        updates.forEach(update => (file[update] = req.body[update]));
        await file.save();
        res.status(200).send(file);
    } catch (error) {
        res.status(400).send({ error: 'Unable to update file', details: error.message });
    }
};

const deleteFileById = async (req, res) => {
    try {
        const file = await File.findByIdAndDelete(req.params.id);
        console.log(" file", file);
        
        if (!file) {
            return res.status(404).send({ error: 'File not found' });
        }
        res.status(200).send(file);
    } catch (error) {
        res.status(500).send({ error: 'Unable to delete file', details: error.message });
    }
};


async function createSheet (req, res)  {
    try {
        const file = new File(req.body);
        console.log(" req.body", req.body);
        
        console.log(" file", file);
        
        var f = await file.save();
        console.log(" f", f);
        
        res.status(201).send(file);
    } catch (error) {
        res.status(400).send({ error: 'Unable to create file', details: error.message });
    }
};

// async function getAllFiles (req, res)   {
//     try {
//         const files = await File.find({});
//         res.status(200).send(files);
//     } catch (error) {
//         res.status(500).send({ error: 'Unable to fetch files', details: error.message });
//     }
// };

module.exports = {
    createFile , getAllColumns,
     getFileById, updateFileById, deleteFileById,
     createSheet
    } 
// (router) => {
//     router.post('/files', createFile);
//     router.get('/files', getAllFiles);
//     router.get('/files/:id', getFileById);
//     router.patch('/files/:id', updateFileById);
//     router.delete('/files/:id', deleteFileById);
// };

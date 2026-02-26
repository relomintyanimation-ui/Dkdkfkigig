const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// 🔥 Project-based storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const projectId = req.body.projectId || 'default';
        const projectPath = path.join('uploads', projectId);
        const fullPath = path.join(__dirname, projectPath);
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
        }
        cb(null, projectPath);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname.replace(/\s+/g, '-'));
    }
});
const upload = multer({ storage: storage });

app.use(express.static(__dirname));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🔥 Multiple files upload with projectId
app.post('/upload', upload.array('files'), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const projectId = req.body.projectId || Date.now().toString();
    const files = req.files.map(f => f.filename);
    const mainFile = files.find(f => f.toLowerCase() === 'index.html') || files[0];

    const projectLink = `${req.protocol}://${req.get('host')}/uploads/${projectId}/${mainFile}`;

    res.json({
        success: true,
        projectId: projectId,
        link: projectLink,
        files: files
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
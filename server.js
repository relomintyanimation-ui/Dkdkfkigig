const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
// Cloud hosting (jaise Render) ke liye process.env.PORT lagana zaroori hota hai
const PORT = process.env.PORT || 3000;

// Agar 'uploads' folder nahi hai, toh automatic bana dega
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer setup: File kahan aur kis naam se save hogi
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // YAHAN MAIN CHANGE HAI:
        // Ab timestamp nahi judega. File usi naam se save hogi jis naam se aapne upload ki hai.
        // Isse HTML aur CSS files aapas mein bina tute connect rahengi.
        cb(null, file.originalname.replace(/\s+/g, '-'));
    }
});
const upload = multer({ storage: storage });

// Static files serve karna (HTML file aur Uploaded files dikhane ke liye)
app.use(express.static(__dirname));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Upload API
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Koi file upload nahi hui' });
    }
    
    // Real link generate karna
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ success: true, link: fileUrl });
});

app.listen(PORT, () => {
    console.log(`Server chalu ho gaya hai! Yahan click karein: http://localhost:${PORT}`);
});

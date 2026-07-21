const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Prefer a project-local .env, but also support the extra wrapper directory
// commonly created when the project is downloaded and extracted as a ZIP.
dotenv.config({
    path: [
        path.join(__dirname, '.env'),
        path.join(__dirname, '..', '.env')
    ]
});

const app = express();


app.use(cors());
app.use(express.json());



app.use(express.static(__dirname));


app.get('/', (req, res) => {
    res.redirect('/views/index.html');
});


const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const articleRoutes = require('./routes/articles');
const userRoutes = require('./routes/users');
const contactRoutes = require('./routes/contacts');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/contacts', contactRoutes);


const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'asm_web_images',
        allowedFormats: ['jpg', 'png', 'jpeg', 'webp'],
        public_id: (req, file) => {
            const originalName = file.originalname.split('.')[0];
            return Date.now() + '-' + originalName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        },
    },
});

const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } });
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'Không có file nào được tải lên' });
    res.json({ url: req.file.path });
});



mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.MONGODB_DB_NAME || 'pizzan'
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => console.error('❌ Failed to connect to MongoDB', err));

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
}

module.exports = app;
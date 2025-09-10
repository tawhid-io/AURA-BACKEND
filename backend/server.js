// server.js (The Final, Complete, and Unabridged Version)

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');
const multer = require('multer');

// --- মডেল ইম্পোর্ট করা ---
const Product = require('./models/product.model.js');
const User = require('./models/user.model.js');
const Order = require('./models/order.model.js');

// --- অ্যাপ ইনিশিয়ালাইজেশন এবং মিডলওয়্যার ---
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Multer স্টোরেজ কনফিগারেশন ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage: storage });

// --- ডাটাবেস সংযোগ ---
const MONGO_URI = "mongodb+srv://aura_admin:868443BSc@auracluster.khir4p0.mongodb.net/?retryWrites=true&w=majority&appName=AuraCluster";
mongoose.connect(MONGO_URI)
    .then(() => console.log('Successfully connected to MongoDB!'))
    .catch((error) => console.error('Failed to connect to MongoDB.', error));

const PORT = 5000;

// --- মূল রুট ---
app.get('/', (req, res) => {
    res.send('AURA Backend Server is running!');
});

// ======================================================
// ===== প্রোডাক্ট APIs (Product APIs) =====
// ======================================================

// GET API for all products (with pagination, filter, sort)
app.get('/api/products', async (req, res) => {
    try {
        const limit = 12;
        const page = Number(req.query.page) || 1;
        const category = req.query.category;
        const sort = req.query.sort;

        const filter = {};
        if (category && category !== 'All Categories') {
            filter['category.main'] = category;
        }

        const sortOptions = {};
        if (sort === 'price-asc') sortOptions['price.final'] = 1;
        else if (sort === 'price-desc') sortOptions['price.final'] = -1;
        else sortOptions.createdAt = -1;

        const count = await Product.countDocuments(filter);
        const products = await Product.find(filter)
            .sort(sortOptions)
            .limit(limit)
            .skip(limit * (page - 1));

        res.json({ products, page, pages: Math.ceil(count / limit), total: count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET API for Featured Products
app.get('/api/products/featured', async (req, res) => {
    try {
        const featuredProducts = await Product.find({ isFeatured: true }).limit(4);
        res.status(200).json(featuredProducts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET API for New Arrival Products
app.get('/api/products/new', async (req, res) => {
    try {
        const newArrivalProducts = await Product.find({ 'status.isNewArrival': true })
            .sort({ createdAt: -1 })
            .limit(8);
        res.status(200).json(newArrivalProducts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET API for Categories with an image
app.get('/api/categories', async (req, res) => {
    try {
        const categoryNames = await Product.distinct('category.main');
        const categoriesWithImages = await Promise.all(
            categoryNames.map(async (name) => {
                const product = await Product.findOne({ 'category.main': name });
                return {
                    name: name,
                    image: product ? product.images.main : 'https://placehold.co/600x800'
                };
            })
        );
        res.status(200).json(categoriesWithImages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET API for Related Products
app.get('/api/products/related/:categoryName', async (req, res) => {
    try {
        const { categoryName } = req.params;
        const { currentProductId } = req.query;
        const relatedProducts = await Product.find({
            'category.main': categoryName,
            _id: { $ne: currentProductId }
        }).limit(4);
        res.status(200).json(relatedProducts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET API for a single product by ID
app.get('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// ======================================================
// ===== ইউজার APIs (User APIs) =====
// ======================================================

// Register a new user
app.post('/api/users/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.status(400).json({ message: "Please fill all required fields" });
        
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "User with this email already exists" });
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const newUser = await User.create({ name, email, password: hashedPassword });
        
        res.status(201).json({
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            createdAt: newUser.createdAt
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Login a user
app.post('/api/users/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: "Please provide email and password" });
        
        const user = await User.findOne({ email });
        
        if (user && (await bcrypt.compare(password, user.password))) {
            res.status(200).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                profilePicture: user.profilePicture,
                createdAt: user.createdAt
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Upload profile picture
app.post('/api/users/upload-profile', upload.single('profileImage'), async (req, res) => {
    try {
        const userId = req.body.userId;
        const filePath = req.file.path;

        const updatedUser = await User.findByIdAndUpdate(userId, { profilePicture: filePath }, { new: true }).select('-password');
        
        if (!updatedUser) return res.status(404).json({ message: 'User not found' });
        
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// ======================================================
// ===== অর্ডার APIs (Order APIs) =====
// ======================================================

// Create a new order
app.post('/api/orders', async (req, res) => {
    try {
        const { orderItems, shippingAddress, paymentMethod, totalPrice, user } = req.body;

        if (orderItems && orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        const order = new Order({
            orderItems: orderItems.map(item => ({ ...item, product: item.product })),
            user: user,
            shippingAddress: shippingAddress,
            paymentMethod: paymentMethod,
            totalPrice: totalPrice,
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);

    } catch (error) {
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
});

// Get logged in user's orders
app.get('/api/orders/myorders/:userId', async (req, res) => {
    try {
        const orders = await Order.find({ user: req.params.userId }).sort({ createdAt: -1 });
        if (!orders) return res.status(404).json({ message: 'Orders not found' });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// --- সার্ভার চালু করা ---
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
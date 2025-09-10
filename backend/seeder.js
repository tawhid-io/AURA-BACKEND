const mongoose = require('mongoose');

const Product = require('./models/product.model.js');

const { products } = require('./data/products.js');



const MONGO_URI = "mongodb+srv://aura_admin:868443BSc@auracluster.khir4p0.mongodb.net/?retryWrites=true&w=majority&appName=AuraCluster";



const importData = async () => {

  try {

    await mongoose.connect(MONGO_URI);

    console.log('MongoDB Connected...');



    await Product.deleteMany();

    await Product.insertMany(products);



    console.log('Data Imported Successfully!');

    process.exit();

  } catch (error) {

    console.error('Error with data import:', error);

    process.exit(1);

  }

};



importData();
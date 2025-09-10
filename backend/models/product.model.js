const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  shortDescription: {
    type: String,
  },
  price: {
    original: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
      default: 0
    },
    final: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
  },
  category: {
    main: {
      type: String,
      required: true,
    },
    sub: {
      type: String,
    },
    tags: [{
      type: String,
    }],
  },
  images: {
    main: {
      type: String,
      required: true,
    },
    thumbnails: [{
      type: String,
    }],
    gallery: [{
      type: String,
    }],
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  variants: {
    colors: [{
      name: {
        type: String,
        required: true,
      },
      value: {
        type: String,
        required: true,
      },
      hex: {
        type: String,
      },
      available: {
        type: Boolean,
        default: true,
      },
    }],
    sizes: [{
      name: {
        type: String,
        required: true,
      },
      value: {
        type: String,
        required: true,
      },
      available: {
        type: Boolean,
        default: true,
      },
      stock: {
        type: Number,
        required: true,
      },
    }],
  },
  inventory: {
    totalStock: {
      type: Number,
      required: true,
      default: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
    },
    isInStock: {
      type: Boolean,
      default: true,
    },
    sku: {
      type: String,
      unique: true,
    },
  },
  specifications: {
    material: {
      type: String,
    },
    careInstructions: {
      type: String,
    },
    origin: {
      type: String,
    },
    heelHeight: {
      type: String,
    },
  },
  accordion: [{
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  }],
  status: {
    isActive: {
      type: Boolean,
      default: true,
    },
    isNewArrival: {
      type: Boolean,
      default: false,
    },
  },
  timestamps: {
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  }
}, {
  timestamps: true,
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
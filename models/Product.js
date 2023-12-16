const mongoose = require("mongoose");
const productSchema = mongoose.Schema({
  imgPath: {
    type: String,
    require: true,
  },
  productName: {
    type: String,
    require: true,
  },
  productDescription: {
    type: {
      screen: Number,
      system: String,
      storage: Number,
      RAM: Number,
      processor: String,
      selfieCamera: Number,
      battery: Number,
    },
    require: true,
  },
  productPrice: {
    type: Number,
    require: true,
  },
});

// const Product = mongoose.model("Product", productSchema);

// module.exports = Product;
module.exports = mongoose.model("Product", productSchema);

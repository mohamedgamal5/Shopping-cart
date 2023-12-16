const Product = require("../models/Product");
const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost/Shopping-cart")
  .then(() => console.log(`success connect to DB`))
  .catch((err) => console.log(err));

const products = [
  new Product({
    imgPath: "/images/realme 6.jpg",
    productName: "realme 6",
    productDescription: {
      screen: 6.5,
      system: "Android 10",
      storage: 128,
      RAM: 4,
      processor: "MediaTek Helio G90T ",
      selfieCamera: 16,
      battery: 4300,
    },
    productPrice: 4500,
  }),
  new Product({
    imgPath: "/images/iPhone 15 Pro Max.jpg",
    productName: "iPhone 15 Pro Max",
    productDescription: {
      screen: 6.7,
      system: "IOS 17",
      storage: 512,
      RAM: 8,
      processor: "Apple A17",
      selfieCamera: 12,
      battery: 4422,
    },
    productPrice: 70000,
  }),
  new Product({
    imgPath: "/images/Samsung Galaxy Z Flip 5.jpg",
    productName: "Samsung Galaxy Z Flip 5",
    productDescription: {
      screen: 6.7,
      system: "Android 13",
      storage: 512,
      RAM: 8,
      processor: "snapdragon 8",
      selfieCamera: 12,
      battery: 3700,
    },
    productPrice: 40000,
  }),
  new Product({
    imgPath: "/images/realme 6 pro.jpg",
    productName: "realme 6 pro",
    productDescription: {
      screen: 6.6,
      system: "Android 10",
      storage: 128,
      RAM: 8,
      processor: "Snapdragon 720G ",
      selfieCamera: 12,
      battery: 4300,
    },
    productPrice: 5300,
  }),
  new Product({
    imgPath: "/images/realme 11 pro.jpg",
    productName: "realme 11 pro",
    productDescription: {
      screen: 6.7,
      system: "Android 13",
      storage: 512,
      RAM: 12,
      processor: "Dimensity 7050",
      selfieCamera: 16,
      battery: 5000,
    },
    productPrice: 20000,
  }),
  new Product({
    imgPath: "/images/realme gt.jpg",
    productName: "realme gt",
    productDescription: {
      screen: 6.74,
      system: "Android 13",
      storage: 512,
      RAM: 16,
      processor: "Snapdragon 8 ",
      selfieCamera: 50,
      battery: 5240,
    },
    productPrice: 25000,
  }),
];

var done = 0;
for (var i = 0; i < products.length; i++) {
  console.log(`${i}>>>>>>>>>>>>>${done}`);
  products[i]
    .save()
    .then((doc) => {
      console.log(doc);
      done++;
      console.log(`${done}_________________________`);
      if (done === products.length) {
        mongoose.disconnect();
      }
    })
    .catch((err) => {
      console.log(">>>>>>>>>>>>>>");
      console.error(err);
      done++;
    });
}

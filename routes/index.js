var express = require("express");
var router = express.Router();

const Product = require("../models/Product");
const Cart = require("../models/Cart");
const User = require("../models/User");
/* GET home page. */
router.get("/", async (req, res, next) => {
  var totalProducts = null;
  if (req.isAuthenticated()) {
    if (req.user.cart) {
      totalProducts = req.user.cart.totalQuantity;
    } else {
      totalProducts = 0;
    }
  }
  var productsGrid = [];
  var colGrid = 3;
  const page = req.params.page * 1 || 1;
  const limit = 2;
  const skip = (page - 1) * limit;
  const products = await Product.find({}).skip(skip).limit(limit);
  const products2 = await Product.find({});
  var noPages = Math.ceil(products2.length / limit);
  var pages = [];
  for (var i = 0; i < noPages; i++) {
    pages.push(i + 1);
  }

  for (var i = 0; i < products.length; i += colGrid) {
    productsGrid.push(products.slice(i, i + colGrid));
  }

  res.render("index", {
    title: "Shopping cart",
    products: productsGrid,
    checkUser: req.isAuthenticated(),
    totalProducts: totalProducts,
    noPages: pages,
    noPage: 1,
  });
});
router.get("/page/:page", async (req, res, next) => {
  var totalProducts = null;
  if (req.isAuthenticated()) {
    if (req.user.cart) {
      totalProducts = req.user.cart.totalQuantity;
    } else {
      totalProducts = 0;
    }
  }
  var productsGrid = [];
  var colGrid = 3;
  const page = req.params.page * 1 || 1;
  const limit = 2;
  const skip = (page - 1) * limit;
  const products = await Product.find({}).skip(skip).limit(limit);
  const products2 = await Product.find({});
  var noPages = Math.ceil(products2.length / limit);
  var pages = [];
  for (var i = 0; i < noPages; i++) {
    pages.push(i + 1);
  }

  for (var i = 0; i < products.length; i += colGrid) {
    productsGrid.push(products.slice(i, i + colGrid));
  }
  console.log(`page ${req.params.page}`);
  res.render("index", {
    title: "Shopping cart",
    products: productsGrid,
    checkUser: req.isAuthenticated(),
    totalProducts: totalProducts,
    noPages: pages,
    noPage: req.params.page,
  });
});

router.get("/addToCart/:id/:price/:name/:noPage", (req, res, next) => {
  const cartID = req.user._id;
  const newproductPrice = parseInt(req.params.price, 10);
  const newProduct = {
    _id: req.params.id,
    price: newproductPrice,
    name: req.params.name,
    quantity: 1,
  };
  Cart.findById(cartID)
    .then((cart) => {
      if (!cart) {
        const newCart = new Cart({
          _id: cartID,
          totalQuantity: 1,
          totalPrice: newproductPrice,
          selectedProduct: [newProduct],
        });
        newCart
          .save()
          .then((doc) => {})
          .catch((err) => {
            console.log(err);
          });
      }
      if (cart) {
        cart.totalQuantity++;
        cart.totalPrice += newproductPrice;
        let index = -1;

        for (let i = 0; i < cart.selectedProduct.length; i++) {
          if (cart.selectedProduct[i]._id == newProduct._id) {
            index = i;
            break;
          }
        }
        if (index == -1) {
          cart.selectedProduct.push(newProduct);
          cart
            .save()
            .then((doc) => {})
            .catch((err) => {
              console.log(err);
            });
        } else {
          cart.selectedProduct[index].quantity++;
          const updatecart = cart;

          Cart.updateOne({ _id: cartID }, { $set: updatecart })
            .then(() => {})
            .catch((err) => {});
        }
      }
    })
    .catch((err) => {
      console.log(err);
    });
  if (req.params.noPage == -1) {
    var productsGrid = [];
    var colGrid = 3;
    for (var i = 0; i < req.user.cart.selectedProduct.length; i += colGrid) {
      productsGrid.push(req.user.cart.selectedProduct.slice(i, i + colGrid));
    }
    res.render("shoppingCart", {
      userCart: req.user.cart,
      checkUser: true,
      selectedProduct: productsGrid,
      totalProducts: req.user.cart.totalQuantity,
      totalPrice: req.user.cart.totalPrice,
    });
  } else {
    res.redirect("/page/" + req.params.noPage);
  }
});

router.get("/removeFromCart/:id/:price/:name", (req, res, next) => {
  const cartID = req.user._id;

  Cart.findById(cartID)
    .then((cart) => {
      console.log(`remove cart  ${cart}`);
      if (!cart) {
        res.render("shoppingCart", {
          userCart: req.user.cart,
          checkUser: true,
          selectedProduct: req.user.cart.selectedProduct,
          totalProducts: req.user.cart.totalQuantity,
        });
      }
      if (cart) {
        for (let i = 0; i < cart.selectedProduct.length; i++) {
          if (cart.selectedProduct[i]._id == req.params.id) {
            cart.totalQuantity--;
            cart.totalPrice -= cart.selectedProduct[i].price;
            if (cart.selectedProduct[i].quantity == 1) {
              cart.selectedProduct.splice(i, 1);
            } else {
              cart.selectedProduct[i].quantity--;
            }
          }
        }
        Cart.updateOne({ _id: cartID }, { $set: cart })
          .then((updatecart) => {})
          .catch((err) => {});
      }
      res.redirect("/shoppingCart");
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get("/shoppingCart", (req, res, next) => {
  if (!req.isAuthenticated()) {
    res.redirect("/users/signin");
    return;
  }

  console.log(req.session.hasCart);
  if (!req.user.cart) {
    res.render("shoppingCart", {
      checkUser: true,
      hasCart: req.session.hasCart,
      totalProducts: 0,
    });
    req.session.hasCart = false;
    return;
  }

  var productsGrid = [];
  var colGrid = 3;
  for (var i = 0; i < req.user.cart.selectedProduct.length; i += colGrid) {
    productsGrid.push(req.user.cart.selectedProduct.slice(i, i + colGrid));
  }

  res.render("shoppingCart", {
    userCart: req.user.cart,
    checkUser: true,
    selectedProduct: productsGrid,
    totalProducts: req.user.cart.totalQuantity,
    totalPrice: req.user.cart.totalPrice,
  });
});

module.exports = router;

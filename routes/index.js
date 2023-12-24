var express = require("express");
var router = express.Router();
const { check, validationResult } = require("express-validator");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const User = require("../models/User");
let CUser = new User();
/* GET home page. */
router.get("/", async (req, res, next) => {
  var totalProducts = null;
  if (req.isAuthenticated()) {
    await User.findOne({ email: req.user.email })
      .then((d) => {
        CUser = d;
      })
      .catch((err) => {
        console.log(`err=> ${err}`);
      });
    if (req.user.cart) {
      totalProducts = req.user.cart.totalQuantity;
    } else {
      totalProducts = 0;
    }
  }
  console.log(`search => ${req.query.search.length}`);

  var productsGrid = [];
  var colGrid = 3;
  const page = req.params.page * 1 || 1;
  const limit = 2;
  const skip = (page - 1) * limit;
  var products = await Product.find({}).skip(skip).limit(limit);
  if (req.query.search.length > 0) {
    await Product.find(
      { productName: { $regex: new RegExp(req.query.search) } },
      { _id: 0, __v: 0 }
    )
      .then((doc) => {
        products = doc;
        console.log(`doc-> ${doc}`);
      })
      .catch((err) => {
        console.log(`err-> ${err}`);
      });
  }
  console.log(`pro-> ${products}`);

  const products2 = await Product.find({});
  var noPages = Math.ceil(products2.length / limit);
  var pages = [];
  for (var i = 0; i < noPages; i++) {
    pages.push(i + 1);
  }

  for (var i = 0; i < products.length; i += colGrid) {
    productsGrid.push(products.slice(i, i + colGrid));
  }
  const checkRole = CUser.role == "admin" ? true : false;
  res.render("index", {
    title: "Shopping cart",
    products: productsGrid,
    checkUser: req.isAuthenticated(),
    checkRole: checkRole,
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
  const checkRole = CUser.role == "admin" ? true : false;
  res.render("index", {
    title: "Shopping cart",
    products: productsGrid,
    checkUser: req.isAuthenticated(),
    checkRole: checkRole,
    totalProducts: totalProducts,
    noPages: pages,
    noPage: req.params.page,
  });
});

router.get("/next/:page", async (req, res, next) => {
  var totalProducts = null;
  if (req.isAuthenticated()) {
    if (req.user.cart) {
      totalProducts = req.user.cart.totalQuantity;
    } else {
      totalProducts = 0;
    }
  }
  var nopage = req.params.page;
  var productsGrid = [];
  var colGrid = 3;
  let products;
  const limit = 2;
  const products2 = await Product.find({});
  var noPages = Math.ceil(products2.length / limit);
  if (nopage == noPages) {
    const page = req.params.page * 1 || 1;
    const skip = (page - 1) * limit;
    products = await Product.find({}).skip(skip).limit(limit);
  } else {
    nopage++;
    console.log(`nopage => ${nopage}`);
    const page = nopage;
    const skip = (page - 1) * limit;
    products = await Product.find({}).skip(skip).limit(limit);
  }

  var pages = [];
  for (var i = 0; i < noPages; i++) {
    pages.push(i + 1);
  }

  for (var i = 0; i < products.length; i += colGrid) {
    productsGrid.push(products.slice(i, i + colGrid));
  }
  const checkRole = CUser.role == "admin" ? true : false;
  const dir = "/page/" + nopage;
  res.redirect(dir);
});

router.get("/previous/:page", async (req, res, next) => {
  var totalProducts = null;
  if (req.isAuthenticated()) {
    if (req.user.cart) {
      totalProducts = req.user.cart.totalQuantity;
    } else {
      totalProducts = 0;
    }
  }
  var nopage = req.params.page;
  var productsGrid = [];
  var colGrid = 3;
  let products;
  const limit = 2;
  const products2 = await Product.find({});
  var noPages = Math.ceil(products2.length / limit);
  if (nopage == 1) {
    const page = req.params.page * 1 || 1;
    const skip = (page - 1) * limit;
    products = await Product.find({}).skip(skip).limit(limit);
  } else {
    nopage--;
    console.log(`nopage => ${nopage}`);
    const page = nopage;
    const skip = (page - 1) * limit;
    products = await Product.find({}).skip(skip).limit(limit);
  }

  var pages = [];
  for (var i = 0; i < noPages; i++) {
    pages.push(i + 1);
  }

  for (var i = 0; i < products.length; i += colGrid) {
    productsGrid.push(products.slice(i, i + colGrid));
  }
  const checkRole = CUser.role == "admin" ? true : false;
  const dir = "/page/" + nopage;
  res.redirect(dir);
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

router.get("/increaseProduct/:id/:price/:name", async (req, res, next) => {
  const cartID = req.user._id;

  await Cart.findById(cartID)
    .then(async (cart) => {
      for (let i = 0; i < cart.selectedProduct.length; i++) {
        if (cart.selectedProduct[i]._id == req.params.id) {
          cart.selectedProduct[i].quantity++;
          cart.totalQuantity++;
          cart.totalPrice += req.params.price * 1;

          Cart.updateOne({ _id: cartID }, { $set: cart })
            .then(() => {})
            .catch((err) => {});
        }
      }
    })
    .catch((err) => {
      console.log(err);
    });
  res.redirect("/shoppingCart");
});

router.get("/decreaseProductt/:id/:price/:name", (req, res, next) => {
  const cartID = req.user._id;
  Cart.findById(cartID)
    .then((cart) => {
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

router.get("/addProduct", (req, res, next) => {
  if (!req.isAuthenticated()) {
    console.log("must signin");
    res.redirect("/users/signin");
    return;
  }
  var massageError = req.flash("addProductError");
  res.render("addProduct", {
    massages: massageError,
    checkUser: req.isAuthenticated(),
    checkRole: true,
  });
});

router.post(
  "/addProduct",
  [
    check("name").not().isEmpty().withMessage("Please enter product name"),
    check("imgPath")
      .not()
      .isEmpty()
      .withMessage("Please enter product imgPath"),
    check("screen").not().isEmpty().withMessage("Please enter product screen"),
    check("system").not().isEmpty().withMessage("Please enter product system"),
    check("storage")
      .not()
      .isEmpty()
      .withMessage("Please enter product storage"),
    check("RAM").not().isEmpty().withMessage("Please enter product RAM"),
    check("processor")
      .not()
      .isEmpty()
      .withMessage("Please enter product processor"),
    check("selfieCamera")
      .not()
      .isEmpty()
      .withMessage("Please enter product selfieCamera"),
    check("battery")
      .not()
      .isEmpty()
      .withMessage("Please enter product battery"),
    check("price").not().isEmpty().withMessage("Please enter product price"),
  ],
  async (req, res, next) => {
    console.log(`system ${req.body.system}`);
    if (!req.isAuthenticated()) {
      console.log("must signin");
      res.redirect("/users/signin");
      return;
    }
    const errors = validationResult(req);
    var validationMsg = [];
    if (!errors.isEmpty()) {
      for (var i = 0; i < errors.errors.length; i++) {
        validationMsg.push(errors.errors[i].msg);
      }
      req.flash("addProductError", validationMsg);
      res.redirect("addProduct");
      return;
    }
    Product.findOne({ productName: req.body.name }).then((product) => {
      if (product) {
        console.log(`product${product}`);
      } else {
        const newProduct = new Product({
          imgPath: "/images/" + req.body.imgPath + ".jpg",
          productName: req.body.name,
          productDescription: {
            screen: req.body.screen,
            system: req.body.system,
            storage: req.body.storage,
            RAM: req.body.RAM,
            processor: req.body.processor,
            selfieCamera: req.body.selfieCamera,
            battery: req.body.battery,
          },
          productPrice: req.body.price,
        });
        newProduct
          .save()
          .then((doc) => {
            console.log(doc);
          })
          .catch((err) => {
            console.error(err);
          });
        res.redirect("/");
      }
    });
  }
);

router.get("/removeProduct/:id", async (req, res, next) => {
  await Product.deleteOne({ _id: req.params.id }).then(() => {
    res.redirect("/");
  });
});

module.exports = router;

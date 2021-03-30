const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.findAll();
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'some title',
      path: '/products',
      isLoggedIn: req.session.isLoggedIn,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findByPk(prodId)
    .then((product) => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products',
        isLoggedIn: req.session.isLoggedIn,
      });
    })
    .catch((err) => console.log(err));
};

exports.getIndex = async (req, res, next) => {
  try {
    const products = await Product.findAll();
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/',
    });
  } catch (e) {
    console.log(e);
  }
};

exports.getCart = async (req, res, next) => {
  try {
    const cart = await req.user.getCart();
    res.render('shop/cart', {
      path: '/cart',
      pageTitle: 'Your Cart',
      products: cart ? await cart.getProducts() : [],
      isLoggedIn: req.session.isLoggedIn,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.postCart = async (req, res, next) => {
  try {
    const prodId = req.body.productId;
    const userCart = await Cart.findOne({ where: { userId: req.user.id } });
    console.log(userCart);
    if (!userCart) {
      const cart = await req.user.createCart();

      const newProd = await Product.findByPk(prodId);
      await cart.addProduct(newProd, { through: { quantity: newQuantity } });
    }
    const cart = await req.user.getCart();
    const products = await cart.getProducts({ where: { id: prodId } });
    let product;
    let newQuantity = 1;

    if (products.length > 0) {
      product = products[0];
    }

    if (product) {
      const oldQuantity = product.cartItem.quantity;
      newQuantity = oldQuantity + 1;
      await cart.addProduct(product, { through: { quantity: newQuantity } });
      return res.redirect('/cart');
    }

    const newProd = await Product.findByPk(prodId);
    await cart.addProduct(newProd, { through: { quantity: newQuantity } });

    res.redirect('/cart');
  } catch (e) {
    console.log(e);
  }
};

exports.postCartDeleteProduct = async (req, res, next) => {
  const prodId = req.body.productId;
  try {
    const cart = await req.user.getCart();
    const products = await cart.getProducts({ where: { id: prodId } });
    const product = products[0];
    await product.cartItem.destroy();
    res.redirect('/cart');
  } catch (e) {
    console.log(e);
  }
};

exports.postOrder = async (req, res, next) => {
  try {
    const cart = await req.user.getCart();
    const products = await cart.getProducts();
    const order = await req.user.createOrder();
    await order.addProducts(
      products.map((product) => {
        product.orderItem = { quantity: product.cartItem.quantity };
        return product;
      })
    );
    await cart.setProducts(null);
  } catch (e) {
    console.log(e);
  }

  res.redirect('/orders');
};

exports.getOrders = async (req, res, next) => {
  try {
    const orders = await req.user.getOrders({ include: ['products'] });
    console.log(orders);
    return res.render('shop/orders', {
      path: '/orders',
      pageTitle: 'Your Orders',
      orders: orders,
      isLoggedIn: req.session.isLoggedIn,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout',
    isLoggedIn: req.isLoggedIn,
  });
};

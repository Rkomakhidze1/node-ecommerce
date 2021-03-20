const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const csrf = require("csurf");
const flash = require("connect-flash");
const SequelizeStore = require("connect-session-sequelize")(session.Store);

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoute = require("./routes/auth");

const errorController = require("./controllers/error");
const sequelize = require("./util/database");
const User = require("./models/user");
const Product = require("./models/product");
const Cart = require("./models/cart");
const CartItem = require("./models/cart-item");
const Order = require("./models/order");
const OrderItem = require("./models/order-item");
const isAuth = require("./middleware/is-auth");

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

const app = express();

const csrfProtection = csrf();

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    resave: false,
    secret: "some secret string",
    saveUninitialized: false,
    store: new SequelizeStore({
      db: sequelize,
    }),
  })
);

app.use(csrfProtection);
app.use(flash());

app.use(async (req, res, next) => {
  try {
    if (req.session.user) {
      req.user = await User.findByPk(req.session.user.id);
      return next();
    }

    next();
  } catch (e) {
    console.log(e);
  }
});

app.use((req, res, next) => {
  (res.locals.isLoggedIn = req.session.isLoggedIn),
    (res.locals.csrfToken = req.csrfToken()),
    next();
});

app.use("/admin", isAuth, adminRoutes);
app.use(shopRoutes);
app.use(authRoute);

app.use(errorController.get404);

Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });

sequelize
  // .sync({ force: true })
  .sync()
  .then(() => {
    app.listen(4001);
  })
  .catch((err) => {
    console.log(err);
  });

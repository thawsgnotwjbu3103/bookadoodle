if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const LocalStrategy = require('passport-local');
const passport = require('passport');
const ExpressError = require("./utils/ExpressError");
const {getAllGenre, setUser} = require("./middleware");
const User = require("./models/user.model");
const port = process.env.PORT || 3000;
const helmet = require("helmet");
const mongoSanitize = require('express-mongo-sanitize');
const adminRoute = require("./routes/admin.route");
const userRoute = require("./routes/user.route");
const shopRoute = require("./routes/shop.route");

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  ignoreUndefined: true,
});

const db = mongoose.connection;
db.on("error", (err) => {
  console.log(err);
});
db.once("open", () => {
  console.log("Database connected");
});

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize({
  replaceWith: "_",
}))

const store = new MongoStore({
  mongoUrl: process.env.MONGO_URL,
  secret: process.env.SECRET_KEY,
  touchAfter: 24 * 60 * 60,
});

store.on("error", function(e){
  console.log(e);
});

app.use(session({
  store: store,
  name: "session",
  resave: false,
  secret: process.env.SECRET_KEY,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 86400000,
  }
}));
app.use(flash());
app.use(helmet({crossOriginEmbedderPolicy: false}));

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com",
  "https://api.tiles.mapbox.com",
  "https://api.mapbox.com",
  "https://kit.fontawesome.com",
  "https://cdnjs.cloudflare.com",
  "https://cdn.jsdelivr.net",
  "https://ajax.googleapis.com",
  "https://cdn.ckeditor.com",
  "https://cdn.datatables.net",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com",
  "https://stackpath.bootstrapcdn.com",
  "https://api.mapbox.com",
  "https://api.tiles.mapbox.com",
  "https://fonts.googleapis.com",
  "https://use.fontawesome.com",
  "https://cdn.jsdelivr.net",
  "https://cdn.datatables.net",
  "https://cdn.ckeditor.com",
];
const connectSrcUrls = [
  "https://api.mapbox.com",
  "https://*.tiles.mapbox.com",
  "https://events.mapbox.com",
  "https://ka-f.fontawesome.com",
];
const fontSrcUrls = [
  "https://cdn.jsdelivr.net",
  "https://ka-f.fontawesome.com",
];

app.use(
  helmet.contentSecurityPolicy({
      directives: {
          defaultSrc: [],
          connectSrc: ["'self'", ...connectSrcUrls],
          scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
          styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
          workerSrc: ["'self'", "blob:"],
          childSrc: ["blob:"],
          objectSrc: [],
          imgSrc: [
              "'self'",
              "blob:",
              "data:",
              "https://res.cloudinary.com/dbivuiucl/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
              "https://images.unsplash.com",
              "https://cdn.ckeditor.com",
          ],
          fontSrc: ["'self'", ...fontSrcUrls],
      },
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  if (!["/login", "/register", "/", "/favicon.ico"].includes(req.originalUrl)) {
      req.session.returnTo = req.originalUrl;
  }
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
})


app.use("/admin", adminRoute);
app.use("/", userRoute);

app.use("/", getAllGenre,setUser,shopRoute);

app.all('*', (req, res, next) => {
  next(new ExpressError("Không tìm thấy trang này", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Có lỗi xảy ra, vui lòng thử lại sau";
  res.status(statusCode).render('error', { err })
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

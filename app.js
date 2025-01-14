const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const expressSession = require("express-session");
const path = require("node:path");
const assetPath = path.join(__dirname, "/public");
const router = require("./routes/router");
const passport = require("./config/passport");
require("dotenv").config();
const app = express();
app.use(express.static(assetPath));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  expressSession({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
    resave: true,
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    store: new PrismaSessionStore(new PrismaClient(), {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  })
);

app.use(passport.session());
app.use(router);

const PORT = process.env.PORT || 3001 ;

app.listen(PORT, () => console.log(`File-Nest running on PORT: ${PORT}`));

const express = require("express");
const app = express();
const router = require("./routes/router");
const path = require("node:path");
const assetPath = path.join(__dirname, "public");

app.use(express.static(assetPath));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(router);    

const PORT = 3000;

app.listen(PORT, () => console.log(`File-Nest running on PORT: ${PORT}`));

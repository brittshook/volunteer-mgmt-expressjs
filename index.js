const express = require("express");
const bodyParser = require("body-parser");
const mustacheExpress = require("mustache-express");

const users = require("./routes/users");
const admin = require("./routes/admin");
const volunteer = require("./routes/volunteer");
const error = require("./utils/error");

const app = express();
const port = 3000;

app.engine("mustache", mustacheExpress());
app.set("view engine", "mustache");
app.set("views", "./views");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ extended: true }));

app.use("/api/users", users);
app.use("/api/admin", admin);
app.use("/api/volunteer", volunteer);
app.get("/signup", (req, res) => {
  res.render("form.mustache");
});

app.use((req, res, next) => {
  next(error(404, "Resource not found"));
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({ error: err.message });
});

app.listen(port, () => console.log(`Server is listening on port: ${port}`));

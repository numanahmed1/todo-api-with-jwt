const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const todoHandler = require("./routeHandler/todoHandler");
const userHandler = require("./routeHandler/userHandler");

const app = express();
dotenv.config();
const port = 3000;
app.use(express.json());

// database connection
mongoose
  .connect("mongodb://localhost/todos", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connection successful");
  })
  .catch((err) => console.log(err));

// application routes
app.use("/todo", todoHandler);
app.use("/user", userHandler);

// error handler
const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  } else {
    res.status(500).send({ error: err });
  }
};

app.use(errorHandler);

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`);
});

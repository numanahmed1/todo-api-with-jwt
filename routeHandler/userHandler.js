const mongoose = require("mongoose");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userSchema = require("../schemas/userSchema");
const router = express.Router();

// model for object mapping
const User = new mongoose.model("User", userSchema);

// Signup
router.post("/signup", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const newUser = new User({
      name: req.body.name,
      username: req.body.username,
      password: hashedPassword,
      status: req.body.status,
    });

    await newUser.save();
    res.status(200).json({
      message: "User created successfully.",
    });
  } catch (error) {
    res.status(500).json({
      error: "There was a server side error",
    });
  }
});

// Logon
router.post("/login", async (req, res) => {
  try {
    const user = await User.find({ username: req.body.username });

    if (user && user.length > 0) {
      const isValidPass = await bcrypt.compare(
        req.body.password,
        user[0].password
      );
      if (isValidPass) {
        // generate token
        const token = jwt.sign(
          {
            username: user[0].username,
            userId: user[0]._id,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "1h",
          }
        );

        res.status(200).json({
          access_token: token,
          message: "Login successful",
        });
      } else {
        res.status(401).json({
          error: "Authentication failed",
        });
      }
    } else {
      res.status(401).json({
        error: "Authentication failed",
      });
    }
  } catch (error) {
    res.status(401).json({
      error: "Authentication failed",
    });
  }
});

// get all user
router.get("/all", async (req, res) => {
  try {
    const users = await User.find({ status: "active" }).populate("todos");

    res.status(200).json({
      data: users,
      message: "Success",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "There was an error on server side!",
    });
  }
});

module.exports = router;

const mongoose = require("mongoose");
const express = require("express");
const todoSchema = require("../schemas/todoschema");
const checkLogin = require("../middleware/checkLogin");
const userSchema = require("../schemas/userSchema");
const router = express.Router();

// model for object mapping
const Todo = new mongoose.model("Todo", todoSchema);
const User = new mongoose.model("User", userSchema);

// get all todo
router.get("/", checkLogin, (req, res) => {
  Todo.find({})
    .populate("user", "name username -_id")
    .select({
      _id: 0,
      __v: 0,
      data: 0,
    })
    .limit(8)
    .exec((err, data) => {
      if (err) {
        res.status(500).json({
          error: "There was a server side error",
        });
      } else {
        res.status(200).json({
          result: data,
          message: "Successfully get all data.",
        });
      }
    });
});

// get active todo
router.get("/active", async (req, res) => {
  const todo = new Todo();
  const data = await todo.findActive();
  res.status(200).json({
    data: data,
  });
});

// get inactive todo with callback
router.get("/inactive", (req, res) => {
  const todo = new Todo();
  todo.findInactive((err, data) => {
    res.status(200).json({
      data,
    });
  });
});

// get js in todo title
router.get("/js", async (req, res) => {
  const data = await Todo.findByJs();
  res.status(200).json({
    data,
  });
});

// check language in title
router.get("/language", async (req, res) => {
  const data = await Todo.find().byLanguage("react");
  res.status(200).json({
    data,
  });
});

// get single todo
router.get("/:id", async (req, res) => {
  try {
    const data = await Todo.find({ _id: req.params.id });
    res.status(200).json({
      result: data,
      message: "successfully get a data by id",
    });
  } catch (err) {
    res.status(500).json({
      error: "There was a server side error.",
    });
  }
});

// POST todo
router.post("/", checkLogin, async (req, res) => {
  const newTodo = new Todo({
    ...req.body,
    user: req.userId,
  });
  try {
    const todo = await newTodo.save();
    await User.updateOne(
      {
        _id: req.userId,
      },
      {
        $push: {
          todos: todo._id,
        },
      }
    );

    res.status(200).json({
      message: "Todo was inserted successfully.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "There was a server side error",
    });
  }
});

// POST multiple todo
router.post("/all", (req, res) => {
  Todo.insertMany(req.body, (err) => {
    if (err) {
      res.status(500).json({
        error: "There was a server side error",
      });
    } else {
      res.status(200).json({
        message: "Todos were inserted successfully.",
      });
    }
  });
});

// PUT todo
router.put("/:id", async (req, res) => {
  const result = await Todo.findByIdAndUpdate(
    { _id: req.params.id },
    {
      $set: {
        status: "active",
      },
    },
    {
      new: true,
      useFindAndModify: false,
    },
    (err) => {
      if (err) {
        res.status(500).json({
          error: "There was a server side error",
        });
      } else {
        res.status(200).json({
          message: "Todo was updated successfully.",
        });
      }
    }
  );
  console.log(result);
});

// DELETE todo
router.delete("/:id", (req, res) => {
  Todo.deleteOne({ _id: req.params.id }, (err) => {
    if (err) {
      res.status(500).json({
        error: "There was a server side error",
      });
    } else {
      res.status(200).json({
        message: "Todo was deleted successfully.",
      });
    }
  });
});

module.exports = router;

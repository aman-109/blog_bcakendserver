const express = require("express");
const User = require("../user/user.model");
const Blog = require("./blog.model");
const jwt=require("jsonwebtoken")

let blacklist = [];
const authMiddleware = async (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(401).send("Unauthorized");
  }
  if (blacklist.includes(token)) {
    return res.status(401).send("Token Expired");
  }
  try {
    const verification = await jwt.verify(token, "BLOG109");
    if (verification) {
      req.userId = verification.id;
      next();
    } else {
      res.status(401).send("Operation not allowed.");
    }
  } catch (e) {
    return res.send(e.message);
  }
};

const app = express.Router();

app.use(authMiddleware);

////GET////
app.get("/", async (req, res) => {
  const { page = 1, limit = 5 } = req.query;
  try {
    let data = await Blog.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({ path: "author", select: "name" });
    res.send(data);
  } catch (e) {
    res.status(500).send(e.message);
  }
});
///GET /:id
app.get("/:id", async (req, res) => {
  try {
    let existingBlog = await Blog.findById(req.params.id);
    if (!existingBlog) {
      res.status(401).send("Blog not found");
    } else {
      let data = await Blog.findById(req.params.id).populate({
        path: "author",
        select: "name",
      });
      res.send(data);
    }
  } catch (e) {
    res.status(500).send(e.message);
  }
});

////POST///
app.post("/", async (req, res) => {
  let { content } = req.body;
  // console.log(content)
  try {
    let existingBlog = await Blog.findOne({ content });
    if (existingBlog) {
      res.status(401).send("Blog already created");
    } else {
      let newBlog = await Blog.create({ ...req.body, author: req.userId });
      // .populate({path:"author", select:"name"})

      res.status(201).send(newBlog);
    }
  } catch (e) {
    res.status(500).send(e.message);
  }
});

////DELETE
app.delete("/:id", async (req, res) => {
  try {
    let deleteBlog = await Blog.findByIdAndDelete(req.params.id);

    res
      .status(201)
      .send(`This Blog with id:${deleteBlog.id} deleted successfully`);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

///PATCH
app.patch(":id", async (req, res) => {
  let id = req.params.id;
  try {
    let updatedBlog = await Blog.findByIdAndUpdate(
      id,
      {
        ...req.body,
      },
      { new: true }
    ).populate({ path: "author", select: ["name", "email", "gender"] });

    res.send(updatedBlog);
  } catch (e) {
    res.status(404).send(e.message);
  }
});

module.exports = app;

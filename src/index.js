require("dotenv").config()
const express = require("express");
const cors =require("cors")
const userRouter = require("./features/user/user.route");
const blogRouter = require("./features/blog/blog.route");

const connect = require("./config/db");
const PORT=process.env.PORT || 8080

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors())
app.use("/users", userRouter);
app.use("/blogs", blogRouter);

app.listen(PORT, async () => {
  await connect();
  console.log(`Listening to http://localhost:${PORT}`);
});


const express = require("express");
const User = require("./user.model");
const jwt = require("jsonwebtoken");
const blacklist = [];
const passport =require("../../utils/googleOAuth")

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

app.post("/signup", async (req, res) => {
  const { name, email, password, age, gender } = req.body;

  try {
    let user = await User.findOne({ email, password });
    if (user) {
      return res.status(409).send("User Already Created");
    } else {
      const newUser = new User({ name, email, password, age, gender });

      await newUser.save();
      return res.status(201).send({message:"User created successfully",data:newUser});
    }
  } catch (e) {
    return res.send(`${e.status} ${e.message}`);
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email, password });
  if (user) {
    const token = jwt.sign(
      { id: user._id, name: user.name, age: user.age },
      "BLOG109",
      {
        //also give EXP in response
        expiresIn: "1 hr",
      }
    );

    const refreshToken = jwt.sign({}, "BLOGREFRESHTOKEN109", {
      expiresIn: "7 days",
    });
    return res.send({ message: "Login Successfully", token, refreshToken });
  }
  return res.status(401).send("invalid Credentials");
});

//for refresh token

app.post("/refresh", (req, res) => {
  const refreshToken = req.headers["authorization"];
  if (!refreshToken) {
    return res.status(401).send("unauthorized");
  }
  try {
    const verification = jwt.verify(refreshToken, "BLOGREFRESHTOKEN109");
    console.log(verification);
    if (verification) {
      const newToken = jwt.sign(
        { id: verification.id, name: verification.name, age: verification.age },
        "BLOG109",
        { expiresIn: "1 hr" }
      );
      return res.send({ token: newToken });
    }
  } catch (e) {
    res.send(e.message);
  }
});

//for github

app.get("/github/callback", async (req, res) => {
  const { code } = req.query;
  // console.log('code:', code)

  const { access_token } = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        code,
      }),
    }
  )
    .then((x) => x.json())
    .catch(console.error);

  // console.log("Access",access_token)

  const userData = await fetch(`https://api.github.com/user`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  })
    .then((x) => x.json())
    .catch((e) => console.error);
  // console.log(userData)

  return res.send(userData);
});

//for google signIn
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile','email'] }));
  

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login', session:false }),
   function(req, res) {
    // Successful authentication, redirect home.
    // console.log(req);
  //  await res.send(req.payload)
  // console.log(req.user)
  res.send(req.user)
  res.redirect('http://localhost:3000');
  });

module.exports = app;

require("dotenv").config()
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport=require("passport");
// const UserModel = require("./user.model");
// const { v4: uuidv4 } = require('uuid');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SCERET,
    callbackURL: "https://blogapplicationserver-mzdy.onrender.com/users/auth/google/callback"
  },
  async function(accessToken, refreshToken, profile, cb) {

    //creating new user
    let email=profile._json.email

    // const user= new UserModel({
    //     email,
    //     password:uuidv4()
    // })
    // await user.save()

    // let {_id,password}=user
    let payload={
        email,
        // _id,
        // password,
        url:profile._json.picture

    }
      return cb(null, payload);
    // console.log(payload)
    
    // console.log(profile);
  }
));

module.exports=passport
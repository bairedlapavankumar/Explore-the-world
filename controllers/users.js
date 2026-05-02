const User = require("../models/user");
module.exports.renderForm=(req, res) => {
    res.render("users/signup.ejs");
};
module.exports.signup=async(req,res)=>{
    try{
    let{username,email,password,role}=req.body;
const newUser = new User({email,username,role});
const registeredUser=await User.register(newUser,password);
console.log(registeredUser);
req.login(registeredUser,(err)=>{
    if(err){
        return next(err);
    }
    req.flash("success","Welcome to Wanderlust");
res.redirect("/dashboard");
});

    }catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    }
    
};
module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
  };
  


module.exports.login=async (req, res) => {
    req.flash("success","Welcome to Wanderlust! You are logged in.");
    res.redirect("/dashboard");
  };


  module.exports.logout=(req,res,next)=>{
    req.logout((err)=>{
        if(err){
          return  next(err);
        }
        req.flash("success","you are logged out!");
        res.redirect("/listings");
    });
    };
const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware.js");
const Listing = require("../models/listing");
const User = require("../models/user");

// Base dashboard route to redirect based on role
router.get("/", isLoggedIn, (req, res) => {
    if (req.user.role === 'owner') {
        res.redirect("/dashboard/owner");
    } else if (req.user.role === 'admin') {
        res.redirect("/dashboard/admin");
    } else {
        res.redirect("/dashboard/user");
    }
});

// User Dashboard
router.get("/user", isLoggedIn, (req, res) => {
    if (req.user.role !== 'user' && req.user.role !== 'admin') {
        req.flash("error", "You do not have permission to view the user dashboard.");
        return res.redirect("/dashboard");
    }
    // Placeholder for travel details. Can be expanded later.
    res.render("users/user_dashboard.ejs");
});

// Owner Dashboard
router.get("/owner", isLoggedIn, async (req, res) => {
    if (req.user.role !== 'owner' && req.user.role !== 'admin') {
        req.flash("error", "You do not have permission to view the owner dashboard.");
        return res.redirect("/dashboard");
    }
    const listings = await Listing.find({ owner: req.user._id });
    res.render("users/owner_dashboard.ejs", { listings });
});

// Admin Dashboard
router.get("/admin", isLoggedIn, async (req, res) => {
    if (req.user.role !== 'admin') {
        req.flash("error", "You do not have permission to view the admin dashboard.");
        return res.redirect("/dashboard");
    }
    const users = await User.find({});
    res.render("users/admin_dashboard.ejs", { users });
});

module.exports = router;

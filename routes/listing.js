const express = require("express");
const router = express.Router();
const warpAsync = require("../utils/warpAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema, reviewSchema}  = require("../schema.js");
const Listing = require('../models/listing.js');
const Review = require('../models/review.js');
const {isLoggedIn} = require("../middleware.js");
const {isOwner}= require("../middleware.js");


const validateListing =(req, res, next) =>{
  let result = listingSchema.validate(req.body);
  console.log(result);
  let {error}= result;
  if(error){
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

const validateReview =(req, res, next) =>{
  let result = reviewSchema.validate(req.body);
  console.log(result);
  let {error}= result;
  if(error){
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

//Index Route
router.get("/", warpAsync(async (req, res) => {
  const allListing = await Listing.find({});
  res.render("listings/index.ejs", { allListing });
}));

//New Route
router.get("/new", isLoggedIn, (req, res) => {
  res.render("listings/new.ejs");
});

//Show Route
router.get("/:id", warpAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
  .populate({path:"reviews",
    populate:{
        path:"author",
  },
})
  .populate("owner");
  if(!listing){
    req.flash("error", "Listing does not exist");
    res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
}));

//Create Route
router.post("/", validateListing, isLoggedIn, warpAsync(async (req, res, next) => {
  let url = req.body.listing.image;
  const newListing = new Listing(req.body.listing);
  if (url !== undefined) {
    newListing.image = { url };
  }
  newListing.owner = req.user._id;
  await newListing.save();
  req.flash("success", "New Listing created!");
  res.redirect("/listings")
}));

//Edit Route
router.get("/:id/edit", isLoggedIn, isOwner ,warpAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
   if(!listing){
    req.flash("error", "Listing does not exist");
    res.redirect("/listings");
  }
  res.render("listings/edit.ejs", { listing });
}));

//Update Route
router.put("/:id", isLoggedIn,isOwner ,validateListing, warpAsync(async (req, res) => {
  if (!req.body.listing) {
    throw new ExpressError(400, "send valid data for listing")
  }
  let { id } = req.params;
  let url = req.body.listing.image;
  let updatedListing = { ...req.body.listing };
  if (url !== undefined) {
    updatedListing.image = { url };
  }
  await Listing.findByIdAndUpdate(id, updatedListing);
  req.flash("success", "Listing Updated!");
   return res.redirect(`/listings/${id}`);
}));


//Delete Route
router.delete("/:id", isLoggedIn,isOwner , warpAsync(async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
}));



module.exports = router;
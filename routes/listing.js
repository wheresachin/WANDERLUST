const express = require("express");
const router = express.Router();
const warpAsync = require("../utils/warpAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema, reviewSchema}  = require("../schema.js");
const Listing = require('../models/listing.js');
const Review = require('../models/review.js');


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
router.get("/new", (req, res) => {
  res.render("listings/new.ejs");
});

//Show Route
router.get("/:id", warpAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id).populate("reviews");
  res.render("listings/show.ejs", { listing });
}));

//Create Route
router.post("/", validateListing, warpAsync(async (req, res, next) => {
  const newListing = new Listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings")
}));

//Edit Route
router.get("/:id/edit",validateListing, warpAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
}));

//Update Route
router.put("/:id", warpAsync(async (req, res) => {
  if (!req.body.listing) {
    throw new ExpressError(400, "send valid data for listing")
  }
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${id}`);
}));


//Delete Route
router.delete("/:id", warpAsync(async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect("/listings");
}));



module.exports = router;
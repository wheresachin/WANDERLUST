const express = require("express");
const router = express.Router();
const warpAsync = require("../utils/warpAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema, reviewSchema}  = require("../schema.js");
const Listing = require('../models/listing.js');
const Review = require('../models/review.js');
const {isLoggedIn} = require("../middleware.js");
const {isOwner}= require("../middleware.js");
const listingController = require("../controllers/listings.js")


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
router.get("/",warpAsync(listingController.index));

//New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);

//Show Route
router.get("/:id", warpAsync(listingController.showListing));

//Create Route
router.post("/", validateListing, isLoggedIn, warpAsync(listingController.createlisting));

//Edit Route
router.get("/:id/edit", isLoggedIn, isOwner ,warpAsync(listingController.editlisting));

//Update Route
router.put("/:id", isLoggedIn,isOwner ,validateListing, warpAsync(listingController.updatelisting));


//Delete Route
router.delete("/:id", isLoggedIn,isOwner , warpAsync(listingController.deletelisting));



module.exports = router;
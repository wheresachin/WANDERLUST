const express = require("express");
const router = express.Router();
const warpAsync = require("../utils/warpAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema, reviewSchema}  = require("../schema.js");
const Listing = require('../models/listing.js');
const Review = require('../models/review.js');
const {isLoggedIn} = require("../middleware.js");
const {isOwner}= require("../middleware.js");
const listingController = require("../controllers/listings.js");

const multer  = require('multer');
const { storage } = require("../cloudconfig.js");
const upload = multer({ storage });


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

router
.route("/")
.get(warpAsync(listingController.index))
.post(isLoggedIn,validateListing, upload.single('listing[image]'), warpAsync(listingController.createlisting)
);


//New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);

router
.route("/:id")
.get(warpAsync(listingController.showListing))
.put(isLoggedIn,isOwner, upload.single('listing[image]'),validateListing, warpAsync(listingController.updatelisting))
.delete(isLoggedIn,isOwner , warpAsync(listingController.deletelisting)
);

//Edit Route
router.get("/:id/edit", isLoggedIn, isOwner ,warpAsync(listingController.editlisting));

module.exports = router;
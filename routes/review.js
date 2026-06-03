const express = require("express");
const router = express.Router();
const ExpressError = require("../utils/ExpressError.js");
const warpAsync = require("../utils/warpAsync.js");
const listings = require("../routes/listing.js");
const review = require("../models/review.js");

//review
router.post("/:id/reviews", validateReview, warpAsync(async (req, res) => {
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);
  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();
  console.log("new review saved");
   res.redirect(`/listings/${listing._id}`);
}));

//Delete Reviews
router.delete("/:id/reviews/:reviewId", warpAsync(async (req, res) =>{
  let {id, reviewId} = req.params;
  await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
  await Review.findByIdAndDelete(reviewId);

  res.redirect(`/listings/${id}`);
}));

module.exports = router;
const express = require("express");
const router = express.Router({ mergeParams: true});
const ExpressError = require("../utils/ExpressError.js");
const warpAsync = require("../utils/warpAsync.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const { reviewSchema } = require("../schema.js");
const { isLoggedIn,isReviewAuthor } = require("../middleware.js");

const validateReview = (req, res, next) => {
  let result = reviewSchema.validate(req.body);
  console.log(result);
  let { error } = result;
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// Create Review Route (POST /listings/:id/reviews)
router.post("/", isLoggedIn,validateReview, warpAsync(async (req, res) => {
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);
  newReview.author = req.user._id;
  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();
  console.log("new review saved");
  req.flash("success", "New Review created!");
  res.redirect(`/listings/${listing._id}`);
}));

// Delete Review Route (DELETE /listings/:id/reviews/:reviewId)
router.delete("/:reviewId", isLoggedIn,isReviewAuthor,warpAsync(async (req, res) => {
  let { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Review Deleted!");
  res.redirect(`/listings/${id}`);
}));

module.exports = router;
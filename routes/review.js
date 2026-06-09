const express = require("express");
const router = express.Router({ mergeParams: true});
const ExpressError = require("../utils/ExpressError.js");
const warpAsync = require("../utils/warpAsync.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const { reviewSchema } = require("../schema.js");
const { isLoggedIn,isReviewAuthor } = require("../middleware.js");
const reviewcontroller = require("../controllers/review.js");

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
router.post("/", isLoggedIn,validateReview, warpAsync(reviewcontroller.createReview));

// Delete Review Route (DELETE /listings/:id/reviews/:reviewId)
router.delete("/:reviewId", isLoggedIn,isReviewAuthor,warpAsync(reviewcontroller.deletereview));

module.exports = router;
const Listing = require("./models/listing");
const review = require("./models/review");
const Review = require("./models/review");
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "you must be logined in to create listing");
    return res.redirect("/login");
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

module.exports.isOwner = async (req,res, next)=>{
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if(!currUser && listing.owner._id.equals(res.localscurrUser._id));{
    req.flash("error", "you dont have to permission to edit");
    res.redirect(`/listings/${id}`);
  }
  next();
};

module.exports.isReviewAuthor = async (req,res, next)=>{
  let { id, reviewId } = req.params;
  let review = await review.findById(reviewId);
  if(!review.author.equals(res.locals.currUser._id)){
    req.flash("error", "you did not create this review");
    res.redirect(`/listings/${id}`);
  }
  next();
};
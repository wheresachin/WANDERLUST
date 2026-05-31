const express = require("express");
const app = express();
const mongoose = require('mongoose');
const Listing = require('./models/listing.js');
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utils/warpAsync.js');
const warpAsync = require("./utils/warpAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema}  = require("./schema.js");
const Review = require('./models/review.js');

const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  })


async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine", 'ejs');
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

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
}


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
}

//Index Route
app.get("/listings", warpAsync(async (req, res) => {
  const allListing = await Listing.find({});
  res.render("listings/index.ejs", { allListing });
}));

//New Route
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

//Show Route
app.get("/listings/:id", warpAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id).populate("reviews");
  res.render("listings/show.ejs", { listing });
}));

//Create Route
app.post("/listings", validateListing, warpAsync(async (req, res, next) => {
  const newListing = new Listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings")
}));

//Edit Route
app.get("/listings/:id/edit",validateListing, warpAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
}));

//Update Route
app.put("/listings/:id", warpAsync(async (req, res) => {
  if (!req.body.listing) {
    throw new ExpressError(400, "send valid data for listing")
  }
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${id}`);
}));


//Delete Route
app.delete("/listings/:id", warpAsync(async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect("/listings");
}));

//review

app.post("/listings/:id/reviews", validateReview, wrapAsync(async (req, res) => {
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);
  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();
  console.log("new review saved");
   res.redirect(`/listings/${listing._id}`);
}));

//Delete Reviews
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async (req, res) =>{
  let {id, reviewId} = req.params;
  await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
  await Review.findByIdAndDelete(reviewId);

  res.redirect(`/listings/${id}`);
}));

app.all("*any", (req, res, next) => {
  next(new ExpressError(404, "Page not found!"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

// app.get("/listing", (req,res)=>{
//     let sampleListing = new Listing({
//         title: "my new villa",
//         description: "By the beach",
//         price:1200,
//         location: 'calangute, goa',
//         country: "india",
//     });
//     sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// });

// app.use((err, req, res, next)=>{
//   res.send("something went wrong");
// })

app.listen(8080, () => {
  console.log("sever is listening to port 8080");
});
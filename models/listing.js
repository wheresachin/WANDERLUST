const mongoose = require("mongoose");
const review = require("./review");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },

  description: {
    type: String,
  },

  image: {
    filename: {
      type: String,
      default: "listingimage",
    },

    url: {
      type: String,

      default:
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",

      set: (v) =>
        v === ""
          ? "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"
          : v,
    },
  },

  price: {
    type: Number,
  },

  location: {
    type: String,
  },

  country: {
    type: String,
  },
  reviews:[
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    }
  ]
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;

listingSchema.post("findOneAndDelete", async(listing) =>{
  if(listing){
     await Review.deleteMay({_id:{$in: listing.reviews}});
  }

});
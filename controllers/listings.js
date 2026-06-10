const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
  const allListing = await Listing.find({});
  res.render("listings/index.ejs", { allListing });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
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
};

module.exports.createlisting = async (req, res, next) => {
  let url =req.file.path;
  let filename= req.file.filename;
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = {url,filename};
  await newListing.save();
  req.flash("success", "New Listing created!");
  res.redirect("/listings")
};

module.exports.editlisting = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
   if(!listing){
    req.flash("error", "Listing does not exist");
    res.redirect("/listings");
  }
  res.render("listings/edit.ejs", { listing });
};

module.exports.updatelisting = async (req, res) => {
  let { id } = req.params;
  let updatedListing = { ...req.body.listing };
  let listing = await Listing.findByIdAndUpdate(id, updatedListing);
  if(typeof req.file !=="undefined"){
  let url =req.file.path;
  let filename= req.file.filename;
  listing.image= {url,filename};
  await listing.save();
  }
 
  req.flash("success", "Listing Updated!");
   return res.redirect(`/listings/${id}`);
};

module.exports.deletelisting = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
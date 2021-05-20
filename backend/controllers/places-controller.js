const fs = require("fs");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");

const Place = require("../models/place");
const User = require("../models/user");

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (error) {
    return next(
      new HttpError("something went wrong, could not find a place.", 500)
    );
  }

  if (!place) {
    return next(
      new HttpError("Could not find a place for the provided id.", 404)
    );
  }

  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let user;
  try {
    user = await User.findById(userId).populate("places");
  } catch (error) {
    return next(
      new HttpError("fetching places failed, please try again.", 500)
    );
  }

  if (!user || user.places.length === 0) {
    return next(
      new HttpError("could not find any place for the user id.", 404)
    );
  }

  res.json({
    places: user.places.map((place) => place.toObject({ getters: true })),
  });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("invalid inputs passed. please check your data", 422)
    );
  }

  const { title, description, address, creator } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: req.file.path,
    creator,
  });

  let user;
  try {
    user = await User.findById(creator);
  } catch (error) {
    return next(new HttpError("creating place failed, please try again", 500));
  }
  if (!user) {
    return next(new HttpError("could not find user for provided id", 404));
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await createdPlace.save({ session: session });
    user.places.push(createdPlace);
    await user.save({ session: session });
    await session.commitTransaction();
  } catch (error) {
    return next(new HttpError("creating place failed, please try again.", 500));
  }

  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("invalid inputs passed. please check your data", 422)
    );
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (error) {
    return next(new HttpError("something went wrong, could not update.", 500));
  }

  if (place.creator.toString() !== req.userData.userId) {
    return next(new HttpError("you are not allowed to edit this place.", 401));
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (error) {
    return next(new HttpError("something went wrong, could not update.", 500));
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId).populate("creator");
  } catch (error) {
    return next(
      new HttpError("something went wrong, could not delete place", 500)
    );
  }

  if (!place) {
    return next(new HttpError("could not find place for this id", 404));
  }

  if (place.creator.id !== req.userData.userId) {
    return next(new HttpError("you are not allowed to delete this place.", 401));
  }

  const imagePath = place.image;

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await place.remove({ session: session });
    place.creator.places.pull(place);
    await place.creator.save({ session: session });
    await session.commitTransaction();
  } catch (error) {
    return next(
      new HttpError("something went wrong, could not delete place", 500)
    );
  }

  fs.unlink(imagePath, (error) => {
    console.log(error);
  });

  res.status(200).json({ message: "Deleted place" });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;

const uuid = require("uuid").v4;
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const User = require("../models/user");

const DUMMY_USERS = [
  {
    id: "u1",
    name: "umut akin",
    email: "asd@asd.com",
    password: "test1234",
  },
];

const getUsers = (req, res, next) => {
  res.json({ users: DUMMY_USERS });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("invalid inputs passed. please check your data", 422)
    );
  }

  const { name, email, password, places } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (error) {
    return next(
      new HttpError(
        "something went wrong, signup failed, please try again",
        500
      )
    );
  }

  if (existingUser) {
    return next(
      new HttpError("user exists already, please login instead.", 422)
    );
  }

  const createdUser = new User({
    name,
    email,
    image:
      "https://img1.wikia.nocookie.net/__cb20110928212942/warhammer40k/images/a/aa/Necron_Lord_&_Warriors.jpg",
    password,
    places,
  });

  try {
    await createdUser.save();
  } catch (error) {
    return next(new HttpError("sign up failed, please try again.", 500));
  }

  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  const identifiedUser = DUMMY_USERS.find((user) => user.email === email);

  if (!identifiedUser || identifiedUser.password !== password) {
    return next(
      new HttpError(
        "could not identify user, credentials seem to be wrong.",
        401
      )
    );
  }

  res.json({ message: "logged in" });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;

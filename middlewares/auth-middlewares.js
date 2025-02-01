const UserModel = require("../database/db");
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY;

const checkUserExists = async (req, res, next) => {
  const { email } = req.body;
  const findEmail = await UserModel.findOne({ email });
  if (findEmail) {
    req.userExist = true;
    req.userData = findEmail;
  } else {
    req.userExist = false;
  }
  next();
};

const checkUserLoggedIn = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) return res.status(403).json({ msg: "You are not Logged in" });
  const token = authorization.split(" ")[1]
  const isValid = jwt.verify(token, SECRET_KEY);
  if (isValid) {
    req.dbEmail = isValid.email;
    return next();
  }
};

const checkNewEmailAlreadyExist = async (req, res, next) => {
  if (req.dbEmail === req.body.email) return next();
  const alreadyExist = await UserModel.findOne({ email: req.body.email });


  if (alreadyExist) return res.json({ msg: "This Email is already existed" });
  next();
};

module.exports = {
  checkUserExists,
  checkUserLoggedIn,
  checkNewEmailAlreadyExist,
};

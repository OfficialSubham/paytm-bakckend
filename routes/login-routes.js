const { Router } = require("express");
const bcryptjs = require("bcryptjs");
const UserModel = require("../database/db");
const route = Router();
const z = require("zod");
const hashSalt = 10;
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY;
const {
  checkUserExists,
  checkUserLoggedIn,
} = require("../middlewares/auth-middlewares");
const Account = require("../database/bank");

//zod schema for valid data
const credentialsCheck = z.object({
  name: z.string(),
  email: z.string().email().min(4),
  password: z.string().min(5),
});

//sign-up route
route.post("/sign-up", checkUserExists, async (req, res) => {
  if (req.userExist)
    return res.json({ msg: "User already exists please login" });
  const { name, email, password } = req.body;
  try {
    const checkedCredentials = credentialsCheck.safeParse({
      name,
      email,
      password,
    });
    if (checkedCredentials.success === false) {
      res.json({ msg: "Enter Valid Credentials" });
    }
    const hashPassword = await bcryptjs.hash(password, hashSalt);
    const newUser = await UserModel.create({
      name,
      email,
      password: hashPassword,
    });
    await Account.create({
      userId: newUser._id,
      balance: (Math.random() * 10000).toFixed(4)
    })
    const token = jwt.sign({ name, email }, SECRET_KEY);
    res.json({ msg: "User Created successfully", token });
  } catch (error) {
    res.json({ msg: "Internal Server Error" });
  }
});

//login-route
route.post("/login", checkUserExists, async (req, res) => {
  if (!req.userExist)
    return res.json({ msg: "User doesnot exist please signup" });

  const { email, password } = req.body;
  try {
    const checkPasswordValidity = await bcryptjs.compare(
      password,
      req.userData.password
    );
    if (!checkPasswordValidity)
      return res.json({ msg: "Enter valid credentials" });
    const token = jwt.sign({ name: req.userData.name, email }, SECRET_KEY);
    res.json({ token });
  } catch (error) {
    res.status(411).json({ msg: "Error while login" });
  }
});

const updateCredentialsCheck = z.object({
  name: z.optional(z.string().min(4)),
  password: z.optional(z.string().min(5)),
});

//Edit User data
route.put("/update-data", checkUserLoggedIn, async (req, res) => {
  const { name, password } = req.body;
  const updateData = {};
  const checkedCredentials = updateCredentialsCheck.safeParse({
    name,
    password,
  });
  if (!checkedCredentials.success)
    return res.json({ msg: "Enter Valid credentials" });
  if (password) {
    const hashPassword = await bcryptjs.hash(password, hashSalt);
    updateData.password = hashPassword;
  }
  if (name) {
    updateData.name = name;
  }
  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ msg: "No Changes made" });
  }
  try {
    await UserModel.updateOne({ email: req.dbEmail }, updateData, {
      new: true,
    });
    res.json({ msg: "Data updated Successfully" });
  } catch (error) {
    res.json({ msg: "Internal Server Error" });
  }
});

//get user by filter
route.get("/bulk", checkUserLoggedIn, async (req, res) => {
  const filter = req.query.filter;
  const regex = new RegExp(`^${filter}`, "i");
  try {
    const matchedUsers = await UserModel.find({
      name: regex,
    }).select("-password");
    res.json({ matchedUsers });
  } catch (error) {
    res.status(500).json({ msg: "Error while finding" });
  }
});

module.exports = route;

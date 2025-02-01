const mongoose = require("mongoose");
const MONGO_URL = process.env.MONGO_URL

mongoose.connect(MONGO_URL)
const { Schema } = mongoose;
const User = new Schema({
    name: String,
    email: String,
    password: String
});

const UserModel = mongoose.model("Paytm-User", User)

module.exports = UserModel

const mongoose = require("mongoose")

const {Schema} = mongoose

const bankSchema = new Schema({
    userId: {
        type: Schema.ObjectId,
        ref: "Paytm-User",
        required: true
    },
    balance: {
        type: Number,
        required: true
    }
})

const Account = mongoose.model("bank-db", bankSchema);

module.exports = Account
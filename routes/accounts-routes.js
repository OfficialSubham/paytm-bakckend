const { Router } = require("express");
const { checkUserLoggedIn } = require("../middlewares/auth-middlewares");
const Account = require("../database/bank");
const mongoose = require("mongoose");
const router = Router();

router.get("/balance", checkUserLoggedIn, async (req, res) => {
  const dbResponse = await Account.findOne({ userId: req.dbUserId }).select(
    "balance"
  );
  res.json({ balance: dbResponse.balance });
});

//Sending Money
//session is like complete code
//i.e. either the code runs fully or abort fully
router.post("/transfer", checkUserLoggedIn, async (req, res) => {
  //declaring session
  const session = await mongoose.startSession();
  const { to, amount } = req.body;
  try {
    session.startTransaction();

    const sender = await Account.findOne({ userId: req.dbUserId });

    if (amount > sender.balance)
      return res.status(400).json({ msg: "Insufficient Balance" });

    const isValidReciever = await Account.findOne({ userId: to });

    if (!isValidReciever)
      return res.status(400).json({ msg: "Enter Valid Reciever" });

    await Account.updateOne(
      { userId: req.dbUserId },
      { $inc: { balance: -amount } },
      { session }
    );

    //$inc is increament
    //use -amount to decreament
    await Account.updateOne(
      { userId: to },
      { $inc: { balance: amount } },
      { session }
    );

    await session.commitTransaction();
    res.json({ msg: "Transaction Successfull" });
  } catch (error) {
    //if any error occurs above the session will abort
    await session.abortTransaction();
    res.json({ msg: "Server Error", error });
  } finally {
    //finally end the session either it resolve or not
    session.endSession();
  }
});

module.exports = router;

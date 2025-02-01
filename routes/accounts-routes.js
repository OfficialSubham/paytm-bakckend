const {Router} = require("express");

const router = Router();


router.get("/", (req, res) => {
    res.json({msg: "this is from accounts"})
})







module.exports = router
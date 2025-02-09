require("dotenv").config()

const bodyParser = require("body-parser");
const express = require("express");
const loginRoute = require("./routes/login-routes");
const accountRoute = require("./routes/accounts-routes")
const cors = require("cors")
const app = express()
const PORT = process.env.PORT


app.use(cors({
    origin: process.env.ORIGIN
}))
app.use(bodyParser.json())

app.use("/user", loginRoute)
app.use("/account", accountRoute)


//I If any route is not defind this will show
app.use((req, res) => {
    res.json({msg: "Route Not Found"})
})

// If any error occur in the middleware then it will show this message
app.use((err, req, res, next) => {
    res.json({msg: "Internal Error"})
})

app.listen(PORT)

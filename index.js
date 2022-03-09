const express = require("express");
const app = express();
const cors = require('cors')
app.options('*', cors())
let allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Headers', "*");
    next();
}
app.use(allowCrossDomain);
app.use(express.json());
// Route
app.use("/postAssignment", require("./api/postAssignment"));
const port = process.env.PORT || 4000;
app.listen(port, () => console.log("Server is running on " + port));
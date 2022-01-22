const express = require("express");
const app = express();
const cors = require('cors')
app.options('*', cors()) 
app.use(express.json());
// Route
app.use("/postAssignment", require("./api/postAssignment"));
const port = process.env.PORT;
app.listen(port, () => console.log("Server is running"));
const express = require("express");
const app = express();
const cors = require('cors')
app.options('*', cors()) 
app.use(express.json());
// Route
app.use("/postAssignment", require("./api/postAssignment"));

app.listen(8000, () => console.log("Server is running"));
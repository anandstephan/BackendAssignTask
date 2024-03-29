const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { MONGOURI } = require("./keys");
const app = express();

mongoose.connect(MONGOURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

mongoose.connection.on("connected", () => {
  console.log("Connection successfully Setup");
});

mongoose.connection.on("error", (err) => {
  console.log("err" + err);
});

require("./models/user");

app.use(cors());
app.use(express.json());
app.use("/test", (req, res) => {
  res.send("<h1>TEST</h1>");
});

app.use("/api", require("./routes/auth"));
app.use("/api", require("./routes/post"));
app.use("/api", require("./routes/user"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running at ${PORT}`));

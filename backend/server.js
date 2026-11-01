
const express = require("express");
const cors = require("cors");
const propertyDetailsRoutes = require("./routes/propertyDetailsRoutes");
const propertyRulesRoutes = require("./routes/propertyRulesRoutes");
require("dotenv").config();
const path = require("path");
const propertyImageRoutes = require("./routes/propertyImageRoutes");

const connectDB = require("./config/db");
const propertyRoutes = require("./routes/propertyRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

app.use(
  "/api/property-images",
  propertyImageRoutes
);

app.get("/", (req, res) => {
  res.send("Roomaa backend running");
});

// Property API routes
app.use("/api/properties", propertyRoutes);
app.use("/api/property-details", propertyDetailsRoutes);
app.use("/api/property-rules", propertyRulesRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();

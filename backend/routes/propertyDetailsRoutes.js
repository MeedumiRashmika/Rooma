
const express = require("express");

const {
  savePropertyDetails,
  getPropertyDetails
} = require("../controllers/propertyDetailsController");

const router = express.Router();

router.put("/:propertyId", savePropertyDetails);

router.get("/:propertyId", getPropertyDetails);

module.exports = router;

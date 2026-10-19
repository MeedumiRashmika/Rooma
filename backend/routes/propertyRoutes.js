
const express = require("express");

const {
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  deleteProperty
} = require("../controllers/propertyController");

const router = express.Router();

// CREATE property
router.post("/", createProperty);

// GET all properties
router.get("/", getAllProperties);

// GET single property
router.get("/:propertyId", getPropertyById);

// UPDATE property
router.put("/:propertyId", updateProperty);

// DELETE property
router.delete("/:propertyId", deleteProperty);

module.exports = router;

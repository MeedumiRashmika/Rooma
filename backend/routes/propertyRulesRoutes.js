
const express = require("express");

const {
  savePropertyRules,
  getPropertyRules
} = require("../controllers/propertyRulesController");

const router = express.Router();

router.put("/:propertyId", savePropertyRules);
router.get("/:propertyId", getPropertyRules);

module.exports = router;


const Property = require("../models/Property");
const PropertyRules = require("../models/PropertyRules");

const allowedFields = [
  "hasCurfew",
  "curfewTime",
  "isSmokingAllowed",
  "isAlcoholAllowed",
  "arePetsAllowed",
  "areVisitorsAllowed",
  "areOvernightVisitorsAllowed",
  "isCookingAllowed",
  "hasNoiseRestrictions",
  "hasCleaningRules",
  "hasParkingRules",
  "additionalRules",
  "hasPetsOnProperty",
  "petTypes",
  "areBoarderPetsAllowed"
];

// CREATE OR UPDATE
const savePropertyRules = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const property = await Property.findOne({
      propertyId
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
        errors: []
      });
    }

    const updates = {};

    for (const field of allowedFields) {
      if (
        Object.prototype.hasOwnProperty.call(
          req.body,
          field
        )
      ) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid property rules provided",
        errors: []
      });
    }

    // Keep dependent fields consistent.
    if (updates.hasCurfew === false) {
      updates.curfewTime = "";
    }

    if (updates.hasPetsOnProperty === false) {
      updates.petTypes = [];
    }

    if (updates.arePetsAllowed === false) {
      updates.areBoarderPetsAllowed = false;
    }

    const data = await PropertyRules.findOneAndUpdate(
      { propertyId },
      {
        $set: updates,
        $setOnInsert: { propertyId }
      },
      {
        upsert: true,
        returnDocument: "after",
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    return res.status(200).json({
      success: true,
      message: "Property rules saved successfully",
      data
    });

  } catch (error) {
    return res.status(
      error.name === "ValidationError" ? 400 : 500
    ).json({
      success: false,
      message: "Failed to save property rules",
      errors: [error.message]
    });
  }
};

// GET RULES
const getPropertyRules = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const data = await PropertyRules.findOne({
      propertyId
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Property rules not found",
        errors: []
      });
    }

    return res.status(200).json({
      success: true,
      message: "Property rules retrieved successfully",
      data
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve property rules",
      errors: [error.message]
    });
  }
};

module.exports = {
  savePropertyRules,
  getPropertyRules
};


const Property = require("../models/Property");
const PropertyDetails = require("../models/PropertyDetails");

const allowedFields = [
  "bedroomCount",
  "bedCount",
  "roomType",
  "occupancyType",
  "isFurnished",
  "furnishingType",
  "hasPrivateEntrance",
  "hasBalcony",
  "hasWindow",
  "hasNaturalLight",

  "bathroomType",
  "bathroomCount",
  "hasAttachedBathroom",
  "hasSharedBathroom",
  "hasHotWater",
  "hasShower",
  "hasWesternToilet",
  "bathroomSharedBy",

  "hasKitchen",
  "kitchenType",
  "isCookingAllowed",
  "hasGasStove",
  "hasElectricCooker",
  "hasRefrigerator",
  "hasMicrowave",
  "hasPantry",
  "hasDrinkingWater",

  "hasBed",
  "hasMattress",
  "hasTable",
  "hasChair",
  "hasWardrobe",
  "hasCupboard",
  "hasSofa"
];

// CREATE OR UPDATE PROPERTY DETAILS
const savePropertyDetails = async (req, res) => {
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
        message: "No valid property details provided",
        errors: []
      });
    }

    const data = await PropertyDetails.findOneAndUpdate(
      { propertyId },
      {
        $set: updates,
        $setOnInsert: { propertyId }
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    return res.status(200).json({
      success: true,
      message: "Property details saved successfully",
      data
    });
  } catch (error) {
    return res.status(
      error.name === "ValidationError" ||
      error.name === "CastError"
        ? 400
        : 500
    ).json({
      success: false,
      message: "Failed to save property details",
      errors: [error.message]
    });
  }
};

// GET PROPERTY DETAILS
const getPropertyDetails = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const data = await PropertyDetails.findOne({
      propertyId
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Property details not found",
        errors: []
      });
    }

    return res.status(200).json({
      success: true,
      message: "Property details retrieved successfully",
      data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve property details",
      errors: [error.message]
    });
  }
};

module.exports = {
  savePropertyDetails,
  getPropertyDetails
};


const Property = require("../models/Property");
const { randomUUID } = require("crypto");

// CREATE PROPERTY
const createProperty = async (req, res) => {
  try {
    const {
      ownerId,
      propertyTitle,
      propertyDescription,
      propertyType,
      address,
      city,
      area,
      latitude,
      longitude,
      nearbyLandmark,
      monthlyRent,
      rentPerPerson,
      depositAmount,
      advanceAmount,
      isNegotiable,
      availableFrom,
      maximumOccupants,
      currentOccupants,
      availableSpaces
    } = req.body;

    const property = await Property.create({
      propertyId: randomUUID(),
      ownerId,
      propertyTitle,
      propertyDescription,
      propertyType,
      address,
      city,
      area,
      latitude,
      longitude,
      nearbyLandmark,
      monthlyRent,
      rentPerPerson,
      depositAmount,
      advanceAmount,
      isNegotiable,
      availableFrom,
      maximumOccupants,
      currentOccupants,
      availableSpaces
    });

    res.status(201).json({
      success: true,
      message: "Property created successfully",
      data: property
    });

  } catch (error) {
    res.status(error.name === "ValidationError" ? 400 : 500).json({
      success: false,
      message: "Failed to create property",
      errors: [error.message]
    });
  }
};

// GET ALL PROPERTIES
const getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Properties retrieved successfully",
      data: properties
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve properties",
      errors: [error.message]
    });
  }
};

// GET PROPERTY BY ID
const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findOne({
      propertyId: req.params.propertyId
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
        errors: []
      });
    }

    res.status(200).json({
      success: true,
      message: "Property retrieved successfully",
      data: property
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve property",
      errors: [error.message]
    });
  }
};


const updateProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;

    // Only allow defined property fields to be updated.
    const allowedFields = [
      "propertyTitle",
      "propertyDescription",
      "propertyType",
      "propertyStatus",
      "address",
      "city",
      "area",
      "latitude",
      "longitude",
      "nearbyLandmark",
      "monthlyRent",
      "rentPerPerson",
      "depositAmount",
      "advanceAmount",
      "isNegotiable",
      "availableFrom",
      "maximumOccupants",
      "currentOccupants",
      "availableSpaces",
      "hasSofa",
      
  // Utilities
  "electricityType",
  "waterType",
  "wifiType",
  "electricityCharge",
  "waterCharge",
  "wifiCharge",
  "cleaningCharge",
  "maintenanceCharge",
  "parkingCharge",

  // Internet
  "hasWifi",
  "internetType",
  "internetSpeed",

  // Parking
  "hasParking",
  "carParkingSpaces",
  "bikeParkingSpaces",
  "bicycleParkingSpaces",

  // Laundry
  "hasWashingMachine",
  "hasWashingArea",
  "hasDryingArea",
  "hasIroningFacility",

  // Security
  "hasCCTV",
  "hasSecurityGuard",
  "hasGate",
  "hasKeyAccess",
  "hasSeparateEntrance",
  "hasFireExtinguisher",
  "hasEmergencyExit"

    ];

    const updates = {};

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid property fields provided",
        errors: []
      });
    }

    const property = await Property.findOneAndUpdate(
      { propertyId },
      { $set: updates },
      {
        new: true,
        runValidators: true
      }
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
        errors: []
      });
    }

    res.status(200).json({
      success: true,
      message: "Property updated successfully",
      data: property
    });

  } catch (error) {
    res.status(error.name === "ValidationError" ? 400 : 500).json({
      success: false,
      message: "Failed to update property",
      errors: [error.message]
    });
  }
};

// DELETE PROPERTY

const deleteProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const property = await Property.findOneAndDelete({
      propertyId
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
        errors: []
      });
    }

    res.status(200).json({
      success: true,
      message: "Property deleted successfully",
      data: {
        propertyId: property.propertyId
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete property",
      errors: [error.message]
    });
  }
};



module.exports = {
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  deleteProperty
};

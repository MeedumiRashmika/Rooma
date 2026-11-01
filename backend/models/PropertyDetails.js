
const mongoose = require("mongoose");

const propertyDetailsSchema = new mongoose.Schema(
  {
    propertyId: {
      type: String,
      required: true,
      unique: true
    },

    // ROOM DETAILS
    bedroomCount: { type: Number, min: 0 },
    bedCount: { type: Number, min: 0 },

    roomType: {
      type: String,
      enum: ["single", "double", "shared"]
    },

    occupancyType: {
      type: String,
      enum: ["private", "shared"]
    },

    isFurnished: Boolean,

    furnishingType: {
      type: String,
      enum: [
        "fully_furnished",
        "semi_furnished",
        "unfurnished"
      ]
    },

    hasPrivateEntrance: Boolean,
    hasBalcony: Boolean,
    hasWindow: Boolean,
    hasNaturalLight: Boolean,

    // BATHROOM DETAILS
    bathroomType: {
      type: String,
      enum: [
        "attached",
        "shared",
        "private_external"
      ]
    },

    bathroomCount: { type: Number, min: 0 },
    hasAttachedBathroom: Boolean,
    hasSharedBathroom: Boolean,
    hasHotWater: Boolean,
    hasShower: Boolean,
    hasWesternToilet: Boolean,
    bathroomSharedBy: { type: Number, min: 0 },

    // KITCHEN DETAILS
    hasKitchen: Boolean,

    kitchenType: {
      type: String,
      enum: ["private", "shared", "none"]
    },

    isCookingAllowed: Boolean,
    hasGasStove: Boolean,
    hasElectricCooker: Boolean,
    hasRefrigerator: Boolean,
    hasMicrowave: Boolean,
    hasPantry: Boolean,
    hasDrinkingWater: Boolean,

    // FURNITURE DETAILS
    hasBed: Boolean,
    hasMattress: Boolean,
    hasTable: Boolean,
    hasChair: Boolean,
    hasWardrobe: Boolean,
    hasCupboard: Boolean,
    hasSofa: Boolean,

    // UTILITY DETAILS
    electricityType: {
      type: String,
      enum: [
        "included",
        "shared",
        "separate_meter",
        "fixed_fee"
      ]
    },

    waterType: {
      type: String,
      enum: [
        "included",
        "shared",
        "fixed_fee"
      ]
    },

    wifiType: {
      type: String,
      enum: [
        "included",
        "paid_separately",
        "not_available"
      ]
    },

    electricityCharge: { type: Number, min: 0 },
    waterCharge: { type: Number, min: 0 },
    wifiCharge: { type: Number, min: 0 },
    cleaningCharge: { type: Number, min: 0 },
    maintenanceCharge: { type: Number, min: 0 },
    parkingCharge: { type: Number, min: 0 },

    // INTERNET DETAILS
    hasWifi: Boolean,

    internetType: {
      type: String,
      enum: [
        "fiber",
        "mobile_broadband",
        "wifi",
        "none"
      ]
    },

    internetSpeed: Number,

    // PARKING DETAILS
    hasParking: Boolean,
    carParkingSpaces: { type: Number, min: 0 },
    bikeParkingSpaces: { type: Number, min: 0 },
    bicycleParkingSpaces: { type: Number, min: 0 },

    // LAUNDRY DETAILS
    hasWashingMachine: Boolean,
    hasWashingArea: Boolean,
    hasDryingArea: Boolean,
    hasIroningFacility: Boolean,

    // SECURITY DETAILS
    hasCCTV: Boolean,
    hasSecurityGuard: Boolean,
    hasGate: Boolean,
    hasKeyAccess: Boolean,
    hasSeparateEntrance: Boolean,
    hasFireExtinguisher: Boolean,
    hasEmergencyExit: Boolean

    

  },
   
  
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "PropertyDetails",
  propertyDetailsSchema
);

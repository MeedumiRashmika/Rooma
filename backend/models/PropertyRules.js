
const mongoose = require("mongoose");

const propertyRulesSchema = new mongoose.Schema(
  {
    propertyId: {
      type: String,
      required: true,
      unique: true
    },

    // PROPERTY RULES
    hasCurfew: {
      type: Boolean,
      default: false
    },

    curfewTime: {
      type: String,
      default: ""
    },

    isSmokingAllowed: {
      type: Boolean,
      default: false
    },

    isAlcoholAllowed: {
      type: Boolean,
      default: false
    },

    arePetsAllowed: {
      type: Boolean,
      default: false
    },

    areVisitorsAllowed: {
      type: Boolean,
      default: false
    },

    areOvernightVisitorsAllowed: {
      type: Boolean,
      default: false
    },

    isCookingAllowed: {
      type: Boolean,
      default: false
    },

    hasNoiseRestrictions: {
      type: Boolean,
      default: false
    },

    hasCleaningRules: {
      type: Boolean,
      default: false
    },

    hasParkingRules: {
      type: Boolean,
      default: false
    },

    additionalRules: {
      type: String,
      default: ""
    },

    // PET DETAILS
    hasPetsOnProperty: {
      type: Boolean,
      default: false
    },

    petTypes: {
      type: [String],
      default: []
    },

    areBoarderPetsAllowed: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "PropertyRules",
  propertyRulesSchema
);

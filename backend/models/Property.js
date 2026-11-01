
const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    propertyId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    ownerId: {
      type: String,
      required: true
    },

    propertyTitle: {
      type: String,
      required: true,
      trim: true
    },

    propertyDescription: {
      type: String,
      required: true
    },

    propertyType: {
      type: String,
      required: true,
      enum: [
        "boarding_room",
        "annex",
        "apartment",
        "house_room",
        "hostel",
        "studio",
        "shared_room"
      ]
    },

    propertyStatus: {
      type: String,
      enum: [
        "available",
        "reserved",
        "occupied",
        "temporarily_unavailable",
        "inactive"
      ],
      default: "available"
    },

    address: {
      type: String,
      required: true
    },

    city: {
      type: String,
      required: true
    },

    area: {
      type: String,
      required: true
    },

    latitude: Number,
    longitude: Number,
    nearbyLandmark: String,

    monthlyRent: {
      type: Number,
      required: true,
      min: 0
    },

    rentPerPerson: {
      type: Number,
      min: 0
    },

    depositAmount: {
      type: Number,
      default: 0,
      min: 0
    },

    advanceAmount: {
      type: Number,
      default: 0,
      min: 0
    },

    isNegotiable: {
      type: Boolean,
      default: false
    },

    availableFrom: Date,

    maximumOccupants: {
      type: Number,
      min: 1
    },

    currentOccupants: {
      type: Number,
      default: 0,
      min: 0
    },

    availableSpaces: {
      type: Number,
      min: 0
    }

  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "Property",
  propertySchema
);


const mongoose = require("mongoose");

const propertyImageSchema = new mongoose.Schema(
  {
    imageId: {
      type: String,
      required: true,
      unique: true
    },

    propertyId: {
      type: String,
      required: true,
      index: true
    },

    imageUrl: {
      type: String,
      required: true
    },

    imageType: {
      type: String,
      required: true,
      enum: [
        "room",
        "bathroom",
        "kitchen",
        "exterior",
        "entrance",
        "living_area",
        "parking",
        "other"
      ],
      default: "room"
    },

    isCoverImage: {
      type: Boolean,
      default: false
    },

    displayOrder: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "PropertyImage",
  propertyImageSchema
);

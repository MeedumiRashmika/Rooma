
const Property = require("../models/Property");
const PropertyImage = require("../models/PropertyImage");
const sharp = require("sharp");
const { randomUUID } = require("crypto");
const fs = require("fs/promises");
const path = require("path");

const uploadDirectory = path.join(
  __dirname,
  "../uploads/properties"
);

const allowedImageTypes = [
  "room",
  "bathroom",
  "kitchen",
  "exterior",
  "entrance",
  "living_area",
  "parking",
  "other"
];

const removeStoredImage = async (imageUrl) => {
  const filename = path.basename(imageUrl);
  await fs.unlink(path.join(uploadDirectory, filename))
    .catch((error) => {
      if (error.code !== "ENOENT") throw error;
    });
};

// UPLOAD PROPERTY IMAGE
const uploadPropertyImage = async (req, res) => {
  let savedFilePath;

  try {
    const { propertyId } = req.params;
    const imageType = req.body.imageType || "room";

    const property = await Property.findOne({ propertyId });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
        errors: []
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image",
        errors: []
      });
    }

    if (!allowedImageTypes.includes(imageType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid image type",
        errors: []
      });
    }

    // Validate actual image bytes and convert to JPEG.
    let imageBuffer;

    try {
      imageBuffer = await sharp(req.file.buffer, {
        limitInputPixels: 25000000
      })
        .rotate()
        .resize({
          width: 1600,
          withoutEnlargement: true
        })
        .jpeg({ quality: 82 })
        .toBuffer();
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid or unsupported image",
        errors: []
      });
    }

    const existingImages = await PropertyImage.find({
      propertyId
    }).sort({ displayOrder: -1 });

    if (existingImages.length >= 20) {
      return res.status(400).json({
        success: false,
        message: "Maximum 20 images per property",
        errors: []
      });
    }

    const imageId = randomUUID();
    const filename = `${imageId}.jpg`;
    const imageUrl = `/uploads/properties/${filename}`;

    await fs.mkdir(uploadDirectory, { recursive: true });

    savedFilePath = path.join(uploadDirectory, filename);
    await fs.writeFile(savedFilePath, imageBuffer);

    const isCoverImage = existingImages.length === 0;

    const displayOrder = existingImages.length
      ? existingImages[0].displayOrder + 1
      : 0;

    const data = await PropertyImage.create({
      imageId,
      propertyId,
      imageUrl,
      imageType,
      isCoverImage,
      displayOrder
    });

    return res.status(201).json({
      success: true,
      message: "Property image uploaded successfully",
      data
    });

  } catch (error) {
    if (savedFilePath) {
      await fs.unlink(savedFilePath).catch(() => {});
    }

    return res.status(500).json({
      success: false,
      message: "Failed to upload property image",
      errors: [error.message]
    });
  }
};

// GET ALL IMAGES FOR PROPERTY
const getPropertyImages = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const data = await PropertyImage.find({
      propertyId
    }).sort({
      isCoverImage: -1,
      displayOrder: 1
    });

    return res.status(200).json({
      success: true,
      message: "Property images retrieved successfully",
      data
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve property images",
      errors: [error.message]
    });
  }
};

// SET COVER IMAGE
const setCoverImage = async (req, res) => {
  try {
    const { propertyId, imageId } = req.params;

    const image = await PropertyImage.findOne({
      propertyId,
      imageId
    });

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
        errors: []
      });
    }

    await PropertyImage.updateMany(
      { propertyId },
      { $set: { isCoverImage: false } }
    );

    const data = await PropertyImage.findOneAndUpdate(
      { propertyId, imageId },
      { $set: { isCoverImage: true } },
      { returnDocument: "after" }
    );

    return res.status(200).json({
      success: true,
      message: "Cover image updated successfully",
      data
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to set cover image",
      errors: [error.message]
    });
  }
};

// DELETE IMAGE
const deletePropertyImage = async (req, res) => {
  try {
    const { propertyId, imageId } = req.params;

    const image = await PropertyImage.findOne({
      propertyId,
      imageId
    });

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
        errors: []
      });
    }

    await PropertyImage.deleteOne({ propertyId, imageId });

    // If cover was deleted, assign another existing image.
    if (image.isCoverImage) {
      await PropertyImage.findOneAndUpdate(
        { propertyId },
        { $set: { isCoverImage: true } },
        {
          sort: { displayOrder: 1 },
          returnDocument: "after"
        }
      );
    }

    await removeStoredImage(image.imageUrl);

    return res.status(200).json({
      success: true,
      message: "Property image deleted successfully",
      data: { imageId }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete property image",
      errors: [error.message]
    });
  }
};

module.exports = {
  uploadPropertyImage,
  getPropertyImages,
  setCoverImage,
  deletePropertyImage
};

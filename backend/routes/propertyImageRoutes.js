
const express = require("express");
const multer = require("multer");
const upload = require("../middleware/uploadMiddleware");

const {
  uploadPropertyImage,
  getPropertyImages,
  setCoverImage,
  deletePropertyImage
} = require("../controllers/propertyImageController");

const router = express.Router();

router.get("/:propertyId", getPropertyImages);

router.post(
  "/:propertyId",
  (req, res, next) => {
    upload.single("image")(req, res, (error) => {
      if (error) {
        return res.status(400).json({
          success: false,
          message: error instanceof multer.MulterError
            ? "Image upload limit exceeded"
            : error.message,
          errors: [error.message]
        });
      }
      next();
    });
  },
  uploadPropertyImage
);

router.put(
  "/:propertyId/:imageId/cover",
  setCoverImage
);

router.delete(
  "/:propertyId/:imageId",
  deletePropertyImage
);

module.exports = router;


import { useEffect, useRef, useState } from "react";
import "./PropertyImageUpload.css";

import Button from "../ui/Button";
import Card from "../ui/Card";

const API_URL = "http://localhost:5000";

const MAX_IMAGES = 20;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/webp"
];

const imageTypes = [
  ["room", "Room"],
  ["bathroom", "Bathroom"],
  ["kitchen", "Kitchen"],
  ["exterior", "Exterior"],
  ["entrance", "Entrance"],
  ["living_area", "Living Area"],
  ["parking", "Parking"],
  ["other", "Other"]
];

function PropertyImageUpload({ propertyId }) {
  const [images, setImages] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageType, setImageType] = useState("room");
  const [previewUrl, setPreviewUrl] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [imageToDelete, setImageToDelete] = useState(null);

  const fileInputRef = useRef(null);
  const previewUrlRef = useRef("");

  // ---------------------------------------
  // Clear selected image preview
  // ---------------------------------------

  const clearSelectedImage = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = "";
    }

    setPreviewUrl("");
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Release preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  // ---------------------------------------
  // Load images from backend
  // ---------------------------------------

  const loadImages = async (signal) => {
    if (!propertyId) {
      setImages([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/property-images/${encodeURIComponent(
          propertyId
        )}`,
        { signal }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to load images"
        );
      }

      if (!signal?.aborted) {
        setImages(
          Array.isArray(result.data) ? result.data : []
        );
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        setErrorMessage(
          error.message || "Failed to load property images"
        );
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    const fetchImages = async () => {
      if (!propertyId) {
        if (isActive) {
          setImages([]);
          setIsLoading(false);
        }
        return;
      }

      if (isActive) {
        setIsLoading(true);
      }

      try {
        const response = await fetch(
          `${API_URL}/api/property-images/${encodeURIComponent(
            propertyId
          )}`,
          { signal: controller.signal }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Failed to load images"
          );
        }

        if (isActive && !controller.signal.aborted) {
          setImages(
            Array.isArray(result.data) ? result.data : []
          );
        }
      } catch (error) {
        if (error.name !== "AbortError" && isActive) {
          setErrorMessage(
            error.message || "Failed to load property images"
          );
        }
      } finally {
        if (isActive && !controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void fetchImages();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [propertyId]);

  // ---------------------------------------
  // Select image
  // ---------------------------------------

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    setErrorMessage("");
    setSuccessMessage("");

    clearSelectedImage();

    if (!file) return;

    if (!allowedTypes.includes(file.type)) {
      setErrorMessage(
        "Only JPG, PNG and WebP images are allowed."
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage(
        "Maximum image size is 5 MB."
      );
      return;
    }

    const url = URL.createObjectURL(file);

    previewUrlRef.current = url;
    setSelectedFile(file);
    setPreviewUrl(url);
  };

  // ---------------------------------------
  // Upload image
  // ---------------------------------------

  const handleUpload = async () => {
    if (!selectedFile || !propertyId) {
      setErrorMessage(
        "Please select an image and property."
      );
      return;
    }

    if (images.length >= MAX_IMAGES) {
      setErrorMessage(
        "Maximum 20 images are allowed per property."
      );
      return;
    }

    if (isSubmitting || isProcessingImage) return;

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const formData = new FormData();

      formData.append("image", selectedFile);
      formData.append("imageType", imageType);

      const response = await fetch(
        `${API_URL}/api/property-images/${encodeURIComponent(
          propertyId
        )}`,
        {
          method: "POST",
          body: formData
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Image upload failed"
        );
      }

      clearSelectedImage();
      setImageType("room");

      await loadImages();

      setSuccessMessage(
        "Image uploaded successfully!"
      );
    } catch (error) {
      setErrorMessage(
        error.message || "Unable to upload image."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------------------------------
  // Set cover image
  // ---------------------------------------

  const handleSetCover = async (imageId) => {
    if (isSubmitting || isProcessingImage) return;

    setIsProcessingImage(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/property-images/${encodeURIComponent(
          propertyId
        )}/${encodeURIComponent(imageId)}/cover`,
        {
          method: "PUT"
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to change cover image"
        );
      }

      await loadImages();

      setSuccessMessage(
        "Cover image updated successfully!"
      );
    } catch (error) {
      setErrorMessage(
        error.message || "Unable to update cover image."
      );
    } finally {
      setIsProcessingImage(false);
    }
  };

  // ---------------------------------------
  // Open delete confirmation
  // ---------------------------------------

  const handleDelete = (image) => {
    setErrorMessage("");
    setSuccessMessage("");
    setImageToDelete(image);
  };

  // ---------------------------------------
  // Confirm image delete
  // ---------------------------------------

  const confirmDeleteImage = async () => {
    if (!imageToDelete || isProcessingImage || isSubmitting) {
      return;
    }

    setIsProcessingImage(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/property-images/${encodeURIComponent(
          propertyId
        )}/${encodeURIComponent(
          imageToDelete.imageId
        )}`,
        {
          method: "DELETE"
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to delete image"
        );
      }

      setImageToDelete(null);

      await loadImages();

      setSuccessMessage(
        "Image deleted successfully!"
      );
    } catch (error) {
      setErrorMessage(
        error.message || "Unable to delete image."
      );
    } finally {
      setIsProcessingImage(false);
    }
  };

  // ---------------------------------------
  // UI
  // ---------------------------------------

  return (
    <main className="rooma-image-page">
      <div className="rooma-image-container">

        {/* PAGE HEADER */}

        <header className="rooma-image-header">
          <span>
            ROOMA / PROPERTY MANAGEMENT
          </span>

          <h1>Property Photos</h1>

          <p>
            Upload clear photos of your rooms and
            facilities. The cover image appears on
            your property card.
          </p>
        </header>

        {/* UPLOAD PANEL */}

        <Card
          as="section"
          padding="large"
          className="rooma-image-panel"
        >
          <h2>Upload New Photo</h2>

          <label className="rooma-upload-area">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Selected property preview"
              />
            ) : (
              <div>
                <span className="rooma-upload-symbol">
                  ＋
                </span>

                <strong>
                  Choose a property photo
                </strong>

                <p>
                  JPG, PNG or WebP — Maximum 5 MB
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              disabled={
                isSubmitting ||
                isProcessingImage ||
                images.length >= MAX_IMAGES
              }
            />
          </label>

          <div className="rooma-upload-controls">
            <div>
              <label htmlFor="imageType">
                Image Category
              </label>

              <select
                id="imageType"
                value={imageType}
                onChange={(event) =>
                  setImageType(event.target.value)
                }
                disabled={
                  isSubmitting || isProcessingImage
                }
              >
                {imageTypes.map(([value, label]) => (
                  <option
                    value={value}
                    key={value}
                  >
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <Button
              type="button"
              variant="primary"
              onClick={handleUpload}
              disabled={
                isSubmitting ||
                isProcessingImage ||
                !selectedFile ||
                !propertyId ||
                images.length >= MAX_IMAGES
              }
            >
              {isSubmitting
                ? "Uploading..."
                : "Upload Image"}
            </Button>
          </div>

          {selectedFile && !isSubmitting && (
            <div className="rooma-image-clear">
              <Button
                variant="outline"
                size="small"
                onClick={clearSelectedImage}
              >
                Remove Selection
              </Button>
            </div>
          )}
        </Card>

        {/* MESSAGES */}

        {errorMessage && (
          <p
            className="rooma-image-error"
            role="alert"
          >
            {errorMessage}
          </p>
        )}

        {successMessage && (
          <p
            className="rooma-image-success"
            role="status"
          >
            {successMessage}
          </p>
        )}

        {/* UPLOADED PHOTOS */}

        <Card
          as="section"
          padding="large"
          className="rooma-image-panel"
        >
          <div className="rooma-image-heading">
            <h2>Uploaded Photos</h2>

            <span>
              {images.length} / {MAX_IMAGES}
            </span>
          </div>

          {isLoading && (
            <p>Loading images...</p>
          )}

          {!isLoading && images.length === 0 && (
            <p>No images uploaded yet.</p>
          )}

          {!isLoading && images.length > 0 && (
            <div className="rooma-uploaded-grid">
              {images.map((image) => (
                <Card
                  as="article"
                  padding="none"
                  className="rooma-uploaded-card"
                  key={image.imageId}
                >
                  <div className="rooma-uploaded-photo">
                    <img
                      src={`${API_URL}${image.imageUrl}`}
                      alt={image.imageType}
                    />

                    {image.isCoverImage && (
                      <span className="rooma-cover-badge">
                        Cover Image
                      </span>
                    )}
                  </div>

                  <div className="rooma-uploaded-details">
                    <strong>
                      {String(
                        image.imageType || "other"
                      ).replaceAll("_", " ")}
                    </strong>

                    <div className="rooma-image-actions">
                      <Button
                        variant="secondary"
                        size="small"
                        disabled={
                          image.isCoverImage ||
                          isSubmitting ||
                          isProcessingImage
                        }
                        onClick={() =>
                          handleSetCover(image.imageId)
                        }
                      >
                        {image.isCoverImage
                          ? "Current Cover"
                          : "Set Cover"}
                      </Button>

                      <Button
                        variant="danger"
                        size="small"
                        disabled={
                          isSubmitting || isProcessingImage
                        }
                        onClick={() =>
                          handleDelete(image)
                        }
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>

        {/* CUSTOM DELETE CONFIRMATION */}

        {imageToDelete && (
          <div className="rooma-image-delete-overlay">
            <Card
              padding="large"
              className="rooma-image-delete-modal"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="rooma-image-delete-title"
              aria-describedby="rooma-image-delete-description"
            >
              <div className="rooma-image-delete-icon">
                🗑️
              </div>

              <h2 id="rooma-image-delete-title">
                Delete Image?
              </h2>

              <p id="rooma-image-delete-description">
                Are you sure you want to delete
                this property image? This action
                cannot be undone.
              </p>

              <div className="rooma-image-delete-actions">
                <Button
                  variant="secondary"
                  fullWidth
                  disabled={isProcessingImage}
                  onClick={() =>
                    setImageToDelete(null)
                  }
                >
                  Cancel
                </Button>

                <Button
                  variant="danger"
                  fullWidth
                  disabled={isProcessingImage}
                  onClick={confirmDeleteImage}
                >
                  {isProcessingImage
                    ? "Deleting..."
                    : "Delete Image"}
                </Button>
              </div>
            </Card>
          </div>
        )}

      </div>
    </main>
  );
}

export default PropertyImageUpload;

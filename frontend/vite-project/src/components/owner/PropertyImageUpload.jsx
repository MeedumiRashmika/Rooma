
import { useEffect, useState } from "react";
import "./PropertyImageUpload.css";

const API_URL = "http://localhost:5000";

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
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadImages = async (signal) => {
    setIsLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/property-images/${encodeURIComponent(propertyId)}`,
        { signal }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load images");
      }

      setImages(result.data);
    } catch (error) {
      if (error.name !== "AbortError") {
        setErrorMessage(error.message);
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!propertyId) {
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      void loadImages(controller.signal);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [propertyId]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    setErrorMessage("");
    setSuccessMessage("");

    setPreviewUrl((previousUrl) => {
      if (previousUrl) {
        URL.revokeObjectURL(previousUrl);
      }
      return "";
    });

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {
      setErrorMessage("Only JPG, PNG and WebP images are allowed");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Maximum image size is 5 MB");
      event.target.value = "";
      return;
    }

    const url = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(url);
  };

  const handleUpload = async () => {
    if (!selectedFile || !propertyId) {
      setErrorMessage("Please select an image and property");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const formData = new FormData();

      formData.append("image", selectedFile);
      formData.append("imageType", imageType);

      const response = await fetch(
        `${API_URL}/api/property-images/${encodeURIComponent(propertyId)}`,
        {
          method: "POST",
          body: formData
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Image upload failed");
      }

      await loadImages();

      setSelectedFile(null);
      setSuccessMessage("Image uploaded successfully!");

    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetCover = async (imageId) => {
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/property-images/${encodeURIComponent(propertyId)}/${encodeURIComponent(imageId)}/cover`,
        { method: "PUT" }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to change cover");
      }

      await loadImages();
      setSuccessMessage("Cover image updated!");

    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleDelete = async (imageId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this image?"
    );

    if (!confirmed) return;

    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/property-images/${encodeURIComponent(propertyId)}/${encodeURIComponent(imageId)}`,
        { method: "DELETE" }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete image");
      }

      await loadImages();
      setSuccessMessage("Image deleted successfully!");

    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <main className="rooma-image-page">
      <div className="rooma-image-container">
        <header className="rooma-image-header">
          <span>ROOМА / PROPERTY MANAGEMENT</span>
          <h1>Property Photos</h1>
          <p>
            Upload clear photos of your rooms and facilities.
            The cover image appears on your property card.
          </p>
        </header>

        <section className="rooma-image-panel">
          <h2>Upload New Photo</h2>

          <label className="rooma-upload-area">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Selected image preview"
              />
            ) : (
              <div>
                <span className="rooma-upload-symbol">＋</span>
                <strong>Choose a property photo</strong>
                <p>JPG, PNG or WebP — Maximum 5 MB</p>
              </div>
            )}

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
            />
          </label>

          <div className="rooma-upload-controls">
            <div>
              <label htmlFor="imageType">Image Category</label>
              <select
                id="imageType"
                value={imageType}
                onChange={(event) =>
                  setImageType(event.target.value)
                }
              >
                {imageTypes.map(([value, label]) => (
                  <option value={value} key={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleUpload}
              disabled={
                isSubmitting ||
                !selectedFile ||
                !propertyId ||
                images.length >= 20
              }
            >
              {isSubmitting ? "Uploading..." : "Upload Image"}
            </button>
          </div>
        </section>

        {errorMessage && (
          <p className="rooma-image-error" role="alert">
            {errorMessage}
          </p>
        )}

        {successMessage && (
          <p className="rooma-image-success" role="status">
            {successMessage}
          </p>
        )}

        <section className="rooma-image-panel">
          <div className="rooma-image-heading">
            <h2>Uploaded Photos</h2>
            <span>{images.length} / 20</span>
          </div>

          {isLoading && <p>Loading images...</p>}

          {!isLoading && images.length === 0 && (
            <p>No images uploaded yet.</p>
          )}

          <div className="rooma-uploaded-grid">
            {images.map((image) => (
              <article
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
                    {image.imageType.replaceAll("_", " ")}
                  </strong>

                  <div className="rooma-image-actions">
                    <button
                      type="button"
                      disabled={image.isCoverImage}
                      onClick={() => handleSetCover(image.imageId)}
                    >
                      Set Cover
                    </button>

                    <button
                      type="button"
                      className="rooma-delete-image"
                      onClick={() => handleDelete(image.imageId)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default PropertyImageUpload;

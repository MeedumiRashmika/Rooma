import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PropertyForm.css";
import Button from "../ui/Button";

const API_URL = "http://localhost:5000";

const initialFormData = {
  ownerId: "",
  propertyTitle: "",
  propertyDescription: "",
  propertyType: "boarding_room",
  propertyStatus: "available",
  address: "",
  city: "",
  area: "",
  latitude: "",
  longitude: "",
  nearbyLandmark: "",
  monthlyRent: "",
  rentPerPerson: "",
  depositAmount: "",
  advanceAmount: "",
  isNegotiable: false,
  availableFrom: "",
  maximumOccupants: "",
  currentOccupants: "0",
  availableSpaces: "",
};

const propertyTypes = [
  ["boarding_room", "Boarding Room"],
  ["annex", "Annex"],
  ["apartment", "Apartment"],
  ["house_room", "House Room"],
  ["hostel", "Hostel"],
  ["studio", "Studio"],
  ["shared_room", "Shared Room"],
];

const propertyStatuses = [
  ["available", "Available"],
  ["reserved", "Reserved"],
  ["occupied", "Occupied"],
  ["temporarily_unavailable", "Temporarily Unavailable"],
  ["inactive", "Inactive"],
];

const numberFields = [
  "latitude",
  "longitude",
  "monthlyRent",
  "rentPerPerson",
  "depositAmount",
  "advanceAmount",
  "maximumOccupants",
  "currentOccupants",
  "availableSpaces",
];

const optionalNumberFields = [
  "latitude",
  "longitude",
  "rentPerPerson",
  "depositAmount",
  "advanceAmount",
  "availableSpaces",
];

function PropertyForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [selectedImages, setSelectedImages] = useState([]);
  const [imageError, setImageError] = useState("");
  const [uploadProgress, setUploadProgress] = useState("");
  const [createdPropertyId, setCreatedPropertyId] = useState(null);
  const previewUrls = useRef(new Set());
  const errorSummaryRef = useRef(null);

  // Revoke preview URLs on unmount, not after each image selection.
  useEffect(() => {
    return () => {
      previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
      previewUrls.current.clear();
    };
  }, []);

  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    setImageError("");

    if (files.length + selectedImages.length > 20) {
      setImageError("Maximum 20 images per property.");
      return;
    }

    for (const file of files) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setImageError("Only JPG, PNG and WebP images are allowed.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setImageError("Each image must be 5 MB or smaller.");
        return;
      }
    }

    const newImages = files.map((file) => {
      const previewUrl = URL.createObjectURL(file);
      previewUrls.current.add(previewUrl);
      return {
        imageId: crypto.randomUUID(),
        file,
        previewUrl,
        imageType: "room",
        isCoverImage: false,
      };
    });

    setSelectedImages((previous) => {
      const combined = [...previous, ...newImages];
      if (combined.length && !combined.some((image) => image.isCoverImage)) {
        return combined.map((image, index) => ({
          ...image,
          isCoverImage: index === 0,
        }));
      }
      return combined;
    });
  };

  const removeImage = (imageId) => {
    const removed = selectedImages.find((image) => image.imageId === imageId);
    if (removed) {
      URL.revokeObjectURL(removed.previewUrl);
      previewUrls.current.delete(removed.previewUrl);
    }
    setSelectedImages((previous) => {
      const remaining = previous.filter((image) => image.imageId !== imageId);
      if (remaining.length && !remaining.some((image) => image.isCoverImage)) {
        return remaining.map((image, index) => ({
          ...image,
          isCoverImage: index === 0,
        }));
      }
      return remaining;
    });
  };

  const setCoverImage = (imageId) => {
    setSelectedImages((previous) =>
      previous.map((image) => ({
        ...image,
        isCoverImage: image.imageId === imageId,
      })),
    );
  };

  const updateImageType = (imageId, imageType) => {
    setSelectedImages((previous) =>
      previous.map((image) =>
        image.imageId === imageId ? { ...image, imageType } : image,
      ),
    );
  };

  const updateField = (name, value) => {
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFormErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setErrorMessage("");
  };

  const validateForm = () => {
    const errors = {};

    const requiredFields = [
      "ownerId",
      "propertyTitle",
      "propertyDescription",
      "propertyType",
      "address",
      "city",
      "area",
      "monthlyRent",
    ];

    requiredFields.forEach((field) => {
      if (!String(formData[field] ?? "").trim()) {
        errors[field] = "This field is required";
      }
    });

    numberFields.forEach((field) => {
      const value = formData[field];

      if (value !== "" && value !== null) {
        if (!Number.isFinite(Number(value))) {
          errors[field] = "Enter a valid number";
        } else if (
          field !== "latitude" &&
          field !== "longitude" &&
          Number(value) < 0
        ) {
          errors[field] = "Value cannot be negative";
        }
      }
    });

    if (
      formData.latitude !== "" &&
      (Number(formData.latitude) < -90 || Number(formData.latitude) > 90)
    ) {
      errors.latitude = "Latitude must be between -90 and 90";
    }

    if (
      formData.longitude !== "" &&
      (Number(formData.longitude) < -180 || Number(formData.longitude) > 180)
    ) {
      errors.longitude = "Longitude must be between -180 and 180";
    }

    if (
      formData.maximumOccupants !== "" &&
      Number(formData.maximumOccupants) < 1
    ) {
      errors.maximumOccupants = "Must be at least 1";
    }

    if (
      formData.maximumOccupants !== "" &&
      Number(formData.currentOccupants) > Number(formData.maximumOccupants)
    ) {
      errors.currentOccupants =
        "Current occupants cannot exceed maximum occupants";
    }

    if (formData.monthlyRent !== "" && Number(formData.monthlyRent) < 0) {
      errors.monthlyRent = "Monthly rent cannot be negative";
    }

    const integerFields = [
      "maximumOccupants",
      "currentOccupants",
      "availableSpaces",
    ];

    integerFields.forEach((field) => {
      if (
        formData[field] !== "" &&
        !Number.isInteger(Number(formData[field]))
      ) {
        errors[field] = "Enter a whole number";
      }
    });

    if (
      formData.availableSpaces !== "" &&
      formData.maximumOccupants !== "" &&
      Number(formData.availableSpaces) >
        Number(formData.maximumOccupants) - Number(formData.currentOccupants)
    ) {
      errors.availableSpaces = "Available spaces exceed remaining capacity";
    }

    setFormErrors(errors);
    const invalidFields = Object.keys(errors);
    if (invalidFields.length) {
      setErrorMessage(
        "Please correct the highlighted fields before creating your property.",
      );
      requestAnimationFrame(() => {
        errorSummaryRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        document
          .getElementById(invalidFields[0])
          ?.focus({ preventScroll: true });
      });
      return false;
    }
    setErrorMessage("");
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    if (createdPropertyId) {
      setErrorMessage(
        "This property was already created. Please manage its photos from Manage Properties.",
      );
      return;
    }
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");
    setUploadProgress("");

    let propertyId = null;

    try {
      const data = { ...formData };
      numberFields.forEach((field) => {
        if (data[field] === "") {
          if (optionalNumberFields.includes(field)) delete data[field];
        } else {
          data[field] = Number(data[field]);
        }
      });
      if (!data.availableFrom) delete data.availableFrom;

      // Development only: remove manual ownerId entry when auth is integrated.
      // Backend must later obtain ownerId from the authenticated user.
      const response = await fetch(`${API_URL}/api/properties`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success || !result?.data?.propertyId) {
        const details = Array.isArray(result?.errors)
          ? result.errors
              .map((item) =>
                typeof item === "string"
                  ? item
                  : item.message || item.msg || JSON.stringify(item),
              )
              .join("; ")
          : "";
        throw new Error(
          details ||
            result?.message ||
            `Failed to create property (HTTP ${response.status})`,
        );
      }

      propertyId = result.data.propertyId;
      setCreatedPropertyId(propertyId);
      setSuccessMessage("Property saved. Uploading selected photos...");

      const uploadedImages = [];
      for (let index = 0; index < selectedImages.length; index++) {
        const image = selectedImages[index];
        setUploadProgress(
          `Uploading ${index + 1} of ${selectedImages.length} images...`,
        );

        const imageFormData = new FormData();
        imageFormData.append("image", image.file);
        imageFormData.append("imageType", image.imageType);

        const imageResponse = await fetch(
          `${API_URL}/api/property-images/${encodeURIComponent(propertyId)}`,
          { method: "POST", body: imageFormData },
        );
        const imageResult = await imageResponse.json().catch(() => null);
        if (
          !imageResponse.ok ||
          !imageResult?.success ||
          !imageResult?.data?.imageId
        ) {
          throw new Error(
            imageResult?.message ||
              `Image ${index + 1} upload failed (HTTP ${imageResponse.status})`,
          );
        }
        uploadedImages.push({
          imageId: imageResult.data.imageId,
          isCoverImage: image.isCoverImage,
        });
      }

      const coverImage = uploadedImages.find((image) => image.isCoverImage);
      if (coverImage) {
        const response = await fetch(
          `${API_URL}/api/property-images/${encodeURIComponent(propertyId)}/${encodeURIComponent(coverImage.imageId)}/cover`,
          { method: "PUT" },
        );
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to set cover image");
        }
      }

      navigate("/owner/properties", {
        state: {
          successMessage: selectedImages.length
            ? "Property and photos saved successfully!"
            : "Property created successfully!",
        },
      });
    } catch (error) {
      if (propertyId) {
        // Property exists; do not POST it again. Continue image management.
        navigate(`/owner/properties/${encodeURIComponent(propertyId)}/images`, {
          state: {
            successMessage: `Property created, but image upload needs attention: ${error.message}`,
          },
        });
      } else {
        setErrorMessage(
          error.message ||
            "Unable to connect to the server. Check the backend terminal.",
        );
        requestAnimationFrame(() =>
          errorSummaryRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          }),
        );
      }
    } finally {
      setIsSubmitting(false);
      setUploadProgress("");
    }
  };

  const inputField = (name, label, type = "text", options = {}) => (
    <div className="rooma-field" key={name}>
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        min={options.min}
        max={options.max}
        step={options.step}
        placeholder={options.placeholder || ""}
        value={formData[name]}
        onChange={(event) => updateField(name, event.target.value)}
        aria-invalid={!!formErrors[name]}
      />
      {formErrors[name] && (
        <small className="rooma-field-error">{formErrors[name]}</small>
      )}
    </div>
  );

  return (
    <form className="rooma-property-form" onSubmit={handleSubmit} noValidate>
      <div ref={errorSummaryRef}>
        {errorMessage && (
          <div className="rooma-form-message error" role="alert" tabIndex={-1}>
            <strong>Could not create property.</strong> {errorMessage}
            {Object.keys(formErrors).length > 0 && (
              <ul>
                {Object.entries(formErrors).map(([field, message]) => (
                  <li key={field}>
                    {field}: {message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      <div className="rooma-form-section">
        <div className="rooma-form-section-heading">
          <span className="rooma-form-step sage">01</span>
          <div>
            <h2>Basic Property Information</h2>
            <p>Tell residents about your accommodation.</p>
          </div>
        </div>

        <div className="rooma-form-grid">
          {inputField("ownerId", "Owner ID (Development Only)")}

          {inputField("propertyTitle", "Property Title")}

          <div className="rooma-field">
            <label htmlFor="propertyType">Property Type</label>
            <select
              id="propertyType"
              value={formData.propertyType}
              onChange={(event) =>
                updateField("propertyType", event.target.value)
              }
            >
              {propertyTypes.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="rooma-field">
            <label htmlFor="propertyStatus">Property Status</label>
            <select
              id="propertyStatus"
              value={formData.propertyStatus}
              onChange={(event) =>
                updateField("propertyStatus", event.target.value)
              }
            >
              {propertyStatuses.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="rooma-field rooma-full-width">
            <label htmlFor="propertyDescription">Property Description</label>
            <textarea
              id="propertyDescription"
              rows={4}
              value={formData.propertyDescription}
              onChange={(event) =>
                updateField("propertyDescription", event.target.value)
              }
              placeholder="Describe your property..."
              aria-invalid={!!formErrors.propertyDescription}
            />
            {formErrors.propertyDescription && (
              <small className="rooma-field-error">
                {formErrors.propertyDescription}
              </small>
            )}
          </div>
        </div>
      </div>

      <div className="rooma-form-section">
        <div className="rooma-form-section-heading">
          <span className="rooma-form-step peach">02</span>
          <div>
            <h2>Property Location</h2>
            <p>Help residents find your property.</p>
          </div>
        </div>

        <div className="rooma-form-grid">
          {inputField("address", "Address")}
          {inputField("city", "City")}
          {inputField("area", "Area")}
          {inputField("nearbyLandmark", "Nearby Landmark")}
          {inputField("latitude", "Latitude", "number", {
            step: "any",
            min: -90,
            max: 90,
          })}
          {inputField("longitude", "Longitude", "number", {
            step: "any",
            min: -180,
            max: 180,
          })}
        </div>
      </div>

      <div className="rooma-form-section">
        <div className="rooma-form-section-heading">
          <span className="rooma-form-step lavender">03</span>
          <div>
            <h2>Pricing Details</h2>
            <p>Set your accommodation prices.</p>
          </div>
        </div>

        <div className="rooma-form-grid">
          {inputField("monthlyRent", "Monthly Rent (LKR)", "number", {
            min: 0,
          })}
          {inputField("rentPerPerson", "Rent Per Person (LKR)", "number", {
            min: 0,
          })}
          {inputField("depositAmount", "Deposit Amount (LKR)", "number", {
            min: 0,
          })}
          {inputField("advanceAmount", "Advance Amount (LKR)", "number", {
            min: 0,
          })}
        </div>

        <label className="rooma-form-checkbox">
          <input
            type="checkbox"
            checked={formData.isNegotiable}
            onChange={(event) =>
              updateField("isNegotiable", event.target.checked)
            }
          />
          Is the rent negotiable?
        </label>
      </div>

      <div className="rooma-form-section">
        <div className="rooma-form-section-heading">
          <span className="rooma-form-step sage">04</span>
          <div>
            <h2>Availability & Occupancy</h2>
            <p>Manage resident capacity and availability.</p>
          </div>
        </div>

        <div className="rooma-form-grid">
          {inputField("availableFrom", "Available From", "date")}
          {inputField("maximumOccupants", "Maximum Occupants", "number", {
            min: 1,
            step: 1,
          })}
          {inputField("currentOccupants", "Current Occupants", "number", {
            min: 0,
            step: 1,
          })}
          {inputField("availableSpaces", "Available Spaces", "number", {
            min: 0,
            step: 1,
          })}
        </div>
      </div>

      <div className="rooma-form-section">
        <div className="rooma-form-section-heading">
          <span className="rooma-form-step sage">05</span>
          <div>
            <h2>Property Photos</h2>
            <p>Add up to 20 photos. Choose one as the cover photo.</p>
          </div>
        </div>

        <label className="rooma-photo-upload">
          <span className="rooma-photo-upload-icon">＋</span>
          <strong>Select Property Photos</strong>
          <small>JPG, PNG or WebP — maximum 5 MB each</small>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleImageSelect}
            disabled={isSubmitting || selectedImages.length >= 20}
          />
        </label>

        <p className="rooma-photo-count">
          {selectedImages.length} / 20 photos selected
        </p>
        {imageError && (
          <p className="rooma-form-message error" role="alert">
            {imageError}
          </p>
        )}

        <div className="rooma-photo-grid">
          {selectedImages.map((image) => (
            <div className="rooma-photo-card" key={image.imageId}>
              <div className="rooma-photo-preview">
                <img src={image.previewUrl} alt="Selected property preview" />
                {image.isCoverImage && (
                  <span className="rooma-photo-cover-badge">Cover Image</span>
                )}
              </div>
              <div className="rooma-photo-options">
                <label htmlFor={`imageType-${image.imageId}`}>
                  Photo category
                </label>
                <select
                  id={`imageType-${image.imageId}`}
                  value={image.imageType}
                  onChange={(event) =>
                    updateImageType(image.imageId, event.target.value)
                  }
                  disabled={isSubmitting}
                >
                  <option value="room">Room</option>
                  <option value="bathroom">Bathroom</option>
                  <option value="kitchen">Kitchen</option>
                  <option value="exterior">Exterior</option>
                  <option value="entrance">Entrance</option>
                  <option value="living_area">Living Area</option>
                  <option value="parking">Parking</option>
                  <option value="other">Other</option>
                </select>
                <div className="rooma-photo-actions">
                  <Button
                    type="button"
                    disabled={image.isCoverImage || isSubmitting}
                    onClick={() => setCoverImage(image.imageId)}
                  >
                    Set Cover
                  </Button>
                  <Button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => removeImage(image.imageId)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {uploadProgress && (
        <p className="rooma-form-message success" role="status">
          {uploadProgress}
        </p>
      )}

      {successMessage && (
        <p className="rooma-form-message success" role="status">
          {successMessage}
        </p>
      )}

      <div className="rooma-form-footer">
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate("/owner/properties")}
        >
          Cancel
        </Button>

        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Property"}
        </Button>

        
      </div>
    </form>
  );
}

export default PropertyForm;

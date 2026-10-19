
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PropertyForm.css";

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
  availableSpaces: ""
};

const propertyTypes = [
  ["boarding_room", "Boarding Room"],
  ["annex", "Annex"],
  ["apartment", "Apartment"],
  ["house_room", "House Room"],
  ["hostel", "Hostel"],
  ["studio", "Studio"],
  ["shared_room", "Shared Room"]
];

const propertyStatuses = [
  ["available", "Available"],
  ["reserved", "Reserved"],
  ["occupied", "Occupied"],
  ["temporarily_unavailable", "Temporarily Unavailable"],
  ["inactive", "Inactive"]
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
  "availableSpaces"
];

const optionalNumberFields = [
  "latitude",
  "longitude",
  "rentPerPerson",
  "depositAmount",
  "advanceAmount",
  "availableSpaces"
];

function PropertyForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const updateField = (name, value) => {
    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));

    setFormErrors((previous) => ({
      ...previous,
      [name]: ""
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
      "monthlyRent"
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
      (Number(formData.latitude) < -90 ||
       Number(formData.latitude) > 90)
    ) {
      errors.latitude = "Latitude must be between -90 and 90";
    }

    if (
      formData.longitude !== "" &&
      (Number(formData.longitude) < -180 ||
       Number(formData.longitude) > 180)
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
      Number(formData.currentOccupants) >
      Number(formData.maximumOccupants)
    ) {
      errors.currentOccupants =
        "Current occupants cannot exceed maximum occupants";
    }

    const integerFields = [
      "maximumOccupants",
      "currentOccupants",
      "availableSpaces"
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
        Number(formData.maximumOccupants) -
        Number(formData.currentOccupants)
    ) {
      errors.availableSpaces =
        "Available spaces exceed remaining capacity";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const data = {
        ...formData
      };

      numberFields.forEach((field) => {
        if (data[field] === "") {
          if (optionalNumberFields.includes(field)) {
            delete data[field];
          }
        } else {
          data[field] = Number(data[field]);
        }
      });

      if (!data.availableFrom) {
        delete data.availableFrom;
      }

      // Local development only:
      // ownerId is entered manually until authentication is integrated.
      const response = await fetch(
        `${API_URL}/api/properties`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to create property"
        );
      }

      setSuccessMessage("Property created successfully!");

      navigate("/owner/properties", {
        state: {
          successMessage: "Property created successfully!"
        }
      });
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
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
        <small className="rooma-field-error">
          {formErrors[name]}
        </small>
      )}
    </div>
  );

  return (
    <form
      className="rooma-property-form"
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="rooma-form-section">
        <div className="rooma-form-section-heading">
          <span className="rooma-form-step sage">01</span>
          <div>
            <h2>Basic Property Information</h2>
            <p>Tell residents about your accommodation.</p>
          </div>
        </div>

        <div className="rooma-form-grid">
          {inputField(
            "ownerId",
            "Owner ID (Development Only)"
          )}

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
            <label htmlFor="propertyDescription">
              Property Description
            </label>
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
            step: "any", min: -90, max: 90
          })}
          {inputField("longitude", "Longitude", "number", {
            step: "any", min: -180, max: 180
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
            min: 0
          })}
          {inputField("rentPerPerson", "Rent Per Person (LKR)", "number", {
            min: 0
          })}
          {inputField("depositAmount", "Deposit Amount (LKR)", "number", {
            min: 0
          })}
          {inputField("advanceAmount", "Advance Amount (LKR)", "number", {
            min: 0
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
          {inputField(
            "maximumOccupants",
            "Maximum Occupants",
            "number",
            { min: 1, step: 1 }
          )}
          {inputField(
            "currentOccupants",
            "Current Occupants",
            "number",
            { min: 0, step: 1 }
          )}
          {inputField(
            "availableSpaces",
            "Available Spaces",
            "number",
            { min: 0, step: 1 }
          )}
        </div>
      </div>

      {errorMessage && (
        <p className="rooma-form-message error" role="alert">
          {errorMessage}
        </p>
      )}

      {successMessage && (
        <p className="rooma-form-message success" role="status">
          {successMessage}
        </p>
      )}

      <div className="rooma-form-footer">
        <button
          type="button"
          className="rooma-form-cancel"
          onClick={() => navigate("/owner/properties")}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="rooma-form-save"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating..." : "Create Property"}
        </button>
      </div>
    </form>
  );
}

export default PropertyForm;

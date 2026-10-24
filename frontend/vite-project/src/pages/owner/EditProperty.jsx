
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "../../components/owner/PropertyForm.css";
import "./OwnerDashboard.css";

const API_URL = "http://localhost:5000";

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

const initialFormData = {
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
  currentOccupants: "",
  availableSpaces: ""
};

function EditProperty() {
  const { propertyId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadProperty = async () => {
      setIsLoading(true);

      try {
        const response = await fetch(
          `${API_URL}/api/properties/${encodeURIComponent(propertyId)}`,
          { signal: controller.signal }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Failed to load property"
          );
        }

        const property = result.data;

        const loadedData = { ...initialFormData };

        Object.keys(initialFormData).forEach((name) => {
          if (
            property[name] !== undefined &&
            property[name] !== null
          ) {
            loadedData[name] = property[name];
          }
        });

        loadedData.availableFrom = property.availableFrom
          ? String(property.availableFrom).slice(0, 10)
          : "";

        if (!controller.signal.aborted) {
          setFormData(loadedData);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          setErrorMessage(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    loadProperty();

    return () => controller.abort();
  }, [propertyId]);

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
      "propertyTitle",
      "propertyDescription",
      "propertyType",
      "address",
      "city",
      "area",
      "monthlyRent"
    ];

    requiredFields.forEach((name) => {
      if (!String(formData[name] ?? "").trim()) {
        errors[name] = "This field is required";
      }
    });

    numberFields.forEach((name) => {
      const value = formData[name];

      if (value === "" || value === null) return;

      if (!Number.isFinite(Number(value))) {
        errors[name] = "Enter a valid number";
      } else if (
        name !== "latitude" &&
        name !== "longitude" &&
        Number(value) < 0
      ) {
        errors[name] = "Value cannot be negative";
      }
    });

    if (
      formData.latitude !== "" &&
      (Number(formData.latitude) < -90 ||
       Number(formData.latitude) > 90)
    ) {
      errors.latitude = "Invalid latitude";
    }

    if (
      formData.longitude !== "" &&
      (Number(formData.longitude) < -180 ||
       Number(formData.longitude) > 180)
    ) {
      errors.longitude = "Invalid longitude";
    }

    ["maximumOccupants", "currentOccupants", "availableSpaces"]
      .forEach((name) => {
        if (
          formData[name] !== "" &&
          !Number.isInteger(Number(formData[name]))
        ) {
          errors[name] = "Enter a whole number";
        }
      });

    if (
      formData.maximumOccupants !== "" &&
      Number(formData.maximumOccupants) < 1
    ) {
      errors.maximumOccupants = "Minimum 1 occupant";
    }

    if (
      formData.maximumOccupants !== "" &&
      formData.currentOccupants !== "" &&
      Number(formData.currentOccupants) >
        Number(formData.maximumOccupants)
    ) {
      errors.currentOccupants = "Exceeds maximum occupants";
    }

    if (
      formData.availableSpaces !== "" &&
      formData.maximumOccupants !== "" &&
      Number(formData.availableSpaces) >
        Number(formData.maximumOccupants) -
        Number(formData.currentOccupants || 0)
    ) {
      errors.availableSpaces = "Exceeds remaining capacity";
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
      const data = { ...formData };

      numberFields.forEach((name) => {
        if (data[name] === "") {
          delete data[name];
        } else {
          data[name] = Number(data[name]);
        }
      });

      if (!data.availableFrom) {
        delete data.availableFrom;
      }

      const response = await fetch(
        `${API_URL}/api/properties/${encodeURIComponent(propertyId)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to update property"
        );
      }

      setSuccessMessage("Property updated successfully!");

      navigate("/owner/properties", {
        state: {
          successMessage: "Property updated successfully!"
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
        value={formData[name] ?? ""}
        onChange={(event) =>
          updateField(name, event.target.value)
        }
        aria-invalid={!!formErrors[name]}
      />

      {formErrors[name] && (
        <small className="rooma-field-error">
          {formErrors[name]}
        </small>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <main className="rooma-owner-page">
        <p>Loading property details...</p>
      </main>
    );
  }

  if (errorMessage && !formData.propertyTitle) {
    return (
      <main className="rooma-owner-page">
        <p className="rooma-form-message error">{errorMessage}</p>
        <Link to="/owner/properties">Back to Properties</Link>
      </main>
    );
  }

  return (
    <main className="rooma-owner-page">
      <div className="rooma-owner-container">

        <header className="rooma-owner-header">
          <div>
            <span className="rooma-owner-eyebrow">
              ROOMA / PROPERTY MANAGEMENT
            </span>
            <h1>Edit Property</h1>
            <p>Update your accommodation listing information.</p>
          </div>

          <Link to="/owner/properties">
            Back to Properties
          </Link>
        </header>

        <form
          className="rooma-property-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <section className="rooma-form-section">
            <div className="rooma-form-section-heading">
              <span className="rooma-form-step sage">01</span>
              <div>
                <h2>Basic Property Information</h2>
                <p>Edit your existing property information.</p>
              </div>
            </div>

            <div className="rooma-form-grid">
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
                    <option value={value} key={value}>
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
                    <option value={value} key={value}>
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
                  rows={5}
                  value={formData.propertyDescription}
                  onChange={(event) =>
                    updateField("propertyDescription", event.target.value)
                  }
                />
                {formErrors.propertyDescription && (
                  <small className="rooma-field-error">
                    {formErrors.propertyDescription}
                  </small>
                )}
              </div>
            </div>
          </section>

          <section className="rooma-form-section">
            <div className="rooma-form-section-heading">
              <span className="rooma-form-step peach">02</span>
              <div>
                <h2>Property Location</h2>
                <p>Update the address and location details.</p>
              </div>
            </div>

            <div className="rooma-form-grid">
              {inputField("address", "Address")}
              {inputField("city", "City")}
              {inputField("area", "Area")}
              {inputField("nearbyLandmark", "Nearby Landmark")}
              {inputField("latitude", "Latitude", "number", {
                min: -90, max: 90, step: "any"
              })}
              {inputField("longitude", "Longitude", "number", {
                min: -180, max: 180, step: "any"
              })}
            </div>
          </section>

          <section className="rooma-form-section">
            <div className="rooma-form-section-heading">
              <span className="rooma-form-step lavender">03</span>
              <div>
                <h2>Pricing Details</h2>
                <p>Update rent and payment information.</p>
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
          </section>

          <section className="rooma-form-section">
            <div className="rooma-form-section-heading">
              <span className="rooma-form-step sage">04</span>
              <div>
                <h2>Availability & Occupancy</h2>
                <p>Update room availability and capacity.</p>
              </div>
            </div>

            <div className="rooma-form-grid">
              {inputField("availableFrom", "Available From", "date")}
              {inputField("maximumOccupants", "Maximum Occupants", "number", {
                min: 1, step: 1
              })}
              {inputField("currentOccupants", "Current Occupants", "number", {
                min: 0, step: 1
              })}
              {inputField("availableSpaces", "Available Spaces", "number", {
                min: 0, step: 1
              })}
            </div>
          </section>

          <section className="rooma-form-section">
            <div className="rooma-form-section-heading">
              <span className="rooma-form-step lavender">05</span>
              <div>
                <h2>Photos & Property Rules</h2>
                <p>Manage the other details of your property.</p>
              </div>
            </div>

            <div className="rooma-form-footer">
              <Link
                className="rooma-form-cancel"
                to={`/owner/properties/${propertyId}/images`}
                style={{ textDecoration: "none" }}
              >
                Manage Images
              </Link>

              <Link
                className="rooma-form-cancel"
                to={`/owner/properties/${propertyId}/rules`}
                style={{ textDecoration: "none" }}
              >
                Manage Rules
              </Link>
            </div>
          </section>

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
              {isSubmitting ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default EditProperty;

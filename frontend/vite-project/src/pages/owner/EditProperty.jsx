
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

import "./EditProperty.css";

const API_URL = "http://localhost:5000";

const initialForm = {
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

function EditProperty() {
  const { propertyId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // ----------------------------------
  // Load existing property
  // ----------------------------------

  useEffect(() => {
    const controller = new AbortController();

    const loadProperty = async () => {
      if (!propertyId) {
        setLoadError("Property ID is missing.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setLoadError("");

      try {
        const response = await fetch(
          `${API_URL}/api/properties/${encodeURIComponent(propertyId)}`,
          { signal: controller.signal }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Failed to load property."
          );
        }

        const property = result.data;

        if (!property) {
          throw new Error("Property not found.");
        }

        // Format saved date for <input type="date">
        const savedDate = property.availableFrom
          ? String(property.availableFrom).slice(0, 10)
          : "";

        if (!controller.signal.aborted) {
          setFormData({
            ...initialForm,
            ...property,
            availableFrom: savedDate,
            latitude: property.latitude ?? "",
            longitude: property.longitude ?? "",
            monthlyRent: property.monthlyRent ?? "",
            rentPerPerson: property.rentPerPerson ?? "",
            depositAmount: property.depositAmount ?? "",
            advanceAmount: property.advanceAmount ?? "",
            maximumOccupants: property.maximumOccupants ?? "",
            currentOccupants: property.currentOccupants ?? "0",
            availableSpaces: property.availableSpaces ?? "",
            isNegotiable: Boolean(property.isNegotiable)
          });
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          setLoadError(
            error.message || "Unable to load property."
          );
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

  // ----------------------------------
  // Update input state
  // ----------------------------------

  const updateField = (name, value) => {
    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));

    setFieldErrors((previous) => ({
      ...previous,
      [name]: ""
    }));

    setErrorMessage("");
  };

  // ----------------------------------
  // Validate edited details
  // ----------------------------------

  const validateForm = () => {
    const errors = {};

    const required = [
      "ownerId",
      "propertyTitle",
      "propertyDescription",
      "address",
      "city",
      "area",
      "monthlyRent"
    ];

    required.forEach((name) => {
      if (!String(formData[name] ?? "").trim()) {
        errors[name] = "This field is required.";
      }
    });

    numberFields.forEach((name) => {
      const value = formData[name];

      if (value === "" || value == null) return;

      const number = Number(value);

      if (!Number.isFinite(number)) {
        errors[name] = "Enter a valid number.";
      } else if (
        !["latitude", "longitude"].includes(name) &&
        number < 0
      ) {
        errors[name] = "Value cannot be negative.";
      }
    });

    if (
      formData.latitude !== "" &&
      (Number(formData.latitude) < -90 ||
        Number(formData.latitude) > 90)
    ) {
      errors.latitude = "Latitude must be -90 to 90.";
    }

    if (
      formData.longitude !== "" &&
      (Number(formData.longitude) < -180 ||
        Number(formData.longitude) > 180)
    ) {
      errors.longitude = "Longitude must be -180 to 180.";
    }

    if (
      formData.maximumOccupants !== "" &&
      Number(formData.maximumOccupants) < 1
    ) {
      errors.maximumOccupants = "Must be at least 1.";
    }

    ["maximumOccupants", "currentOccupants", "availableSpaces"]
      .forEach((name) => {
        const value = formData[name];

        if (
          value !== "" &&
          !Number.isInteger(Number(value))
        ) {
          errors[name] = "Enter a whole number.";
        }
      });

    if (
      formData.maximumOccupants !== "" &&
      Number(formData.currentOccupants) >
        Number(formData.maximumOccupants)
    ) {
      errors.currentOccupants =
        "Current occupants exceed maximum occupants.";
    }

    if (
      formData.availableSpaces !== "" &&
      formData.maximumOccupants !== "" &&
      Number(formData.availableSpaces) >
        Number(formData.maximumOccupants) -
          Number(formData.currentOccupants)
    ) {
      errors.availableSpaces =
        "Available spaces exceed remaining capacity.";
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setErrorMessage(
        "Please correct the highlighted fields."
      );

      return false;
    }

    return true;
  };

  // ----------------------------------
  // Save existing property
  // ----------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isLoading || isSaving || !validateForm()) {
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    try {
      const data = { ...formData };

      // Never overwrite the property's identity.
      delete data.propertyId;
      delete data._id;
      delete data.__v;
      delete data.createdAt;
      delete data.updatedAt;

      numberFields.forEach((name) => {
        if (data[name] === "" || data[name] == null) {
          // Optional numeric fields are cleared.
          if (
            [
              "latitude",
              "longitude",
              "rentPerPerson",
              "depositAmount",
              "advanceAmount",
              "availableSpaces"
            ].includes(name)
          ) {
            data[name] = null;
          }
        } else {
          data[name] = Number(data[name]);
        }
      });

      if (!data.availableFrom) {
        data.availableFrom = null;
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
          result.message || "Failed to update property."
        );
      }

      navigate("/owner/properties", {
        state: {
          successMessage: "Property updated successfully!"
        }
      });
    } catch (error) {
      setErrorMessage(
        error.message || "Unable to save changes."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ----------------------------------
  // Reusable form field
  // ----------------------------------

  const renderInput = (
    name,
    label,
    type = "text",
    options = {}
  ) => (
    <div className="rooma-edit-field" key={name}>
      <label htmlFor={`edit-${name}`}>
        {label}
      </label>

      <input
        id={`edit-${name}`}
        type={type}
        value={formData[name] ?? ""}
        placeholder={options.placeholder || ""}
        min={options.min}
        max={options.max}
        step={options.step}
        onChange={(event) =>
          updateField(name, event.target.value)
        }
        aria-invalid={Boolean(fieldErrors[name])}
      />

      {fieldErrors[name] && (
        <small className="rooma-edit-field-error">
          {fieldErrors[name]}
        </small>
      )}
    </div>
  );

  const renderSelect = (name, label, options) => (
    <div className="rooma-edit-field" key={name}>
      <label htmlFor={`edit-${name}`}>
        {label}
      </label>

      <select
        id={`edit-${name}`}
        value={formData[name]}
        onChange={(event) =>
          updateField(name, event.target.value)
        }
      >
        {options.map(([value, labelText]) => (
          <option key={value} value={value}>
            {labelText}
          </option>
        ))}
      </select>
    </div>
  );

  // ----------------------------------
  // Page content
  // ----------------------------------

  return (
    <main className="rooma-edit-page">
      <div className="rooma-edit-container">

        <div className="rooma-edit-navigation">
          <Button
            as={Link}
            to="/owner/properties"
            variant="secondary"
            size="small"
          >
            ← Back to Properties
          </Button>
        </div>

        <header className="rooma-edit-header">
          <div>
            <span className="rooma-edit-eyebrow">
              ROOMA / PROPERTY MANAGEMENT
            </span>
            <h1>Edit Property</h1>
            <p>
              Update your property information and
              save your changes.
            </p>
          </div>
        </header>

        {isLoading && (
          <Card padding="large">
            <p>Loading property information...</p>
          </Card>
        )}

        {loadError && !isLoading && (
          <Card padding="large">
            <p className="rooma-edit-error" role="alert">
              {loadError}
            </p>
          </Card>
        )}

        {!isLoading && !loadError && (
          <form
            className="rooma-edit-form"
            onSubmit={handleSubmit}
            noValidate
          >
            {errorMessage && (
              <p className="rooma-edit-error" role="alert">
                {errorMessage}
              </p>
            )}

            {/* SECTION 1 */}

            <Card
              as="section"
              padding="large"
              className="rooma-edit-section"
            >
              <div className="rooma-edit-section-heading">
                <span className="rooma-edit-step">01</span>
                <div>
                  <h2>Basic Property Information</h2>
                  <p>Edit the main information for your listing.</p>
                </div>
              </div>

              <div className="rooma-edit-grid">
                <div className="rooma-edit-field">
                  <label>Owner ID</label>
                  <input
                    value={formData.ownerId || ""}
                    readOnly
                    disabled
                    title="Owner ID cannot be changed here."
                  />
                </div>

                {renderInput(
                  "propertyTitle",
                  "Property Title"
                )}

                {renderSelect(
                  "propertyType",
                  "Property Type",
                  propertyTypes
                )}

                {renderSelect(
                  "propertyStatus",
                  "Property Status",
                  propertyStatuses
                )}

                <div className="rooma-edit-field rooma-edit-full">
                  <label htmlFor="edit-description">
                    Property Description
                  </label>

                  <textarea
                    id="edit-description"
                    rows={4}
                    value={formData.propertyDescription}
                    onChange={(event) =>
                      updateField(
                        "propertyDescription",
                        event.target.value
                      )
                    }
                    aria-invalid={Boolean(
                      fieldErrors.propertyDescription
                    )}
                  />

                  {fieldErrors.propertyDescription && (
                    <small className="rooma-edit-field-error">
                      {fieldErrors.propertyDescription}
                    </small>
                  )}
                </div>
              </div>
            </Card>

            {/* SECTION 2 */}

            <Card
              as="section"
              padding="large"
              className="rooma-edit-section"
            >
              <div className="rooma-edit-section-heading">
                <span className="rooma-edit-step">02</span>
                <div>
                  <h2>Location Details</h2>
                  <p>Keep your property's location accurate.</p>
                </div>
              </div>

              <div className="rooma-edit-grid">
                {renderInput("address", "Address")}
                {renderInput("city", "City")}
                {renderInput("area", "Area")}
                {renderInput(
                  "nearbyLandmark",
                  "Nearby Landmark"
                )}
                {renderInput(
                  "latitude",
                  "Latitude",
                  "number",
                  { min: -90, max: 90, step: "any" }
                )}
                {renderInput(
                  "longitude",
                  "Longitude",
                  "number",
                  { min: -180, max: 180, step: "any" }
                )}
              </div>
            </Card>

            {/* SECTION 3 */}

            <Card
              as="section"
              padding="large"
              className="rooma-edit-section"
            >
              <div className="rooma-edit-section-heading">
                <span className="rooma-edit-step">03</span>
                <div>
                  <h2>Pricing Details</h2>
                  <p>Update rent and other charges.</p>
                </div>
              </div>

              <div className="rooma-edit-grid">
                {renderInput(
                  "monthlyRent",
                  "Monthly Rent (LKR)",
                  "number",
                  { min: 0 }
                )}
                {renderInput(
                  "rentPerPerson",
                  "Rent Per Person (LKR)",
                  "number",
                  { min: 0 }
                )}
                {renderInput(
                  "depositAmount",
                  "Deposit Amount (LKR)",
                  "number",
                  { min: 0 }
                )}
                {renderInput(
                  "advanceAmount",
                  "Advance Amount (LKR)",
                  "number",
                  { min: 0 }
                )}
              </div>

              <label className="rooma-edit-checkbox">
                <input
                  type="checkbox"
                  checked={formData.isNegotiable}
                  onChange={(event) =>
                    updateField(
                      "isNegotiable",
                      event.target.checked
                    )
                  }
                />
                Is the rent negotiable?
              </label>
            </Card>

            {/* SECTION 4 */}

            <Card
              as="section"
              padding="large"
              className="rooma-edit-section"
            >
              <div className="rooma-edit-section-heading">
                <span className="rooma-edit-step">04</span>
                <div>
                  <h2>Availability & Occupancy</h2>
                  <p>Update your property's capacity and status.</p>
                </div>
              </div>

              <div className="rooma-edit-grid">
                {renderInput(
                  "availableFrom",
                  "Available From",
                  "date"
                )}
                {renderInput(
                  "maximumOccupants",
                  "Maximum Occupants",
                  "number",
                  { min: 1, step: 1 }
                )}
                {renderInput(
                  "currentOccupants",
                  "Current Occupants",
                  "number",
                  { min: 0, step: 1 }
                )}
                {renderInput(
                  "availableSpaces",
                  "Available Spaces",
                  "number",
                  { min: 0, step: 1 }
                )}
              </div>
            </Card>

            {/* SECTION 5 */}

            <Card
              as="section"
              padding="medium"
              className="rooma-edit-section rooma-edit-related"
            >
              <div>
                <h2>Property Photos & Rules</h2>
                <p>
                  Photos and property rules can be
                  updated separately.
                </p>
              </div>

              <div className="rooma-edit-related-actions">
                <Button
                  as={Link}
                  to={`/owner/properties/${propertyId}/images`}
                  variant="secondary"
                  size="small"
                >
                  Manage Images
                </Button>

                <Button
                  as={Link}
                  to={`/owner/properties/${propertyId}/rules`}
                  variant="secondary"
                  size="small"
                >
                  Manage Rules
                </Button>
              </div>
            </Card>

            {/* FORM FOOTER */}

            <div className="rooma-edit-footer">
              <Button
                as={Link}
                to="/owner/properties"
                variant="secondary"
                disabled={isSaving}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="primary"
                disabled={isSaving}
              >
                {isSaving
                  ? "Saving Changes..."
                  : "Save Changes"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}

export default EditProperty;


import { useEffect, useState } from "react";
import "./PropertyRulesForm.css";
import Button from "./ui/Button";

const API_URL = "http://localhost:5000";

const initialFormData = {
  hasCurfew: false,
  curfewTime: "",
  isSmokingAllowed: false,
  isAlcoholAllowed: false,
  arePetsAllowed: false,
  areVisitorsAllowed: false,
  areOvernightVisitorsAllowed: false,
  isCookingAllowed: false,
  hasNoiseRestrictions: false,
  hasCleaningRules: false,
  hasParkingRules: false,
  additionalRules: "",
  hasPetsOnProperty: false,
  petTypes: [],
  areBoarderPetsAllowed: false
};

const ruleFields = [
  {
    name: "isSmokingAllowed",
    label: "Smoking Allowed",
    description: "Allow smoking on the property"
  },
  {
    name: "isAlcoholAllowed",
    label: "Alcohol Allowed",
    description: "Allow alcohol consumption"
  },
  {
    name: "areVisitorsAllowed",
    label: "Visitors Allowed",
    description: "Allow visitors during the day"
  },
  {
    name: "areOvernightVisitorsAllowed",
    label: "Overnight Visitors",
    description: "Allow guests to stay overnight"
  },
  {
    name: "isCookingAllowed",
    label: "Cooking Allowed",
    description: "Residents can prepare meals"
  },
  {
    name: "hasNoiseRestrictions",
    label: "Noise Restrictions",
    description: "Property has noise-related rules"
  },
  {
    name: "hasCleaningRules",
    label: "Cleaning Rules",
    description: "Residents must follow cleaning rules"
  },
  {
    name: "hasParkingRules",
    label: "Parking Rules",
    description: "Property has parking restrictions"
  }
];

function ToggleField({ label, description, checked, onChange }) {
  return (
    <label className="rooma-toggle-row">
      <span className="rooma-toggle-label">
        <strong>{label}</strong>
        {description && <small>{description}</small>}
      </span>

      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}

export default function PropertyRulesForm({ propertyId }) {
  const [formData, setFormData] = useState(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const updateField = (name, value) => {
    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));

    setErrorMessage("");
    setSuccessMessage("");
  };

  useEffect(() => {
    if (!propertyId) {
      return;
    }

    const controller = new AbortController();

    const loadPropertyRules = async () => {
      setIsLoading(true);
      setErrorMessage("");
      setSuccessMessage("");
      setFormData({ ...initialFormData });

      try {
        const response = await fetch(
          `${API_URL}/api/property-rules/${encodeURIComponent(propertyId)}`,
          { signal: controller.signal }
        );

        if (response.status === 404) {
          return;
        }

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to load property rules");
        }

        setFormData({
          ...initialFormData,
          ...result.data
        });
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

    loadPropertyRules();

    return () => controller.abort();
  }, [propertyId]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!propertyId) {
      setErrorMessage("Please select a property first.");
      return;
    }

    if (formData.hasCurfew && !formData.curfewTime) {
      setErrorMessage("Please select the curfew time.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/property-rules/${encodeURIComponent(propertyId)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to save property rules");
      }

      setSuccessMessage("Property rules saved successfully!");
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rooma-rules-page">
      <form className="rooma-rules-form" onSubmit={handleSubmit}>

        <header className="rooma-rules-header">
          <span className="rooma-eyebrow">PROPERTY SETUP</span>
          <h1>Property Rules & Pets</h1>
          <p>
            Help future residents understand your property
            rules and living conditions.
          </p>
        </header>

        {isLoading && <p>Loading property rules...</p>}

        <fieldset disabled={isLoading || isSubmitting}>
          <section className="rooma-form-card">
            <div className="rooma-section-heading">
              <span className="rooma-section-icon peach">01</span>
              <div>
                <h2>Property Rules</h2>
                <p>Set the conditions for living in your property.</p>
              </div>
            </div>

            <ToggleField
              label="Curfew / Gate Closing Time"
              description="Set a time residents should return"
              checked={formData.hasCurfew}
              onChange={(value) => {
                setFormData((previous) => ({
                  ...previous,
                  hasCurfew: value,
                  curfewTime: value ? previous.curfewTime : ""
                }));
              }}
            />

            {formData.hasCurfew && (
              <div className="rooma-input-group">
                <label htmlFor="curfewTime">Curfew Time</label>
                <input
                  id="curfewTime"
                  type="time"
                  value={formData.curfewTime}
                  onChange={(event) =>
                    updateField("curfewTime", event.target.value)
                  }
                />
              </div>
            )}

            {ruleFields.map((field) => (
              <ToggleField
                key={field.name}
                label={field.label}
                description={field.description}
                checked={formData[field.name]}
                onChange={(value) => updateField(field.name, value)}
              />
            ))}
          </section>

          <section className="rooma-form-card">
            <div className="rooma-section-heading">
              <span className="rooma-section-icon lavender">02</span>
              <div>
                <h2>Pets & Animals</h2>
                <p>Manage pet permissions and existing animals.</p>
              </div>
            </div>

            <ToggleField
              label="Pets Allowed"
              description="Allow pets within the property"
              checked={formData.arePetsAllowed}
              onChange={(value) => {
                setFormData((previous) => ({
                  ...previous,
                  arePetsAllowed: value,
                  areBoarderPetsAllowed: value
                    ? previous.areBoarderPetsAllowed
                    : false
                }));
              }}
            />

            <ToggleField
              label="Pets Already on Property"
              description="There are currently animals living here"
              checked={formData.hasPetsOnProperty}
              onChange={(value) => {
                setFormData((previous) => ({
                  ...previous,
                  hasPetsOnProperty: value,
                  petTypes: value ? previous.petTypes : []
                }));
              }}
            />

            {formData.hasPetsOnProperty && (
              <div className="rooma-input-group">
                <label htmlFor="petTypes">
                  Pet Types (comma separated)
                </label>
                <input
                  id="petTypes"
                  type="text"
                  placeholder="dog, cat"
                  value={formData.petTypes.join(", ")}
                  onChange={(event) =>
                    updateField(
                      "petTypes",
                      event.target.value
                        .split(",")
                        .map((value) => value.trim())
                        .filter(Boolean)
                    )
                  }
                />
              </div>
            )}

            <ToggleField
              label="Boarders Can Bring Pets"
              description="Residents may bring their own pets"
              checked={formData.areBoarderPetsAllowed}
              onChange={(value) =>
                updateField("areBoarderPetsAllowed", value)
              }
            />
          </section>

          <section className="rooma-form-card">
            <div className="rooma-section-heading">
              <span className="rooma-section-icon sage">03</span>
              <div>
                <h2>Additional Rules</h2>
                <p>Describe any other important conditions.</p>
              </div>
            </div>

            <div className="rooma-input-group">
              <label htmlFor="additionalRules">Additional Rules</label>
              <textarea
                id="additionalRules"
                rows={5}
                placeholder="Enter additional property rules..."
                value={formData.additionalRules}
                onChange={(event) =>
                  updateField("additionalRules", event.target.value)
                }
              />
            </div>
          </section>
        </fieldset>

        {errorMessage && (
          <p className="rooma-message error" role="alert">
            {errorMessage}
          </p>
        )}

        {successMessage && (
          <p className="rooma-message success" role="status">
            {successMessage}
          </p>
        )}

        <div className="rooma-form-actions">
         <Button
  type="submit"
  variant="primary"
  disabled={isSubmitting || isLoading || !propertyId}
>
  {isSubmitting ? "Saving..." : "Save Property Rules"}
</Button>
        </div>
      </form>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import "./ManageAvailability.css";

const API_URL = "http://localhost:5000";

const statuses = [
  ["available", "Available"],
  ["reserved", "Reserved"],
  ["occupied", "Occupied"],
  ["temporarily_unavailable", "Temporarily Unavailable"],
  ["inactive", "Inactive"]
];

const initialValues = {
  propertyStatus: "available",
  maximumOccupants: "",
  currentOccupants: "0",
  availableSpaces: "",
  availableFrom: ""
};

function toInputNumber(value, fallback = "") {
  return value === undefined || value === null ? fallback : String(value);
}

function ManageAvailability() {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [values, setValues] = useState(initialValues);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setIsLoading(true);
      setLoadError("");
      setProperty(null);
      try {
        if (!propertyId) throw new Error("Property ID is missing.");
        const response = await fetch(
          `${API_URL}/api/properties/${encodeURIComponent(propertyId)}`,
          { signal: controller.signal, cache: "no-store" }
        );
        const result = await response.json();
        if (!response.ok || !result.success || !result.data) {
          throw new Error(result.message || "Could not load property.");
        }
        if (controller.signal.aborted) return;
        const p = result.data;
        setProperty(p);
        setValues({
          propertyStatus: p.propertyStatus || "available",
          maximumOccupants: toInputNumber(p.maximumOccupants),
          currentOccupants: toInputNumber(p.currentOccupants, "0"),
          availableSpaces: toInputNumber(p.availableSpaces),
          availableFrom: p.availableFrom ? String(p.availableFrom).slice(0, 10) : ""
        });
      } catch (error) {
        if (error.name !== "AbortError" && !controller.signal.aborted) {
          setLoadError(error.message || "Unable to load property.");
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [propertyId]);

  const change = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setSaveError("");
  };

  const validate = () => {
    const errors = {};
    const capacity = values.maximumOccupants === "" ? null : Number(values.maximumOccupants);
    const occupied = values.currentOccupants === "" ? null : Number(values.currentOccupants);
    const spaces = values.availableSpaces === "" ? null : Number(values.availableSpaces);

    for (const [name, value] of [["maximumOccupants", capacity], ["currentOccupants", occupied], ["availableSpaces", spaces]]) {
      if (value !== null && (!Number.isInteger(value) || value < 0)) {
        errors[name] = "Enter a non-negative whole number.";
      }
    }
    if (capacity !== null && capacity < 1) errors.maximumOccupants = "Capacity must be at least 1.";
    if (capacity !== null && occupied !== null && occupied > capacity) {
      errors.currentOccupants = "Occupied spaces cannot exceed capacity.";
    }
    if (capacity !== null && occupied !== null && spaces !== null &&
        spaces > capacity - occupied) {
      errors.availableSpaces = "Available spaces exceed remaining capacity.";
    }
    if (capacity === null && (occupied !== null || spaces !== null)) {
      errors.maximumOccupants = "Enter the maximum capacity when tracking occupancy.";
    }
    if (values.availableFrom && Number.isNaN(new Date(`${values.availableFrom}T00:00:00`).getTime())) {
      errors.availableFrom = "Enter a valid date.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (isSaving || isLoading || !property || !validate()) return;
    setIsSaving(true);
    setSaveError("");
    const payload = {
      propertyStatus: values.propertyStatus,
      maximumOccupants: values.maximumOccupants === "" ? null : Number(values.maximumOccupants),
      currentOccupants: values.currentOccupants === "" ? 0 : Number(values.currentOccupants),
      availableSpaces: values.availableSpaces === "" ? null : Number(values.availableSpaces),
      availableFrom: values.availableFrom || null
    };
    try {
      const response = await fetch(
        `${API_URL}/api/properties/${encodeURIComponent(propertyId)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.errors?.join("; ") || result.message || "Failed to save availability.");
      }
      navigate("/owner/properties", {
        state: { successMessage: "Property availability updated successfully!" }
      });
    } catch (error) {
      setSaveError(error.message || "Could not save availability.");
    } finally {
      setIsSaving(false);
    }
  };

  const availableCapacity =
    values.maximumOccupants !== "" && values.currentOccupants !== "" &&
    Number.isFinite(Number(values.maximumOccupants)) && Number.isFinite(Number(values.currentOccupants))
      ? Math.max(0, Number(values.maximumOccupants) - Number(values.currentOccupants))
      : null;

  return (
    <main className="rooma-availability-page">
      <div className="rooma-availability-container">
        <Button as={Link} to="/owner/properties" variant="secondary" size="small">
          ← Back to Properties
        </Button>
        <header className="rooma-availability-header">
          <span>ROOМА / OWNER MANAGEMENT</span>
          <h1>Manage Availability</h1>
          <p>Update occupancy, property status and the next available date.</p>
        </header>

        {isLoading && <Card padding="large"><p>Loading property...</p></Card>}
        {!isLoading && loadError && <Card padding="large"><p role="alert" className="rooma-availability-error">{loadError}</p></Card>}

        {!isLoading && !loadError && property && (
          <form onSubmit={handleSave} noValidate>
            <Card as="section" padding="medium" className="rooma-availability-card">
              <div className="rooma-availability-property">
                <div>
                  <span className="rooma-availability-overline">EDITING PROPERTY</span>
                  <h2>{property.propertyTitle || "Untitled Property"}</h2>
                  <p>{[property.area, property.city].filter(Boolean).join(", ")}</p>
                </div>
                <span className="rooma-availability-current-status">{(property.propertyStatus || "available").replaceAll("_", " ")}</span>
              </div>

              <div className="rooma-availability-fields">
                <div className="rooma-availability-field rooma-availability-field--wide">
                  <label htmlFor="availability-status">Property Status</label>
                  <select
                    id="availability-status"
                    value={values.propertyStatus}
                    onChange={(event) => change("propertyStatus", event.target.value)}
                  >
                    {statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </div>

                {[
                  ["maximumOccupants", "Maximum Occupants"],
                  ["currentOccupants", "Current Occupants"],
                  ["availableSpaces", "Available Spaces"]
                ].map(([name, label]) => (
                  <div className="rooma-availability-field" key={name}>
                    <label htmlFor={`availability-${name}`}>{label}</label>
                    <input
                      id={`availability-${name}`}
                      type="number"
                      min={name === "maximumOccupants" ? 1 : 0}
                      step="1"
                      value={values[name]}
                      onChange={(event) => change(name, event.target.value)}
                      aria-invalid={Boolean(fieldErrors[name])}
                      aria-describedby={fieldErrors[name] ? `availability-${name}-error` : undefined}
                    />
                    {fieldErrors[name] && <small id={`availability-${name}-error`} className="rooma-availability-field-error">{fieldErrors[name]}</small>}
                  </div>
                ))}

                <div className="rooma-availability-field">
                  <label htmlFor="availability-date">Available From</label>
                  <input
                    id="availability-date"
                    type="date"
                    value={values.availableFrom}
                    onChange={(event) => change("availableFrom", event.target.value)}
                    aria-invalid={Boolean(fieldErrors.availableFrom)}
                  />
                  {fieldErrors.availableFrom && <small className="rooma-availability-field-error">{fieldErrors.availableFrom}</small>}
                </div>
              </div>

              {availableCapacity !== null && (
                <div className="rooma-availability-hint">
                  Remaining capacity: <strong>{availableCapacity}</strong>.
                  {values.availableSpaces !== "" && " Available spaces may be lower if some spaces are reserved."}
                </div>
              )}
            </Card>

            {saveError && <p className="rooma-availability-error" role="alert">{saveError}</p>}

            <div className="rooma-availability-actions">
              <Button as={Link} to="/owner/properties" variant="secondary" disabled={isSaving}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Availability"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}

export default ManageAvailability;

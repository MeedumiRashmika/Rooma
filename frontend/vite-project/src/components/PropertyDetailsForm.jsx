import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "./ui/Button";
import Card from "./ui/Card";
import "./PropertyDetailsForm.css";

const API_URL = "http://localhost:5000";

const initialData = {
  bedroomCount: "", bedCount: "", roomType: "", occupancyType: "",
  isFurnished: false, furnishingType: "", hasPrivateEntrance: false,
  hasBalcony: false, hasWindow: false, hasNaturalLight: false,
  bathroomType: "", bathroomCount: "", hasAttachedBathroom: false,
  hasSharedBathroom: false, hasHotWater: false, hasShower: false,
  hasWesternToilet: false, bathroomSharedBy: "",
  hasKitchen: false, kitchenType: "", isCookingAllowed: false,
  hasGasStove: false, hasElectricCooker: false, hasRefrigerator: false,
  hasMicrowave: false, hasPantry: false, hasDrinkingWater: false,
  hasBed: false, hasMattress: false, hasTable: false, hasChair: false,
  hasWardrobe: false, hasCupboard: false, hasSofa: false,
  electricityType: "", waterType: "", wifiType: "",
  electricityCharge: "", waterCharge: "", wifiCharge: "",
  cleaningCharge: "", maintenanceCharge: "", parkingCharge: "",
  hasWifi: false, internetType: "", internetSpeed: "",
  hasParking: false, carParkingSpaces: "", bikeParkingSpaces: "",
  bicycleParkingSpaces: "", hasWashingMachine: false, hasWashingArea: false,
  hasDryingArea: false, hasIroningFacility: false,
  hasCCTV: false, hasSecurityGuard: false, hasGate: false,
  hasKeyAccess: false, hasSeparateEntrance: false,
  hasFireExtinguisher: false, hasEmergencyExit: false
};

const numberFields = [
  "bedroomCount", "bedCount", "bathroomCount", "bathroomSharedBy",
  "electricityCharge", "waterCharge", "wifiCharge", "cleaningCharge",
  "maintenanceCharge", "parkingCharge", "internetSpeed",
  "carParkingSpaces", "bikeParkingSpaces", "bicycleParkingSpaces"
];
const integerFields = new Set([
  "bedroomCount", "bedCount", "bathroomCount", "bathroomSharedBy",
  "carParkingSpaces", "bikeParkingSpaces", "bicycleParkingSpaces"
]);

const sections = [
  {
    title: "Room & Accommodation", subtitle: "Beds, furnishing and room features",
    fields: [
      ["number", "bedroomCount", "Bedrooms"], ["number", "bedCount", "Beds"],
      ["select", "roomType", "Room Type", ["single", "double", "shared"]],
      ["select", "occupancyType", "Occupancy Type", ["private", "shared"]],
      ["toggle", "isFurnished", "Furnished"],
      ["select", "furnishingType", "Furnishing Type", ["fully_furnished", "semi_furnished", "unfurnished"]],
      ["toggle", "hasPrivateEntrance", "Private Entrance"],
      ["toggle", "hasBalcony", "Balcony"],
      ["toggle", "hasWindow", "Windows"],
      ["toggle", "hasNaturalLight", "Natural Light"]
    ]
  },
  {
    title: "Bathroom", subtitle: "Bathroom arrangement and amenities",
    fields: [
      ["select", "bathroomType", "Bathroom Type", ["attached", "shared", "private_external"]],
      ["number", "bathroomCount", "Bathrooms"],
      ["number", "bathroomSharedBy", "Bathroom Shared By (People)"],
      ["toggle", "hasAttachedBathroom", "Attached Bathroom"],
      ["toggle", "hasSharedBathroom", "Shared Bathroom"],
      ["toggle", "hasHotWater", "Hot Water"],
      ["toggle", "hasShower", "Shower"],
      ["toggle", "hasWesternToilet", "Western Toilet"]
    ]
  },
  {
    title: "Kitchen & Cooking", subtitle: "Cooking arrangements and appliances",
    fields: [
      ["toggle", "hasKitchen", "Kitchen Available"],
      ["select", "kitchenType", "Kitchen Type", ["private", "shared", "none"]],
      ["toggle", "isCookingAllowed", "Cooking Allowed"],
      ["toggle", "hasGasStove", "Gas Stove"],
      ["toggle", "hasElectricCooker", "Electric Cooker"],
      ["toggle", "hasRefrigerator", "Refrigerator"],
      ["toggle", "hasMicrowave", "Microwave"],
      ["toggle", "hasPantry", "Pantry"],
      ["toggle", "hasDrinkingWater", "Drinking Water"]
    ]
  },
  {
    title: "Furniture", subtitle: "Furniture provided with the property",
    fields: [
      ["toggle", "hasBed", "Bed"], ["toggle", "hasMattress", "Mattress"],
      ["toggle", "hasTable", "Table"], ["toggle", "hasChair", "Chair"],
      ["toggle", "hasWardrobe", "Wardrobe"], ["toggle", "hasCupboard", "Cupboard"],
      ["toggle", "hasSofa", "Sofa"]
    ]
  },
  {
    title: "Utilities & Charges", subtitle: "Electricity, water, internet and additional monthly costs",
    fields: [
      ["select", "electricityType", "Electricity Payment", ["included", "shared", "separate_meter", "fixed_fee"]],
      ["select", "waterType", "Water Payment", ["included", "shared", "fixed_fee"]],
      ["select", "wifiType", "Wi-Fi Payment", ["included", "paid_separately", "not_available"]],
      ["number", "electricityCharge", "Electricity Charge (LKR)"],
      ["number", "waterCharge", "Water Charge (LKR)"],
      ["number", "wifiCharge", "Wi-Fi Charge (LKR)"],
      ["number", "cleaningCharge", "Cleaning Charge (LKR)"],
      ["number", "maintenanceCharge", "Maintenance Charge (LKR)"],
      ["number", "parkingCharge", "Parking Charge (LKR)"]
    ]
  },
  {
    title: "Internet & Parking", subtitle: "Connectivity and vehicle space",
    fields: [
      ["toggle", "hasWifi", "Wi-Fi Available"],
      ["select", "internetType", "Internet Type", ["fiber", "mobile_broadband", "wifi", "none"]],
      ["number", "internetSpeed", "Internet Speed (Mbps)"],
      ["toggle", "hasParking", "Parking Available"],
      ["number", "carParkingSpaces", "Car Parking Spaces"],
      ["number", "bikeParkingSpaces", "Motorbike Parking Spaces"],
      ["number", "bicycleParkingSpaces", "Bicycle Parking Spaces"]
    ]
  },
  {
    title: "Laundry & Security", subtitle: "Laundry facilities and safety features",
    fields: [
      ["toggle", "hasWashingMachine", "Washing Machine"],
      ["toggle", "hasWashingArea", "Washing Area"],
      ["toggle", "hasDryingArea", "Drying Area"],
      ["toggle", "hasIroningFacility", "Ironing Facility"],
      ["toggle", "hasCCTV", "CCTV"],
      ["toggle", "hasSecurityGuard", "Security Guard"],
      ["toggle", "hasGate", "Gate"],
      ["toggle", "hasKeyAccess", "Key Access"],
      ["toggle", "hasSeparateEntrance", "Separate Entrance"],
      ["toggle", "hasFireExtinguisher", "Fire Extinguisher"],
      ["toggle", "hasEmergencyExit", "Emergency Exit"]
    ]
  }
];

const prettify = (value) => value.replaceAll("_", " ").replace(/\b\w/g, c => c.toUpperCase());

export default function PropertyDetailsForm({ propertyId }) {
  const [formData, setFormData] = useState({ ...initialData });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    const controller = new AbortController();

    const loadPropertyDetails = async () => {
      setLoading(true);
      setError("");
      setSuccess("");
      setFieldErrors({});
      setFormData({ ...initialData });

      if (!propertyId) {
        setError("Property ID is missing.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/property-details/${encodeURIComponent(propertyId)}`,
          { signal: controller.signal, cache: "no-store" }
        );
        if (response.status === 404) return; // No details saved yet: show blank form.
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || "Could not load property details.");
        }
        if (!controller.signal.aborted) {
          const sanitized = Object.fromEntries(
            Object.keys(initialData).map(key => [key, result.data?.[key] ?? initialData[key]])
          );
          setFormData(sanitized);
        }
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void Promise.resolve().then(loadPropertyDetails);
    return () => controller.abort();
  }, [propertyId]);

  const updateField = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: "" }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async event => {
    event.preventDefault();
    if (saving || loading || !propertyId) return;

    const errors = {};
    const payload = { ...formData };
    for (const name of numberFields) {
      const raw = formData[name];
      if (raw === "" || raw === null || raw === undefined) {
        payload[name] = null;
      } else {
        const numeric = Number(raw);
        if (!Number.isFinite(numeric) || numeric < 0 ||
            (integerFields.has(name) && !Number.isInteger(numeric))) {
          errors[name] = integerFields.has(name)
            ? "Enter a whole number of 0 or more."
            : "Enter a number of 0 or more.";
        } else {
          payload[name] = numeric;
        }
      }
    }
    // Blank select fields should be removed/unset by the backend, not stored as invalid enum values.
    for (const [key, value] of Object.entries(payload)) {
      if (value === "") payload[key] = null;
    }
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      setError("Please correct the highlighted fields before saving.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(
        `${API_URL}/api/property-details/${encodeURIComponent(propertyId)}`,
        { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        const detail = Array.isArray(result.errors) ? result.errors.join("; ") : "";
        throw new Error([result.message, detail].filter(Boolean).join(": ") || "Save failed.");
      }
      setSuccess("Property details saved successfully!");
    } catch (err) {
      setError(err.message || "Unable to save property details.");
    } finally {
      setSaving(false);
    }
  };

  const renderField = ([kind, name, label, choices]) => {
    if (kind === "toggle") {
      return (
        <label className="rooma-details-toggle" key={name}>
          <span>{label}</span>
          <input type="checkbox" checked={Boolean(formData[name])}
            onChange={e => updateField(name, e.target.checked)} disabled={loading || saving} />
        </label>
      );
    }
    return (
      <div className="rooma-details-field" key={name}>
        <label htmlFor={`details-${name}`}>{label}</label>
        {kind === "select" ? (
          <select id={`details-${name}`} value={formData[name] ?? ""}
            onChange={e => updateField(name, e.target.value)} disabled={loading || saving}>
            <option value="">Not specified</option>
            {choices.map(value => <option key={value} value={value}>{prettify(value)}</option>)}
          </select>
        ) : (
          <input id={`details-${name}`} type="number" min="0"
            step={integerFields.has(name) ? "1" : "any"}
            value={formData[name] ?? ""} disabled={loading || saving}
            onChange={e => updateField(name, e.target.value)}
            aria-invalid={Boolean(fieldErrors[name])}/>
        )}
        {fieldErrors[name] && <small className="rooma-details-field-error">{fieldErrors[name]}</small>}
      </div>
    );
  };

  return (
    <div className="rooma-details-page">
      <div className="rooma-details-container">
        <div className="rooma-details-topline">
          <div>
            <span className="rooma-details-eyebrow">RO O M A / PROPERTY MANAGEMENT</span>
            <h1>Property Details & Facilities</h1>
            <p>Update room details, utilities, facilities and security in one place.</p>
          </div>
          <Button as={Link} to="/owner/properties" variant="secondary" size="small">
            ← Back to Properties
          </Button>
        </div>

        {loading ? (
          <Card padding="large"><p>Loading property details...</p></Card>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {error && <p className="rooma-details-message error" role="alert">{error}</p>}
            {success && <p className="rooma-details-message success" role="status">{success}</p>}
            {sections.map((section, index) => (
              <Card key={section.title} as="section" padding="large" className="rooma-details-section">
                <div className="rooma-details-section-heading">
                  <span className="rooma-details-step">{String(index + 1).padStart(2, "0")}</span>
                  <div><h2>{section.title}</h2><p>{section.subtitle}</p></div>
                </div>
                <div className="rooma-details-grid">
                  {section.fields.map(renderField)}
                </div>
              </Card>
            ))}
            <div className="rooma-details-actions">
              <Button as={Link} to="/owner/properties" variant="secondary" disabled={saving}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={saving || !propertyId}>
                {saving ? "Saving..." : "Save Property Details"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}


import { useEffect, useState } from "react";
import PropertyCard from "../../components/owner/PropertyCard";
import "./OwnerDashboard.css";
import { Link, useLocation } from "react-router-dom";

const API_URL = "http://localhost:5000";

function ManageProperties() {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const location = useLocation();

  useEffect(() => {
    const controller = new AbortController();

    const loadProperties = async () => {
      try {
        setIsLoading(true);

        const response = await fetch(
          `${API_URL}/api/properties`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Failed to retrieve properties");
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message);
        }

        if (!controller.signal.aborted) {
          setProperties(result.data);
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

    loadProperties();

    return () => controller.abort();
  }, []);

  return (
    <main className="rooma-owner-page">
      <div className="rooma-owner-container">

        <header className="rooma-owner-header">
          <div>
            <span className="rooma-owner-eyebrow">
              ROOMA PROPERTY MANAGEMENT
            </span>

            <h1>Manage Properties</h1>

            <p>
              View property listings and manage
              accommodation information.
            </p>
          </div>
          <Link
  to="/owner/properties/new"
  className="rooma-card-button primary"
  style={{
    flex: "none",
    padding: "14px 22px"
  }}
>
  + Add New Property
</Link>
        </header>
        {location.state?.successMessage && (
  <p className="rooma-form-message success" role="status">
    {location.state.successMessage}
  </p>
)}

        <div className="rooma-owner-summary">
          <div className="rooma-summary-card">
            <span>Total Listings</span>
            <strong>{properties.length}</strong>
          </div>

          <div className="rooma-summary-card">
            <span>Available</span>
            <strong>
              {properties.filter(
                (property) =>
                  property.propertyStatus === "available"
              ).length}
            </strong>
          </div>

          <div className="rooma-summary-card">
            <span>Occupied</span>
            <strong>
              {properties.filter(
                (property) =>
                  property.propertyStatus === "occupied"
              ).length}
            </strong>
          </div>
        </div>

        {isLoading && (
          <p>Loading properties...</p>
        )}

        {errorMessage && (
          <p className="rooma-owner-error" role="alert">
            {errorMessage}
          </p>
        )}

        {!isLoading &&
          !errorMessage &&
          properties.length === 0 && (
            <div className="rooma-empty-state">
              <h2>No properties found</h2>
              <p>
                Create a property listing to get started.
              </p>
            </div>
          )}

        {!isLoading &&
          !errorMessage &&
          properties.length > 0 && (
            <div className="rooma-property-grid">
              {properties.map((property) => (
                <PropertyCard
                  key={property.propertyId}
                  property={property}
                />
              ))}
            </div>
          )}

      </div>
    </main>
  );
}

export default ManageProperties;

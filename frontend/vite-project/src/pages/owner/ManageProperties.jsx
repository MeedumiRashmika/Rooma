
import { useEffect, useState } from "react";
import PropertyCard from "../../components/owner/PropertyCard";
import "./OwnerDashboard.css";
import { Link, useLocation } from "react-router-dom";

const API_URL = "http://localhost:5000";

function ManageProperties() {
  const [properties, setProperties] = useState([]);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
const [isDeleting, setIsDeleting] = useState(false);
const [deleteError, setDeleteError] = useState("");
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


const handleDeleteProperty = (property) => {
  setPropertyToDelete(property);
  setDeleteError("");
};

const confirmDeleteProperty = async () => {
  if (!propertyToDelete || isDeleting) return;

  setIsDeleting(true);
  setDeleteError("");

  try {
    const response = await fetch(
      `http://localhost:5000/api/properties/${encodeURIComponent(
        propertyToDelete.propertyId
      )}`,
      {
        method: "DELETE"
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message || "Failed to delete property"
      );
    }

    setProperties((previous) =>
      previous.filter(
        (property) =>
          property.propertyId !== propertyToDelete.propertyId
      )
    );

    setPropertyToDelete(null);
  } catch (error) {
    setDeleteError(error.message || "Unable to delete property.");
  } finally {
    setIsDeleting(false);
  }
};


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
  onDelete={handleDeleteProperty}
                />
              ))}
            </div>
          )}

{propertyToDelete && (
  <div className="rooma-delete-overlay">
    <div
      className="rooma-delete-modal"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="rooma-delete-title"
      aria-describedby="rooma-delete-description"
    >
      <div className="rooma-delete-icon">
        🗑️
      </div>

      <h2 id="rooma-delete-title">
        Delete Property?
      </h2>

      <p id="rooma-delete-description">
        Are you sure you want to delete
        <strong> {propertyToDelete.propertyTitle}</strong>?
        This action cannot be undone.
      </p>

      {deleteError && (
        <p className="rooma-delete-error" role="alert">
          {deleteError}
        </p>
      )}

      <div className="rooma-delete-actions">
        <button
          type="button"
          className="rooma-delete-cancel"
          onClick={() => setPropertyToDelete(null)}
          disabled={isDeleting}
        >
          Cancel
        </button>

        <button
          type="button"
          className="rooma-delete-confirm"
          onClick={confirmDeleteProperty}
          disabled={isDeleting}
        >
          {isDeleting ? "Deleting..." : "Delete Property"}
        </button>
      </div>
    </div>
  </div>
)}

      </div>
    </main>
  );
}

export default ManageProperties;

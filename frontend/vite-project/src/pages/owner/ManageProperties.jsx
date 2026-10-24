import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import PropertyCard from "../../components/owner/PropertyCard";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

import "./OwnerDashboard.css";

const API_URL = "http://localhost:5000";

function ManageProperties() {
  const location = useLocation();
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [successToast, setSuccessToast] = useState(
    () => location.state?.successMessage || "",
  );

  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // ----------------------------------
  // SHOW SUCCESS MESSAGE ONCE
  // ----------------------------------

  useEffect(() => {
    const message = location.state?.successMessage;

    if (!message) return;

    // Remove successMessage from browser history,
    // so it won't reappear on page refresh/back.
    const remainingState = { ...location.state };
    delete remainingState.successMessage;

    navigate(location.pathname + location.search + location.hash, {
      replace: true,
      state: remainingState,
    });
  }, [
    location.state,
    location.pathname,
    location.search,
    location.hash,
    navigate,
  ]);

  // Auto-hide success message after 5 seconds
  useEffect(() => {
    if (!successToast) return;

    const timer = setTimeout(() => {
      setSuccessToast("");
    }, 5000);

    return () => clearTimeout(timer);
  }, [successToast]);

  // ----------------------------------
  // LOAD PROPERTIES
  // ----------------------------------

  useEffect(() => {
    const controller = new AbortController();

    const loadProperties = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await fetch(`${API_URL}/api/properties`, {
          signal: controller.signal,
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load properties");
        }

        if (!controller.signal.aborted) {
          setProperties(Array.isArray(result.data) ? result.data : []);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          setErrorMessage(error.message || "Unable to load properties");
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

  // ----------------------------------
  // STATISTICS
  // ----------------------------------

  const totalProperties = properties.length;

  const availableProperties = properties.filter(
    (property) => property.propertyStatus === "available",
  ).length;

  const occupiedProperties = properties.filter(
    (property) => property.propertyStatus === "occupied",
  ).length;

  // ----------------------------------
  // DELETE PROPERTY
  // ----------------------------------

  const handleDeleteProperty = (property) => {
    setDeleteError("");
    setPropertyToDelete(property);
  };

  const confirmDeleteProperty = async () => {
    if (!propertyToDelete || isDeleting) return;

    setIsDeleting(true);
    setDeleteError("");

    try {
      const response = await fetch(
        `${API_URL}/api/properties/${encodeURIComponent(
          propertyToDelete.propertyId,
        )}`,
        {
          method: "DELETE",
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete property");
      }

      setProperties((previous) =>
        previous.filter(
          (property) => property.propertyId !== propertyToDelete.propertyId,
        ),
      );

      setPropertyToDelete(null);
      setSuccessToast("Property deleted successfully!");
    } catch (error) {
      setDeleteError(error.message || "Unable to delete property");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <main className="rooma-owner-page">
      <div className="rooma-owner-container">
        {/* HEADER */}

        <header className="rooma-owner-header">
          <div>
            <span className="rooma-owner-eyebrow">
              ROOMA PROPERTY MANAGEMENT
            </span>

            <h1>Manage Properties</h1>

            <p>View property listings and manage accommodation information.</p>
          </div>

          <Button as={Link} to="/owner/properties/new" variant="primary">
            + Add New Property
          </Button>
        </header>

        {/* SUCCESS TOAST */}

        {successToast && (
          <div className="rooma-owner-toast" role="status">
            <span className="rooma-owner-toast-icon">✓</span>

            <span>{successToast}</span>

            <button
              type="button"
              className="rooma-owner-toast-close"
              aria-label="Dismiss message"
              onClick={() => setSuccessToast("")}
            >
              ×
            </button>
          </div>
        )}

        {/* COMPACT STATISTICS */}

        <div className="rooma-owner-summary">
          <Card className="rooma-summary-card rooma-stat-total" padding="none">
            <div className="rooma-stat-content">
              <div className="rooma-stat-heading">
                <span>Total Listings</span>

                <span className="rooma-stat-icon" aria-hidden="true">
                  ⌂
                </span>
              </div>

              <strong>{isLoading ? "—" : totalProperties}</strong>

              <small>All property listings</small>
            </div>
          </Card>

          <Card
            className="rooma-summary-card rooma-stat-available"
            padding="none"
          >
            <div className="rooma-stat-content">
              <div className="rooma-stat-heading">
                <span>Available</span>

                <span className="rooma-stat-icon" aria-hidden="true">
                  ✓
                </span>
              </div>

              <strong>{isLoading ? "—" : availableProperties}</strong>

              <small>Ready for residents</small>
            </div>
          </Card>

          <Card
            className="rooma-summary-card rooma-stat-occupied"
            padding="none"
          >
            <div className="rooma-stat-content">
              <div className="rooma-stat-heading">
                <span>Occupied</span>

                <span className="rooma-stat-icon" aria-hidden="true">
                  ▣
                </span>
              </div>

              <strong>{isLoading ? "—" : occupiedProperties}</strong>

              <small>Currently occupied</small>
            </div>
          </Card>
        </div>

        {/* LOADING */}

        {isLoading && <p>Loading properties...</p>}

        {/* ERROR */}

        {errorMessage && (
          <p className="rooma-owner-error" role="alert">
            {errorMessage}
          </p>
        )}

        {/* EMPTY STATE */}

        {!isLoading && !errorMessage && properties.length === 0 && (
          <Card className="rooma-empty-state" padding="large">
            <h2>No properties found</h2>

            <p>Create a property listing to get started.</p>

            <Button as={Link} to="/owner/properties/new" variant="primary">
              Add Your First Property
            </Button>
          </Card>
        )}

        {/* PROPERTY LIST */}

        {!isLoading && !errorMessage && properties.length > 0 && (
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

        {/* DELETE CONFIRMATION */}

        {propertyToDelete && (
          <div className="rooma-delete-overlay">
            <Card
              className="rooma-delete-modal"
              padding="large"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="rooma-delete-title"
              aria-describedby="rooma-delete-description"
            >
              <div className="rooma-delete-icon">🗑️</div>

              <h2 id="rooma-delete-title">Delete Property?</h2>

              <p id="rooma-delete-description">
                Are you sure you want to delete{" "}
                <strong>{propertyToDelete.propertyTitle}</strong>? This action
                cannot be undone.
              </p>

              {deleteError && (
                <p className="rooma-delete-error" role="alert">
                  {deleteError}
                </p>
              )}

              <div className="rooma-delete-actions">
                <Button
                  variant="secondary"
                  fullWidth
                  disabled={isDeleting}
                  onClick={() => setPropertyToDelete(null)}
                >
                  Cancel
                </Button>

                <Button
                  variant="danger"
                  fullWidth
                  disabled={isDeleting}
                  onClick={confirmDeleteProperty}
                >
                  {isDeleting ? "Deleting..." : "Delete Property"}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}

export default ManageProperties;

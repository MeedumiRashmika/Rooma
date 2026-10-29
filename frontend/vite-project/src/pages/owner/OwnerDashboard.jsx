
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./OwnerDashboardHome.css";

const API_URL = "http://localhost:5000";

const currency = (value) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0
  }).format(Number(value) || 0);

const formatDate = (date) => {
  if (!date) return "—";
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime())
    ? "—"
    : parsed.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
};

function OwnerDashboard() {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadProperties = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/properties`,
          { signal: controller.signal }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to load properties"
          );
        }

        if (!controller.signal.aborted) {
          setProperties(
            Array.isArray(result.data) ? result.data : []
          );
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

  const totalProperties = properties.length;

  const availableProperties = properties.filter(
    (property) => property.propertyStatus === "available"
  ).length;

  const occupiedProperties = properties.filter(
    (property) => property.propertyStatus === "occupied"
  ).length;

  const reservedProperties = properties.filter(
    (property) => property.propertyStatus === "reserved"
  ).length;

  const recentProperties = [...properties]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    )
    .slice(0, 5);

  const stats = [
    {
      label: "Total Properties",
      value: totalProperties,
      symbol: "🏘️",
      tone: "sage"
    },
    {
      label: "Available",
      value: availableProperties,
      symbol: "✓",
      tone: "green"
    },
    {
      label: "Occupied",
      value: occupiedProperties,
      symbol: "👥",
      tone: "peach"
    },
    {
      label: "Reserved",
      value: reservedProperties,
      symbol: "📅",
      tone: "lavender"
    }
  ];

  return (
    <main className="rooma-dash">
      <div className="rooma-dash-container">

        <div className="rooma-dash-header">
          <div>
            <span className="rooma-dash-eyebrow">
              ROOMA / PROPERTY OWNER
            </span>
            <h1>Owner Dashboard</h1>
            <p>
              Manage your properties from one convenient place.
            </p>
          </div>

          <Link
            className="rooma-dash-add"
            to="/owner/properties/new"
          >
            + Add Property
          </Link>
        </div>

        {errorMessage && (
          <div className="rooma-dash-error" role="alert">
            {errorMessage}
            <button
              type="button"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        )}

        <section className="rooma-dash-stats">
          {stats.map((stat) => (
            <article
              className={`rooma-dash-stat ${stat.tone}`}
              key={stat.label}
            >
              <div className="rooma-dash-stat-top">
                <span>{stat.label}</span>
                <span className="rooma-dash-stat-icon">
                  {stat.symbol}
                </span>
              </div>

              <strong>
                {isLoading ? "—" : stat.value}
              </strong>

              <small>
                {stat.label === "Total Properties"
                  ? "All property listings"
                  : `${stat.label} listings`}
              </small>
            </article>
          ))}
        </section>

        <section className="rooma-dash-shortcuts">
          <div className="rooma-dash-section-heading">
            <div>
              <h2>Quick Actions</h2>
              <p>Frequently used owner tools.</p>
            </div>
          </div>

          <div className="rooma-dash-action-grid">
            <Link
              to="/owner/properties/new"
              className="rooma-dash-action"
            >
              <span className="rooma-dash-action-icon">
                ＋
              </span>
              <strong>Add New Property</strong>
              <small>Create an accommodation listing</small>
            </Link>

            <Link
              to="/owner/properties"
              className="rooma-dash-action"
            >
              <span className="rooma-dash-action-icon">
                ▦
              </span>
              <strong>Manage Properties</strong>
              <small>Edit details, images and rules</small>
            </Link>
          </div>
        </section>

        <section className="rooma-dash-listings">
          <div className="rooma-dash-section-heading">
            <div>
              <h2>Recent Properties</h2>
              <p>Your latest accommodation listings.</p>
            </div>

            <Link to="/owner/properties">
              View All →
            </Link>
          </div>

          {isLoading ? (
            <p className="rooma-dash-empty">
              Loading properties...
            </p>
          ) : errorMessage ? (
            <p className="rooma-dash-empty">
              Properties could not be loaded.
            </p>
          ) : recentProperties.length === 0 ? (
            <div className="rooma-dash-empty">
              <h3>No properties yet</h3>
              <p>
                Create your first property to get started.
              </p>
              <Link to="/owner/properties/new">
                Add Property →
              </Link>
            </div>
          ) : (
            <div className="rooma-dash-table-wrap">
              <table className="rooma-dash-table">
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Location</th>
                    <th>Monthly Rent</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {recentProperties.map((property) => (
                    <tr key={property.propertyId}>
                      <td className="rooma-dash-name">
                        {property.propertyTitle}
                      </td>

                      <td>
                        {[property.area, property.city]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </td>

                      <td>
                        {currency(property.monthlyRent)}
                      </td>

                      <td>
                        <span
                          className={`rooma-dash-status ${
                            property.propertyStatus
                          }`}
                        >
                          {String(
                            property.propertyStatus || "unknown"
                          ).replaceAll("_", " ")}
                        </span>
                      </td>

                      <td>
                        {formatDate(property.createdAt)}
                      </td>

                      <td>
                        <Link
                          to={`/owner/properties/${
                            property.propertyId
                          }/edit`}
                          className="rooma-dash-edit"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>
    </main>
  );
}

export default OwnerDashboard;

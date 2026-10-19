
import { Link } from "react-router-dom";
import PropertyForm from "../../components/owner/PropertyForm";
import "./OwnerDashboard.css";

function AddProperty() {
  return (
    <main className="rooma-owner-page">
      <div className="rooma-owner-container">

        <header className="rooma-owner-header">
          <div>
            <span className="rooma-owner-eyebrow">
              ROOMA / PROPERTY MANAGEMENT
            </span>

            <h1>Add New Property</h1>

            <p>
              Enter your accommodation details to
              create a new property listing.
            </p>
          </div>

          <Link
            to="/owner/properties"
            className="rooma-form-cancel"
            style={{ textDecoration: "none" }}
          >
            Back to Properties
          </Link>
        </header>

        <PropertyForm />

      </div>
    </main>
  );
}

export default AddProperty;


import { Link, useParams } from "react-router-dom";
import PropertyImageUpload from "../../components/owner/PropertyImageUpload";
import Button from "../../components/ui/Button";

function ManagePropertyImages() {
  const { propertyId } = useParams();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--rooma-background)",
      }}
    >
      <div
        style={{
          maxWidth: "1240px",
          margin: "0 auto",
          padding: "24px 24px 0",
        }}
      >
        <Button
          as={Link}
          to="/owner/properties"
          variant="secondary"
        >
          ← Back to Properties
        </Button>
      </div>

      {propertyId ? (
        <PropertyImageUpload propertyId={propertyId} />
      ) : (
        <p style={{ padding: "24px" }}>
          Property ID not found.
        </p>
      )}
    </div>
  );
}

export default ManagePropertyImages;

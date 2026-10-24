
import { Link, useParams } from "react-router-dom";
import PropertyImageUpload from "../../components/owner/PropertyImageUpload";

function ManagePropertyImages() {
  const { propertyId } = useParams();

  return (
    <>
      <div style={{
        padding: "20px",
        background: "#F8F7F3"
      }}>
        <Link
          to="/owner/properties"
          style={{ color: "#557D5B" }}
        >
          ← Back to Properties
        </Link>
      </div>

      <PropertyImageUpload propertyId={propertyId} />
    </>
  );
}

export default ManagePropertyImages;

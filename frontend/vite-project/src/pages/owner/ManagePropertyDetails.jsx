
import { useParams } from "react-router-dom";
import PropertyDetailsForm from "../../components/PropertyDetailsForm";

export default function ManagePropertyDetails() {
  const { propertyId } = useParams();
  return <PropertyDetailsForm propertyId={propertyId} />;
}


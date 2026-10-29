
import {
  BrowserRouter,
  Routes,
  Route,
  useParams
} from "react-router-dom";

// Existing pages
import Home from "./pages/Home";

// Owner pages
import ManageProperties from "./pages/owner/ManageProperties";
import AddProperty from "./pages/owner/AddProperty";
import EditProperty from "./pages/owner/EditProperty";
import ManagePropertyImages from "./pages/owner/ManagePropertyImages";
import ManagePropertyDetails from "./pages/owner/ManagePropertyDetails";
import ManageAvailability from "./components/owner/ManageAvailability";

// Property Rules
import PropertyRulesForm from "./components/PropertyRulesForm";

function PropertyRulesPage() {
  const { propertyId } = useParams();

  return <PropertyRulesForm propertyId={propertyId} />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Home - Developer 1 */}
        <Route
          path="/"
          element={<Home />}
        />

        {/* Manage Properties */}
        <Route
          path="/owner/properties"
          element={<ManageProperties />}
        />

        {/* Add Property */}
        <Route
          path="/owner/properties/new"
          element={<AddProperty />}
        />

        {/* Edit Property */}
        <Route
          path="/owner/properties/:propertyId/edit"
          element={<EditProperty />}
        />

        {/* Manage Images */}
        <Route
          path="/owner/properties/:propertyId/images"
          element={<ManagePropertyImages />}
        />

        {/* Property Rules */}
        <Route
          path="/owner/properties/:propertyId/rules"
          element={<PropertyRulesPage />}
        />

        {/* Property Details & Facilities */}
        <Route
          path="/owner/properties/:propertyId/details"
          element={<ManagePropertyDetails />}
        />

        {/* Availability Management */}
        <Route
          path="/owner/properties/:propertyId/availability"
          element={<ManageAvailability />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;

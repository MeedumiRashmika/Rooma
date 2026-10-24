import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import Home from "./pages/Home";
import PropertyRulesForm from "./components/PropertyRulesForm";
import ManageProperties from "./pages/owner/ManageProperties";
import AddProperty from "./pages/owner/AddProperty";
import ManagePropertyImages from "./pages/owner/ManagePropertyImages";
import EditProperty from "./pages/owner/EditProperty";
import OwnerDashboard from "./pages/owner/OwnerDashboard";

function PropertyRulesPage() {
  const { propertyId } = useParams();

  return <PropertyRulesForm propertyId={propertyId} />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Existing Home Page */}
        <Route path="/" element={<Home />} />

        {/* Property Rules & Pets Page */}
        <Route
          path="/owner/properties/:propertyId/rules"
          element={<PropertyRulesPage />}
        />
        <Route path="/owner/properties" element={<ManageProperties />} />
        <Route path="/owner/properties/new" element={<AddProperty />} />
        <Route
          path="/owner/properties/:propertyId/images"
          element={<ManagePropertyImages />}
        />
        <Route
          path="/owner/properties/:propertyId/edit"
          element={<EditProperty />}
        />
        <Route path="/owner/dashboard" element={<OwnerDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

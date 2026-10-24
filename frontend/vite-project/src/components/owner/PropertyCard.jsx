
import { Link } from "react-router-dom";
import "./PropertyCard.css";
import { useEffect, useState } from "react";

const propertyTypeLabels = {
  boarding_room: "Boarding Room",
  annex: "Annex",
  apartment: "Apartment",
  house_room: "House Room",
  hostel: "Hostel",
  studio: "Studio",
  shared_room: "Shared Room"
};

function PropertyCard({ property, onDelete }) {
  const {
    propertyId,
    propertyTitle,
    propertyType,
    propertyStatus,
    monthlyRent,
    city,
    area,
    availableSpaces,
    keyFacilities,
    overallRating,
    reviewCount
  } = property;

  const formattedRent = Number(monthlyRent || 0)
    .toLocaleString("en-LK");

    
const [uploadedCoverImage, setUploadedCoverImage] = useState("");

useEffect(() => {
  if (!propertyId) return;

  const controller = new AbortController();

  const loadCoverImage = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/property-images/${encodeURIComponent(propertyId)}`,
        { signal: controller.signal }
      );

      if (!response.ok) return;

      const result = await response.json();

      const coverImage = result.data?.find(
        (image) => image.isCoverImage
      ) || result.data?.[0];

      if (coverImage) {
        setUploadedCoverImage(
          `http://localhost:5000${coverImage.imageUrl}`
        );
      } else {
        setUploadedCoverImage("");
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Failed to load cover image", error);
      }
    }
  };

  loadCoverImage();

  return () => controller.abort();
}, [propertyId]);


  return (
    <article className="rooma-property-card">

      <div className="rooma-property-image">
        {uploadedCoverImage ? (
          <img
            src={uploadedCoverImage}
            alt={propertyTitle}
            loading="lazy"
          />
        ) : (
          <div className="rooma-image-placeholder">
            <span>🏠</span>
            <p>No property image</p>
          </div>
        )}

        <span className="rooma-property-status">
          {propertyStatus?.replaceAll("_", " ")}
        </span>
      </div>

      <div className="rooma-property-content">

        <p className="rooma-property-type">
          {propertyTypeLabels[propertyType] || propertyType}
        </p>

        <h3>{propertyTitle}</h3>

        <p className="rooma-property-location">
          📍 {area}, {city}
        </p>

        <div className="rooma-property-facilities">
          {Array.isArray(keyFacilities) &&
            keyFacilities.map((facility, index) => (
              <span key={index}>{facility}</span>
            ))
          }
        </div>

        {overallRating != null && (
          <p className="rooma-property-rating">
            ⭐ {overallRating}
            {reviewCount != null && ` (${reviewCount})`}
          </p>
        )}

        <div className="rooma-property-info">
          <div>
            <small>Monthly Rent</small>
            <strong>Rs. {formattedRent}</strong>
          </div>

          <div>
            <small>Available Spaces</small>
            <strong>{availableSpaces ?? "N/A"}</strong>
          </div>
        </div>

        <div className="rooma-property-actions">
          <Link
            to={`/owner/properties/${propertyId}/edit`}
            className="rooma-card-button primary"
          >
            Edit Property
          </Link>

          <Link
            to={`/owner/properties/${propertyId}/rules`}
            className="rooma-card-button secondary"
          >
            Manage Rules
          </Link>
          <Link
  to={`/owner/properties/${propertyId}/images`}
  className="rooma-card-button secondary"
>
  Manage Images
</Link>

          <button
             type="button"
  className="rooma-card-button delete"
  disabled={!onDelete}
  onClick={() => onDelete(property)}
          >
            Delete
          </button>
        </div>

      </div>
    </article>
  );
}

export default PropertyCard;

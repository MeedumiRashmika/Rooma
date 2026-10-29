import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Button from "../ui/Button";
import Card from "../ui/Card";

import "./PropertyCard.css";

const API_URL = "http://localhost:5000";

const propertyTypeLabels = {
  boarding_room: "Boarding Room",
  annex: "Annex",
  apartment: "Apartment",
  house_room: "House Room",
  hostel: "Hostel",
  studio: "Studio",
  shared_room: "Shared Room",
};

// Convert image path to a complete URL
function getImageUrl(imageUrl) {
  if (!imageUrl || typeof imageUrl !== "string") {
    return "";
  }

  try {
    return new URL(imageUrl, `${API_URL}/`).href;
  } catch {
    return "";
  }
}

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
  } = property;

  // Cover image state
  const [coverImageState, setCoverImageState] = useState({
    propertyId: null,
    url: "",
    error: false,
  });

  const uploadedCoverImage =
    coverImageState.propertyId === propertyId ? coverImageState.url : "";

  const imageError =
    coverImageState.propertyId === propertyId ? coverImageState.error : false;

  const formattedRent = Number(monthlyRent || 0).toLocaleString("en-LK");

  // ---------------------------------------
  // Load property cover image
  // ---------------------------------------

  useEffect(() => {
    const controller = new AbortController();

    if (!propertyId) {
      return () => controller.abort();
    }

    const loadCoverImage = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/property-images/${encodeURIComponent(propertyId)}`,
          {
            method: "GET",
            signal: controller.signal,
            cache: "no-store",
          },
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load property images");
        }

        const images = Array.isArray(result.data) ? result.data : [];

        console.log(`[Rooma] Property ${propertyId} images:`, images);

        // Find selected cover image
        // Otherwise use first uploaded image
        const coverImage =
          images.find(
            (image) =>
              image.isCoverImage === true || image.isCoverImage === "true",
          ) || images[0];

        const imageUrl = getImageUrl(coverImage?.imageUrl);

        if (!controller.signal.aborted) {
          setCoverImageState({
            propertyId,
            url: imageUrl,
            error: false,
          });
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error(`[Rooma] Cover image error for ${propertyId}:`, error);

          if (!controller.signal.aborted) {
            setCoverImageState({
              propertyId,
              url: "",
              error: true,
            });
          }
        }
      }
    };

    loadCoverImage();

    return () => controller.abort();
  }, [propertyId]);

  // ---------------------------------------
  // Delete property
  // ---------------------------------------

  const handleDeleteClick = () => {
    if (typeof onDelete === "function") {
      onDelete(property);
    }
  };

  return (
    <Card as="article" padding="none" className="rooma-property-card">
      {/* PROPERTY IMAGE */}

      <div className="rooma-property-image">
        {uploadedCoverImage && !imageError ? (
          <img
            src={uploadedCoverImage}
            alt={propertyTitle || "Property image"}
            loading="lazy"
            onError={() => {
              console.error("[Rooma] Image URL failed:", uploadedCoverImage);

              setCoverImageState((previous) => ({
                ...previous,
                propertyId,
                error: true,
              }));
            }}
          />
        ) : (
          <div className="rooma-image-placeholder">
            <span>🏠</span>
            <p>No property image</p>
          </div>
        )}

        <span className="rooma-property-status">
          {String(propertyStatus || "available").replaceAll("_", " ")}
        </span>
      </div>

      {/* COMPACT PROPERTY DETAILS */}

      <div className="rooma-property-content">
        <div className="rooma-property-topline">
          <span className="rooma-property-type">
            {propertyTypeLabels[propertyType] || propertyType || "Property"}
          </span>

          <span className="rooma-property-inline-status">
            {String(propertyStatus || "available").replaceAll("_", " ")}
          </span>
        </div>

        <h3>{propertyTitle || "Untitled Property"}</h3>

        <p className="rooma-property-location">
          📍{" "}
          {[area, city].filter(Boolean).join(", ") || "Location not provided"}
        </p>

        <div className="rooma-property-compact-info">
          <div>
            <strong>Rs. {formattedRent}</strong>
            <span>/month</span>
          </div>

          <small>{availableSpaces ?? "N/A"} spaces available</small>
        </div>

        {/* SHARED UI BUTTONS */}

        <div className="rooma-property-actions">
          <Button
            as={Link}
            to={`/owner/properties/${propertyId}/edit`}
            variant="primary"
            size="small"
          >
            Edit
          </Button>

          <Button
            as={Link}
            to={`/owner/properties/${propertyId}/images`}
            variant="secondary"
            size="small"
          >
            Images
          </Button>

          <Button
            as={Link}
            to={`/owner/properties/${propertyId}/rules`}
            variant="secondary"
            size="small"
          >
            Rules
          </Button>
          <Button
            as={Link}
            to={`/owner/properties/${propertyId}/details`}
            variant="secondary"
            size="small"
          >
            Details
          </Button>

          <Button
            type="button"
            className="rooma-card-button delete"
            disabled={!onDelete}
            onClick={handleDeleteClick}
          >
            Delete
          </Button>

          <Button
            as={Link}
            to={`/owner/properties/${propertyId}/availability`}
            variant="secondary"
            size="small"
          >
            Availability
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default PropertyCard;

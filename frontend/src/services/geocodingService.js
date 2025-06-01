// src/services/geocodingService.js

/**
 * Fetches coordinates for a given address using the Nominatim API.
 * @param {string} addressQuery - The address string to search for (e.g., "123 Main St, Anytown, CA, 12345").
 * @returns {Promise<{lat: number, lon: number} | null>} A promise that resolves to an object with lat and lon, or null if not found or an error occurs.
 */
export const fetchCoordinatesFromAddress = async (addressQuery) => {
  if (!addressQuery || addressQuery.trim() === "") {
    console.warn("Geocoding: Address query is empty.");
    return null;
  }

  const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/search";
  // It's good practice to include a User-Agent that identifies your application.
  // For a real application, replace 'YourAppName/1.0 (your-contact-email@example.com)'
  // with your actual app name and contact.
  const userAgent = "DropNestApp/1.0 (dropnest-dev@example.com)";

  const params = new URLSearchParams({
    q: addressQuery,
    format: "json",
    addressdetails: "1",
    limit: "1", // We only want the top result
  });

  const url = `${NOMINATIM_BASE_URL}?${params.toString()}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": userAgent, // Nominatim API usage policy may require a User-Agent
      },
    });

    if (!response.ok) {
      console.error(
        `Geocoding: Nominatim API request failed with status ${response.status}`
      );
      return null;
    }

    const data = await response.json();

    if (data && data.length > 0) {
      const result = data[0];
      return {
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon),
      };
    } else {
      console.warn(
        "Geocoding: No results found for the address:",
        addressQuery
      );
      return null;
    }
  } catch (error) {
    console.error("Geocoding: Error fetching coordinates:", error);
    return null;
  }
};

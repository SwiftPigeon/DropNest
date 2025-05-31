import {
  GoogleMap,
  Marker,
  useLoadScript,
  DirectionsRenderer,
} from "@react-google-maps/api";
import React, { useEffect, useRef, useState } from "react";
import AppHeader from "../components/Layout/Header";
import { Layout, Steps } from "antd";
import {
  AimOutlined,
  CloseCircleFilled,
  EnvironmentOutlined,
} from "@ant-design/icons";

const { Content } = Layout;
const { Step } = Steps;

const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const GOOGLE_MAP_LIBRARIES = ["places"];

// the initial location when rendering the Google Map for the first time,
// until the user clicks on the map
const center = {
  lat: 37.7749,
  lng: -122.4194,
};

// call the Google Places Autocomplete API to get autocomplete address based on the user input
async function fetchAutocompleteAddress(input, setAutoAddress) {
  if (!input) return;
  const service = new window.google.maps.places.AutocompleteService();
  service.getPlacePredictions(
    {
      input,
      location: new window.google.maps.LatLng(center),
      radius: 50000,
      types: ["establishment"],
    },
    (predictions, status) => {
      if (
        status === window.google.maps.places.PlacesServiceStatus.OK &&
        predictions
      ) {
        setAutoAddress(predictions);
      } else {
        setAutoAddress([]);
      }
    }
  );
}

function storeRecentAddresses(key, address) {
  const pastAddress = JSON.parse(localStorage.getItem(key) || "[]");
  // get 10 history addresses
  const updatedAddress = [
    address,
    ...pastAddress.filter((a) => a !== address),
  ].slice(0, 10);
  localStorage.setItem(key, JSON.stringify(updatedAddress));
}

function getRecentAddresses(key) {
  return JSON.parse(localStorage.getItem(key) || "[]");
}

export default function DeliveryPage({ user, setUser, setAuthVisible }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [pickupAddress, setPickupAddress] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [pickupCoordinates, setPickupCoordinates] = useState(null);
  const [destinationCoordinates, setDestinationCoordinates] = useState(null);
  const [mapCenter, setMapCenter] = useState(center);
  const [routeResult, setRouteResult] = useState(null);
  // hold autocomplete address for the pickup input by Google Places Autocomplete API
  const [pickupAutoAddress, setPickupAutoAddress] = useState([]);
  const [destinationAutoAddress, setDestinationAutoAddress] = useState([]);

  const pickupRef = useRef(null);
  // track if user is clicking an address
  const isSelectRef = useRef(false);

  const mapContainerStyle = {
    width: "100%",
    height: "100%",
  };

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GOOGLE_API_KEY,
    libraries: GOOGLE_MAP_LIBRARIES,
  });

  // geocode the selected address, update coordinates and map center, also store the
  // user input address history
  const handleSelect = (address, setCoords, setAddress, key) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === "OK" && results[0]) {
        const location = results[0].geometry.location;
        const coors = { lat: location.lat(), lng: location.lng() };
        setCoords(coors);
        setMapCenter(coors);
        // set the address for the input
        setAddress(results[0].formatted_address);
        storeRecentAddresses(key, results[0].formatted_address);
        // hide addresses after selection
        if (key === "pickup") {
          setPickupAutoAddress([]);
        }
      }
    });
  };

  // show the path when both pickup and destination addresses are set
  useEffect(() => {
    if (!pickupCoordinates || !destinationCoordinates) return;

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: pickupCoordinates,
        destination: destinationCoordinates,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setRouteResult(result);
        } else {
          console.error("Directions request failed due to ", status);
        }
      }
    );
  }, [pickupCoordinates, destinationCoordinates]);

  // close dropdown when clicking outside of the input
  useEffect(() => {
    function handleOutsideClick(event) {
      if (pickupRef.current && !pickupRef.current.contains(event.target)) {
        setPickupAutoAddress([]);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <Layout className="bg-white">
      <AppHeader
        user={user}
        setUser={setUser}
        setAuthVisible={setAuthVisible}
      />
      <Content
        className="mt-[85px] px-6 pb-4"
        style={{ height: "calc(100vh - 85px)", overflow: "hidden" }}
      >
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          {/* title */}
          <h1 className="text-3xl font-bold text-gray-800 mb-2 mt-2">
            Create a Delivery
          </h1>
          {/* progress step indicator */}
          <Steps
            current={currentStep}
            onChange={(value) => setCurrentStep(value)}
            className="mb-5"
          >
            <Step title="Pickup & Destination" />
            <Step title="Item & Preference" />
            <Step title="Recommended Options" />
            <Step title="Confirm" />
          </Steps>

          {!isLoaded ? (
            <p>Loading map...</p>
          ) : (
            currentStep === 0 && (
              // full height of this part
              <div className="flex flex-1 gap-6 overflow-hidden">
                {/* left section */}
                <div className="w-1/3 bg-blue-100 p-5 mb-4 rounded-lg shadow-md overflow-auto">
                  <h2 className="text-xl font-bold text-gray-800 mb-3">
                    Delivery Setup
                  </h2>

                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm space-y-6">
                      <div className="relative" ref={pickupRef}>
                        <label className="block text-base font-semibold text-gray-700 mb-2">
                          Pickup Address
                        </label>

                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-2xl">
                            <EnvironmentOutlined />
                          </span>
                          <input
                            type="text"
                            value={pickupAddress}
                            onFocus={(e) => {
                              const value = e.target.value;
                              if (!value) {
                                const recentAddresses =
                                  getRecentAddresses("pickup");
                                setPickupAutoAddress(
                                  recentAddresses.map((addr) => ({
                                    description: addr,
                                  }))
                                );
                              }
                            }}
                            onChange={(e) => {
                              const value = e.target.value;
                              setPickupAddress(value);
                              if (!value) {
                                const recentAddresses =
                                  getRecentAddresses("pickup");
                                setPickupAutoAddress(
                                  recentAddresses.map((addr) => ({
                                    description: addr,
                                  }))
                                );
                              } else {
                                fetchAutocompleteAddress(
                                  value,
                                  setPickupAutoAddress
                                );
                              }
                            }}
                            onBlur={() => {
                              // defer execution to allow onMouseDown to trigger before clearing input
                              setTimeout(() => {
                                if (!isSelectRef.current) {
                                  setPickupAddress("");
                                  setPickupAutoAddress([]);
                                }
                                isSelectRef.current = false;
                              }, 150);
                            }}
                            className="w-full h-14 border border-gray-300 focus:border-black focus:ring-2 focus:ring-black focus:outline-none rounded-md pl-10 pr-4 font-semibold text-gray-800 text-base"
                            placeholder="Enter pickup location"
                          />
                          {/* the clear icon to clear the input */}
                          {pickupAddress && (
                            <span
                              onClick={() => {
                                setPickupAddress("");
                                setPickupCoordinates(null);
                                setRouteResult(null);
                              }}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-black text-xl"
                            >
                              <CloseCircleFilled />
                            </span>
                          )}

                          {pickupAutoAddress.length > 0 && (
                            <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-md mt-1 max-h-48 overflow-y-auto">
                              {pickupAutoAddress.map((item, idx) => (
                                <div
                                  key={idx}
                                  // set selecting state on mousedown to prevent the case that: the input
                                  // field is cleared too early before the user actually finished selecting address from
                                  // the dropdown list
                                  onMouseDown={() => {
                                    isSelectRef.current = true;
                                  }}
                                  className="px-4 py-2 cursor-pointer hover:bg-gray-100 font-semibold"
                                  onClick={() => {
                                    handleSelect(
                                      item.description,
                                      setPickupCoordinates,
                                      setPickupAddress,
                                      "pickup"
                                    );
                                    setPickupAutoAddress([]);
                                  }}
                                >
                                  <div className="font-semibold text-sm truncate">
                                    {item.description.split(",")[0]}
                                  </div>
                                  <div className="text-gray-500 text-xs truncate">
                                    {item.description
                                      .split(",")
                                      .slice(1)
                                      .join(",")}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-base font-semibold text-gray-700 mb-2">
                          Destination Address
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 text-2xl">
                            <AimOutlined />
                          </span>
                          <input
                            type="text"
                            value={destinationAddress}
                            onFocus={(e) => {
                              const value = e.target.value;
                              if (!value) {
                                const recentAddresses =
                                  getRecentAddresses("destination");
                                setDestinationAutoAddress(
                                  recentAddresses.map((addr) => ({
                                    description: addr,
                                  }))
                                );
                              }
                            }}
                            onChange={(e) => {
                              const value = e.target.value;
                              setDestinationAddress(value);
                              if (!value) {
                                const recentAddresses =
                                  getRecentAddresses("destination");
                                setDestinationAutoAddress(
                                  recentAddresses.map((addr) => ({
                                    description: addr,
                                  }))
                                );
                              } else {
                                fetchAutocompleteAddress(
                                  value,
                                  setDestinationAutoAddress
                                );
                              }
                            }}
                            onBlur={() => {
                              // defer execution to allow onMouseDown to trigger before clearing input
                              setTimeout(() => {
                                if (!isSelectRef.current) {
                                  setDestinationAddress("");
                                  setDestinationAutoAddress([]);
                                }
                                isSelectRef.current = false;
                              }, 150);
                            }}
                            className="w-full h-14 border border-gray-300 focus:border-black focus:ring-2 focus:ring-black focus:outline-none rounded-md pl-10 pr-4 font-semibold text-gray-800 text-base"
                            placeholder="Enter destination location"
                          />
                          {/* the clear icon to clear the input */}
                          {destinationAddress && (
                            <span
                              onClick={() => {
                                setDestinationAddress("");
                                setDestinationCoordinates(null);
                                setRouteResult(null);
                              }}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-black text-xl"
                            >
                              <CloseCircleFilled />
                            </span>
                          )}

                          {destinationAutoAddress.length > 0 && (
                            <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-md mt-1 max-h-48 overflow-y-auto">
                              {destinationAutoAddress.map((item, idx) => (
                                <div
                                  key={idx}
                                  // set selecting state on mousedown to prevent the case that: the input
                                  // field is cleared too early before the user actually finished selecting address from
                                  // the dropdown list
                                  onMouseDown={() => {
                                    isSelectRef.current = true;
                                  }}
                                  className="px-4 py-2 cursor-pointer hover:bg-gray-100 font-semibold"
                                  onClick={() => {
                                    handleSelect(
                                      item.description,
                                      setDestinationCoordinates,
                                      setDestinationAddress,
                                      "destination"
                                    );
                                    setDestinationAutoAddress([]);
                                  }}
                                >
                                  <div className="font-semibold text-sm truncate">
                                    {item.description.split(",")[0]}
                                  </div>
                                  <div className="text-gray-500 text-xs truncate">
                                    {item.description
                                      .split(",")
                                      .slice(1)
                                      .join(",")}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* next button to the next step */}
                  <button
                    disabled={!pickupCoordinates || !destinationCoordinates}
                    className="w-full mt-10 bg-black text-white text-xl font-semibold py-3 rounded-xl hover:bg-gray-900 transition-colors disabled:bg-gray-300 disabled:text-gray-500"
                    onClick={() => setCurrentStep((prev) => prev + 1)}
                  >
                    Next
                  </button>
                </div>

                {/* right section: map */}
                <div className="w-2/3 flex flex-col">
                  <div className="flex-grow mb-4 border rounded-lg shadow-sm overflow-hidden">
                    <GoogleMap
                      mapContainerStyle={mapContainerStyle}
                      center={mapCenter}
                      zoom={13}
                    >
                      {pickupCoordinates && (
                        <Marker position={pickupCoordinates} label="P" />
                      )}
                      {destinationCoordinates && (
                        <Marker position={destinationCoordinates} label="D" />
                      )}
                      {pickupCoordinates &&
                        destinationCoordinates &&
                        routeResult && (
                          <DirectionsRenderer
                            directions={routeResult}
                            options={{
                              suppressMarkers: true,
                              polylineOptions: {
                                strokeColor: "fff",
                              },
                            }}
                          />
                        )}
                    </GoogleMap>
                  </div>
                </div>
              </div>
            )
          )}

          {/* TODO: step 1, step 2, step 3 */}
        </div>
      </Content>
    </Layout>
  );
}

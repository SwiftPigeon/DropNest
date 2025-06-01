import {
  GoogleMap,
  Marker,
  useLoadScript,
  DirectionsRenderer,
} from "@react-google-maps/api";
import React, { useEffect, useRef, useState } from "react";
import AppHeader from "../components/Layout/Header"; // Assuming AppHeader is correctly imported
import {
  Layout,
  Steps,
  Typography,
  message,
  Input,
  Radio,
  Checkbox,
  Form,
  InputNumber,
  Button,
  Card,
  Col,
  Row,
  Space,
  Spin,
  Alert,
} from "antd";
import {
  AimOutlined,
  CloseCircleFilled,
  EnvironmentOutlined,
  LoadingOutlined,
  UserOutlined, // For Avatar placeholder
  InboxOutlined, // For package icon
  ClockCircleOutlined, // For speed icon
  DollarCircleOutlined, // For price icon
} from "@ant-design/icons";

const { Content } = Layout;
const { Step } = Steps;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// Ensure your Google API Key is in a .env file
const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "";

const GOOGLE_MAP_LIBRARIES = ["places"];

// Default center for SF
const SF_CENTER = {
  lat: 37.7749,
  lng: -122.4194,
};

// Mock API data (replace with actual API calls)
const mockDeliveryTypes = [
  {
    type: "ROBOT",
    name: "Ground Robot",
    maxWeight: 30,
    basePrice: 8.0,
    pricePerKm: 2.0,
    features: ["Heavy loads up to 30kg", "Ground level delivery"],
  },
  {
    type: "DRONE",
    name: "Aerial Drone",
    maxWeight: 5,
    basePrice: 12.0,
    pricePerKm: 3.0,
    features: ["Fast aerial delivery", "Light packages only"],
  },
];

const mockSpeedOptions = [
  {
    type: "BASIC",
    name: "Basic",
    description: "~2 hours",
    priceMultiplier: 1.0,
  },
  {
    type: "STANDARD",
    name: "Standard",
    description: "~1 hour",
    priceMultiplier: 1.2,
  },
  {
    type: "EXPRESS",
    name: "Express",
    description: "~30 mins",
    priceMultiplier: 1.5,
  },
];

// Helper function to fetch autocomplete predictions
async function fetchAutocompleteAddress(input, setSuggestions, mapCenter) {
  if (
    !input ||
    !window.google ||
    !window.google.maps ||
    !window.google.maps.places
  ) {
    setSuggestions([]);
    return;
  }
  const service = new window.google.maps.places.AutocompleteService();
  service.getPlacePredictions(
    {
      input,
      location: new window.google.maps.LatLng(mapCenter),
      radius: 50000,
      componentRestrictions: { country: "us" },
    },
    (predictions, status) => {
      if (
        status === window.google.maps.places.PlacesServiceStatus.OK &&
        predictions
      ) {
        setSuggestions(predictions);
      } else {
        setSuggestions([]);
        if (
          status !==
            window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS &&
          status !==
            window.google.maps.places.PlacesServiceStatus.REQUEST_DENIED
        ) {
          console.error("Autocomplete service failed with status:", status);
        }
        if (
          status ===
          window.google.maps.places.PlacesServiceStatus.REQUEST_DENIED
        ) {
          console.warn(
            "Google Maps API key might be missing, invalid, or billing not enabled."
          );
        }
      }
    }
  );
}

// Helper function to store recent addresses
function storeRecentAddresses(key, address) {
  try {
    const pastAddresses = JSON.parse(localStorage.getItem(key) || "[]");
    const updatedAddresses = [
      address,
      ...pastAddresses.filter((a) => a.description !== address.description),
    ].slice(0, 5);
    localStorage.setItem(key, JSON.stringify(updatedAddresses));
  } catch (error) {
    console.error("Failed to store recent addresses:", error);
  }
}

// Helper function to get recent addresses
function getRecentAddresses(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch (error) {
    console.error("Failed to get recent addresses:", error);
    return [];
  }
}

export default function DeliveryPage({ user, setUser, setAuthVisible }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm(); // Form instance for Step 1

  // Step 0: Addresses
  const [pickupAddress, setPickupAddress] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [pickupCoordinates, setPickupCoordinates] = useState(null);
  const [destinationCoordinates, setDestinationCoordinates] = useState(null);
  const [mapCenter, setMapCenter] = useState(SF_CENTER);
  const [routeResult, setRouteResult] = useState(null);
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const pickupInputRef = useRef(null);
  const destinationInputRef = useRef(null);
  const isSelectingAddressRef = useRef(false);

  // Step 1: Package & Preferences
  const [deliveryTypes, setDeliveryTypes] = useState([]);
  const [speedOptions, setSpeedOptions] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [quote, setQuote] = useState(null); // To store result from /calculate API

  // Step 3: Confirm & Pay
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null); // To store result from /orders API

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_API_KEY,
    libraries: GOOGLE_MAP_LIBRARIES,
  });

  // Fetch config data (delivery types, speed options)
  useEffect(() => {
    // TODO: Replace with actual API calls
    setDeliveryTypes(mockDeliveryTypes);
    setSpeedOptions(mockSpeedOptions);
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          setMapCenter(SF_CENTER); // Fallback to SF
        }
      );
    } else {
      setMapCenter(SF_CENTER); // Geolocation not supported
    }
  }, []);

  const handleAddressSelect = (
    addressPrediction,
    setCoordinates,
    setAddressString,
    suggestionKey,
    clearSuggestionsFunc
  ) => {
    if (!window.google || !window.google.maps || !window.google.maps.Geocoder) {
      message.error("Google Maps Geocoder not available.");
      return;
    }
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode(
      { placeId: addressPrediction.place_id },
      (results, status) => {
        if (status === "OK" && results && results[0]) {
          const location = results[0].geometry.location;
          const coords = { lat: location.lat(), lng: location.lng() };
          setCoordinates(coords);
          setMapCenter(coords);
          setAddressString(results[0].formatted_address);
          storeRecentAddresses(suggestionKey, {
            description: results[0].formatted_address,
            place_id: addressPrediction.place_id,
          });
          clearSuggestionsFunc([]);
          isSelectingAddressRef.current = false;
        } else {
          console.error("Geocode failed: " + status);
          message.error(
            "Could not get location details for the selected address."
          );
        }
      }
    );
  };

  useEffect(() => {
    if (!pickupCoordinates || !destinationCoordinates || !isLoaded) {
      setRouteResult(null);
      return;
    }
    if (
      !window.google ||
      !window.google.maps ||
      !window.google.maps.DirectionsService
    ) {
      console.error("Google Maps DirectionsService not available.");
      return;
    }

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
          message.error(
            "Could not calculate the route. Please check addresses."
          );
          setRouteResult(null);
        }
      }
    );
  }, [pickupCoordinates, destinationCoordinates, isLoaded]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        pickupInputRef.current &&
        !pickupInputRef.current.contains(event.target)
      ) {
        setPickupSuggestions([]);
      }
      if (
        destinationInputRef.current &&
        !destinationInputRef.current.contains(event.target)
      ) {
        setDestinationSuggestions([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const commonInputProps = (
    value,
    placeholder,
    _suggestions,
    setSuggestionsFunc,
    setAddressStringFunc,
    setCoordinatesFunc,
    suggestionKey
  ) => ({
    type: "text",
    value: value,
    className:
      "w-full h-12 sm:h-14 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none rounded-md pl-10 pr-10 text-sm sm:text-base font-medium text-gray-800",
    placeholder: placeholder,
    onFocus: (e) => {
      if (!e.target.value) {
        const recent = getRecentAddresses(suggestionKey);
        setSuggestionsFunc(recent.length > 0 ? recent : []);
      }
    },
    onChange: (e) => {
      const inputValue = e.target.value;
      setAddressStringFunc(inputValue);
      if (inputValue) {
        fetchAutocompleteAddress(inputValue, setSuggestionsFunc, mapCenter);
      } else {
        setSuggestionsFunc(getRecentAddresses(suggestionKey));
        if (setCoordinatesFunc) setCoordinatesFunc(null);
      }
    },
    onBlur: () => {
      setTimeout(() => {
        if (!isSelectingAddressRef.current) {
          setSuggestionsFunc([]);
        }
      }, 150);
    },
  });

  const renderSuggestions = (
    suggestions,
    setCoordinates,
    setAddressString,
    suggestionKey,
    clearSuggestionsFunc
  ) => {
    if (suggestions.length === 0) return null;
    return (
      <div className="absolute z-20 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
        {suggestions.map((item, idx) => (
          <div
            key={item.place_id || idx}
            onMouseDown={() => {
              isSelectingAddressRef.current = true;
            }}
            onClick={() => {
              handleAddressSelect(
                item,
                setCoordinates,
                setAddressString,
                suggestionKey,
                clearSuggestionsFunc
              );
            }}
            className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <div className="font-semibold text-sm text-gray-800 truncate">
              {item.structured_formatting
                ? item.structured_formatting.main_text
                : item.description.split(",")[0]}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {item.structured_formatting
                ? item.structured_formatting.secondary_text
                : item.description.split(",").slice(1).join(",")}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const handleCalculateQuote = async (values) => {
    setIsCalculating(true);
    setQuote(null); // Clear previous quote
    console.log("Calculating quote with values:", values);
    // TODO: Replace with actual API call to /api/orders/calculate
    // const payload = {
    //   pickupAddress: { address: pickupAddress, latitude: pickupCoordinates.lat, longitude: pickupCoordinates.lng },
    //   deliveryAddress: { address: destinationAddress, latitude: destinationCoordinates.lat, longitude: destinationCoordinates.lng },
    //   items: [{ name: values.itemName, quantity: values.quantity, weight: values.weight, volume: values.volume }],
    //   deliveryType: values.deliveryType,
    //   speed: values.speed,
    // };
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API delay
    const mockQuoteResponse = {
      basePrice: values.deliveryType === "DRONE" ? 12.0 : 8.0,
      distancePrice: 6.0, // Mocked
      weightPrice:
        values.weight > (values.deliveryType === "DRONE" ? 5 : 30) ? 5.0 : 0.0, // Simplified weight pricing
      speedMultiplier:
        mockSpeedOptions.find((s) => s.type === values.speed)
          ?.priceMultiplier || 1.0,
      totalPrice:
        ((values.deliveryType === "DRONE" ? 12.0 : 8.0) +
          6.0 +
          (values.weight > (values.deliveryType === "DRONE" ? 5 : 30)
            ? 5.0
            : 0.0)) *
        (mockSpeedOptions.find((s) => s.type === values.speed)
          ?.priceMultiplier || 1.0),
      estimatedTime: "45 minutes", // Mocked
      distance: 2.0, // Mocked
      assignedStation: {
        stationId: "station-1",
        name: "SkyHub Central",
        estimatedPickupTime: "15 minutes",
      },
      priceBreakdown: {
        base: `$${(values.deliveryType === "DRONE" ? 12.0 : 8.0).toFixed(2)} (${
          values.deliveryType
        } base price)`,
        distance: "$6.00 (2km × $3/km)", // Mocked
        weight: `$${(values.weight > (values.deliveryType === "DRONE" ? 5 : 30)
          ? 5.0
          : 0.0
        ).toFixed(2)}`,
        speed: `×${(
          mockSpeedOptions.find((s) => s.type === values.speed)
            ?.priceMultiplier || 1.0
        ).toFixed(1)} (${values.speed} delivery)`,
        total: `$${(
          ((values.deliveryType === "DRONE" ? 12.0 : 8.0) +
            6.0 +
            (values.weight > (values.deliveryType === "DRONE" ? 5 : 30)
              ? 5.0
              : 0.0)) *
          (mockSpeedOptions.find((s) => s.type === values.speed)
            ?.priceMultiplier || 1.0)
        ).toFixed(2)}`,
      },
      // Include form values for display in next step
      packageDetails: values,
    };
    setQuote(mockQuoteResponse);
    setIsCalculating(false);
    setCurrentStep(2); // Move to Review Quote step
    message.success("Quote calculated successfully!");
  };

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    // TODO: Replace with actual API call to /api/orders
    // const orderPayload = {
    //   pickupAddress: { address: pickupAddress, latitude: pickupCoordinates.lat, longitude: pickupCoordinates.lng, contactName: "Sender Name", contactPhone: "123-456-7890" }, // Add contact details
    //   deliveryAddress: { address: destinationAddress, latitude: destinationCoordinates.lat, longitude: destinationCoordinates.lng, contactName: "Receiver Name", contactPhone: "098-765-4321" }, // Add contact details or use addressId
    //   items: [{ name: quote.packageDetails.itemName, quantity: quote.packageDetails.quantity, weight: quote.packageDetails.weight, volume: quote.packageDetails.volume }],
    //   deliveryType: quote.packageDetails.deliveryType,
    //   speed: quote.packageDetails.speed,
    //   requireSignature: quote.packageDetails.requireSignature,
    //   notes: quote.packageDetails.notes,
    // };
    console.log("Placing order with payload:", quote);
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API delay

    const mockOrderResponse = {
      orderId: `ORD-${Date.now()}`,
      status: "PENDING_PAYMENT", // Or directly to PAID if payment is integrated/mocked as successful
      paymentAmount: quote.totalPrice,
      paymentDeadline: new Date(Date.now() + 15 * 60000).toISOString(), // 15 mins from now
      trackingNumber: `TRK-${Math.random()
        .toString(36)
        .substr(2, 9)
        .toUpperCase()}`,
      assignedStation: quote.assignedStation,
    };
    setOrderDetails(mockOrderResponse);
    setIsPlacingOrder(false);

    // Simulate payment success for now
    message.success(
      `Order ${
        mockOrderResponse.orderId
      } placed! Payment of $${mockOrderResponse.paymentAmount.toFixed(
        2
      )} successful. Tracking: ${mockOrderResponse.trackingNumber}`
    );
    // setCurrentStep(4); // Potentially a final "Order Confirmed" step or redirect
    // For now, just show message and maybe reset form or redirect.
  };

  const appMenuItems = [
    {
      key: "create",
      label: "Create Delivery",
      onClick: () => {
        if (currentStep !== 0) setCurrentStep(0);
      },
    }, // Simplified navigation for now
    {
      key: "tracking",
      label: "Tracking",
      onClick: () => message.info("Tracking page not implemented yet."),
    },
    {
      key: "history",
      label: "History",
      onClick: () => message.info("History page not implemented yet."),
    },
    {
      key: "address",
      label: "Addresses",
      onClick: () => message.info("Address book not implemented yet."),
    },
  ];

  if (loadError) {
    return (
      <Layout className="min-h-screen bg-gray-100">
        <AppHeader
          user={user}
          setUser={setUser}
          setAuthVisible={setAuthVisible}
          navBg="bg-blue-600"
          menuTheme="dark"
          menuItems={appMenuItems}
          showUserAvatar={true}
        />
        <Content className="mt-[64px] sm:mt-[85px] px-4 sm:px-6 py-8 flex justify-center items-center">
          <div className="text-center">
            <Title level={3} className="!text-red-500">
              Map Error
            </Title>
            <Text className="!text-gray-600">
              Could not load Google Maps. Please check your internet connection
              and API key configuration.
            </Text>
            {GOOGLE_API_KEY === "" && (
              <Text strong className="!text-red-600 block mt-2">
                Google Maps API Key is missing.
              </Text>
            )}
          </div>
        </Content>
      </Layout>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Addresses
        return (
          <div
            className="flex flex-col lg:flex-row flex-1 gap-4 sm:gap-6"
            style={{ minHeight: "calc(100vh - 280px)" }}
          >
            <div className="w-full lg:w-1/3 bg-white p-4 sm:p-6 rounded-lg shadow-lg flex flex-col space-y-4 sm:space-y-6 overflow-y-auto">
              <Title
                level={3}
                className="!text-lg sm:!text-xl !font-semibold !text-gray-700 mb-0"
              >
                Set Addresses
              </Title>
              <div className="relative" ref={pickupInputRef}>
                <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-1 sm:mb-2">
                  Pickup Address
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl sm:text-2xl">
                    <EnvironmentOutlined />
                  </span>
                  <input
                    {...commonInputProps(
                      pickupAddress,
                      "Enter pickup location",
                      pickupSuggestions,
                      setPickupSuggestions,
                      setPickupAddress,
                      setPickupCoordinates,
                      "pickup"
                    )}
                  />
                  {pickupAddress && (
                    <span
                      onClick={() => {
                        setPickupAddress("");
                        setPickupCoordinates(null);
                        setRouteResult(null);
                        setPickupSuggestions(getRecentAddresses("pickup"));
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 text-lg sm:text-xl"
                    >
                      <CloseCircleFilled />
                    </span>
                  )}
                </div>
                {renderSuggestions(
                  pickupSuggestions,
                  setPickupCoordinates,
                  setPickupAddress,
                  "pickup",
                  setPickupSuggestions
                )}
              </div>
              <div className="relative" ref={destinationInputRef}>
                <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-1 sm:mb-2">
                  Destination Address
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl sm:text-2xl">
                    <AimOutlined />
                  </span>
                  <input
                    {...commonInputProps(
                      destinationAddress,
                      "Enter destination location",
                      destinationSuggestions,
                      setDestinationSuggestions,
                      setDestinationAddress,
                      setDestinationCoordinates,
                      "destination"
                    )}
                  />
                  {destinationAddress && (
                    <span
                      onClick={() => {
                        setDestinationAddress("");
                        setDestinationCoordinates(null);
                        setRouteResult(null);
                        setDestinationSuggestions(
                          getRecentAddresses("destination")
                        );
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 text-lg sm:text-xl"
                    >
                      <CloseCircleFilled />
                    </span>
                  )}
                </div>
                {renderSuggestions(
                  destinationSuggestions,
                  setDestinationCoordinates,
                  setDestinationAddress,
                  "destination",
                  setDestinationSuggestions
                )}
              </div>
              <div className="mt-auto pt-4">
                <Button
                  type="primary"
                  size="large"
                  block
                  disabled={!pickupCoordinates || !destinationCoordinates}
                  onClick={() => setCurrentStep(1)}
                  className="bg-blue-500 hover:bg-blue-700 border-blue-500 hover:border-blue-700"
                >
                  Next: Package Details
                </Button>
              </div>
            </div>
            <div className="w-full lg:w-2/3 flex flex-col min-h-[300px] sm:min-h-[400px] lg:min-h-0">
              <div className="flex-grow border bg-gray-200 rounded-lg shadow-lg overflow-hidden">
                <GoogleMap
                  mapContainerStyle={{ width: "100%", height: "100%" }}
                  center={mapCenter}
                  zoom={12}
                  options={{
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: false,
                  }}
                >
                  {pickupCoordinates && (
                    <Marker
                      position={pickupCoordinates}
                      label={{ text: "P", color: "white", fontWeight: "bold" }}
                      icon={{
                        url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
                      }}
                    />
                  )}
                  {destinationCoordinates && (
                    <Marker
                      position={destinationCoordinates}
                      label={{ text: "D", color: "white", fontWeight: "bold" }}
                      icon={{
                        url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                      }}
                    />
                  )}
                  {routeResult && (
                    <DirectionsRenderer
                      directions={routeResult}
                      options={{
                        suppressMarkers: true,
                        polylineOptions: {
                          strokeColor: "#1890ff",
                          strokeWeight: 5,
                          strokeOpacity: 0.8,
                        },
                      }}
                    />
                  )}
                </GoogleMap>
              </div>
            </div>
          </div>
        );
      case 1: // Package & Preferences
        return (
          <Card
            title="Package & Delivery Preferences"
            bordered={false}
            className="shadow-lg"
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleCalculateQuote}
              initialValues={{
                quantity: 1,
                deliveryType: "DRONE",
                speed: "STANDARD",
                requireSignature: false,
              }}
            >
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="itemName"
                    label="Item Name"
                    rules={[
                      { required: true, message: "Please enter item name" },
                    ]}
                  >
                    <Input placeholder="e.g., Documents, Small Box" />
                  </Form.Item>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Item
                    name="quantity"
                    label="Quantity"
                    rules={[
                      { required: true, message: "Please enter quantity" },
                    ]}
                  >
                    <InputNumber min={1} className="w-full" />
                  </Form.Item>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Item
                    name="weight"
                    label="Total Weight (kg)"
                    rules={[{ required: true, message: "Please enter weight" }]}
                  >
                    <InputNumber
                      min={0.1}
                      step={0.1}
                      addonAfter="kg"
                      className="w-full"
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="volume"
                    label="Total Volume (liters)"
                    rules={[{ required: true, message: "Please enter volume" }]}
                  >
                    <InputNumber
                      min={0.1}
                      step={0.1}
                      addonAfter="L"
                      className="w-full"
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item
                name="deliveryType"
                label="Delivery Type"
                rules={[
                  { required: true, message: "Please select delivery type" },
                ]}
              >
                <Radio.Group>
                  {deliveryTypes.map((dt) => (
                    <Radio key={dt.type} value={dt.type}>
                      {dt.name} ({dt.features.join(", ")})
                    </Radio>
                  ))}
                </Radio.Group>
              </Form.Item>
              <Form.Item
                name="speed"
                label="Delivery Speed"
                rules={[{ required: true, message: "Please select speed" }]}
              >
                <Radio.Group>
                  {speedOptions.map((so) => (
                    <Radio key={so.type} value={so.type}>
                      {so.name} ({so.description})
                    </Radio>
                  ))}
                </Radio.Group>
              </Form.Item>
              <Form.Item name="requireSignature" valuePropName="checked">
                <Checkbox>Require Signature on Delivery</Checkbox>
              </Form.Item>
              <Form.Item name="notes" label="Delivery Notes (Optional)">
                <TextArea
                  rows={3}
                  placeholder="e.g., Leave at front door, Fragile item"
                />
              </Form.Item>
              <Form.Item>
                <Space direction="horizontal" className="w-full justify-end">
                  <Button size="large" onClick={() => setCurrentStep(0)}>
                    Back to Addresses
                  </Button>
                  <Button
                    type="primary"
                    size="large"
                    htmlType="submit"
                    loading={isCalculating}
                    className="bg-blue-500 hover:bg-blue-700 border-blue-500 hover:border-blue-700"
                  >
                    Calculate Quote
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        );
      case 2: // Review Quote
        if (!quote)
          return (
            <div className="text-center p-10">
              <Spin size="large" />
              <Paragraph className="mt-4">Loading quote...</Paragraph>
            </div>
          );
        return (
          <Card
            title="Review Your Quote"
            bordered={false}
            className="shadow-lg"
          >
            <Title level={4}>Addresses</Title>
            <Paragraph>
              <strong>Pickup:</strong> {pickupAddress}
            </Paragraph>
            <Paragraph>
              <strong>Destination:</strong> {destinationAddress}
            </Paragraph>
            <hr className="my-4" />
            <Title level={4}>Package & Preferences</Title>
            <Paragraph>
              <strong>Item:</strong> {quote.packageDetails.itemName} (Qty:{" "}
              {quote.packageDetails.quantity})
            </Paragraph>
            <Paragraph>
              <strong>Weight:</strong> {quote.packageDetails.weight} kg,{" "}
              <strong>Volume:</strong> {quote.packageDetails.volume} L
            </Paragraph>
            <Paragraph>
              <strong>Delivery Type:</strong>{" "}
              {
                deliveryTypes.find(
                  (dt) => dt.type === quote.packageDetails.deliveryType
                )?.name
              }
            </Paragraph>
            <Paragraph>
              <strong>Speed:</strong>{" "}
              {
                speedOptions.find(
                  (st) => st.type === quote.packageDetails.speed
                )?.name
              }
            </Paragraph>
            {quote.packageDetails.notes && (
              <Paragraph>
                <strong>Notes:</strong> {quote.packageDetails.notes}
              </Paragraph>
            )}
            {quote.packageDetails.requireSignature && (
              <Paragraph>
                <strong>Signature Required</strong>
              </Paragraph>
            )}
            <hr className="my-4" />
            <Title level={4}>Quote Details</Title>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Paragraph>
                  <DollarCircleOutlined className="mr-2 text-blue-500" />
                  <strong>Total Price:</strong>{" "}
                  <Text strong className="text-xl">
                    ${quote.totalPrice.toFixed(2)}
                  </Text>
                </Paragraph>
                <Paragraph>
                  <ClockCircleOutlined className="mr-2 text-blue-500" />
                  <strong>Estimated Delivery:</strong> {quote.estimatedTime}
                </Paragraph>
                {quote.assignedStation && (
                  <Paragraph>
                    <InboxOutlined className="mr-2 text-blue-500" />
                    <strong>Dispatch Station:</strong>{" "}
                    {quote.assignedStation.name}
                  </Paragraph>
                )}
              </Col>
              <Col xs={24} sm={12}>
                <Title level={5}>Price Breakdown:</Title>
                <Paragraph className="text-sm">
                  Base: {quote.priceBreakdown.base}
                </Paragraph>
                <Paragraph className="text-sm">
                  Distance: {quote.priceBreakdown.distance}
                </Paragraph>
                <Paragraph className="text-sm">
                  Weight Adjustment: {quote.priceBreakdown.weight}
                </Paragraph>
                <Paragraph className="text-sm">
                  Speed Surcharge: {quote.priceBreakdown.speed}
                </Paragraph>
              </Col>
            </Row>
            <Form.Item className="mt-6">
              <Space direction="horizontal" className="w-full justify-end">
                <Button size="large" onClick={() => setCurrentStep(1)}>
                  Back to Package Details
                </Button>
                <Button
                  type="primary"
                  size="large"
                  onClick={() => setCurrentStep(3)}
                  className="bg-blue-500 hover:bg-blue-700 border-blue-500 hover:border-blue-700"
                >
                  Next: Confirm & Pay
                </Button>
              </Space>
            </Form.Item>
          </Card>
        );
      case 3: // Confirm & Pay
        if (!quote)
          return (
            <Alert
              message="Error"
              description="No quote details available. Please go back and calculate a quote."
              type="error"
              showIcon
            />
          );
        return (
          <Card title="Confirm & Pay" bordered={false} className="shadow-lg">
            <Title level={4}>Order Summary</Title>
            <Paragraph>
              <strong>Pickup:</strong> {pickupAddress}
            </Paragraph>
            <Paragraph>
              <strong>Destination:</strong> {destinationAddress}
            </Paragraph>
            <Paragraph>
              <strong>Item:</strong> {quote.packageDetails.itemName} (Qty:{" "}
              {quote.packageDetails.quantity}, {quote.packageDetails.weight}kg,{" "}
              {quote.packageDetails.volume}L)
            </Paragraph>
            <Paragraph>
              <strong>Service:</strong>{" "}
              {
                deliveryTypes.find(
                  (dt) => dt.type === quote.packageDetails.deliveryType
                )?.name
              }{" "}
              -{" "}
              {
                speedOptions.find(
                  (st) => st.type === quote.packageDetails.speed
                )?.name
              }
            </Paragraph>
            <Title level={3} className="mt-4">
              Total: ${quote.totalPrice.toFixed(2)}
            </Title>

            {/* Placeholder for payment method selection */}
            <div className="my-6">
              <Text strong>Payment Method:</Text>
              <Radio.Group defaultValue="CREDIT_CARD" className="ml-4">
                <Radio value="CREDIT_CARD">Credit Card</Radio>
                <Radio value="PAYPAL">PayPal</Radio>
                <Radio value="APPLE_PAY" disabled>
                  Apple Pay
                </Radio>
              </Radio.Group>
              <Paragraph className="text-xs text-gray-500 mt-1">
                For simulation, all payments are auto-approved.
              </Paragraph>
            </div>

            {orderDetails && (
              <Alert
                message={`Order ${orderDetails.orderId} Placed Successfully!`}
                description={
                  <>
                    <Paragraph>Status: {orderDetails.status}</Paragraph>
                    <Paragraph>
                      Tracking Number: {orderDetails.trackingNumber}
                    </Paragraph>
                    <Paragraph>
                      Amount: ${orderDetails.paymentAmount.toFixed(2)}
                    </Paragraph>
                  </>
                }
                type="success"
                showIcon
                className="mb-4"
              />
            )}

            <Form.Item className="mt-6">
              <Space direction="horizontal" className="w-full justify-end">
                <Button
                  size="large"
                  onClick={() => setCurrentStep(2)}
                  disabled={isPlacingOrder || !!orderDetails}
                >
                  Back to Review Quote
                </Button>
                <Button
                  type="primary"
                  size="large"
                  onClick={handlePlaceOrder}
                  loading={isPlacingOrder}
                  disabled={!!orderDetails}
                  className="bg-green-500 hover:bg-green-700 border-green-500 hover:border-green-700"
                >
                  {orderDetails ? "Order Placed" : "Place Order & Pay"}
                </Button>
              </Space>
            </Form.Item>
          </Card>
        );
      default:
        return <Paragraph>Something went wrong. Unknown step.</Paragraph>;
    }
  };

  return (
    <Layout className="min-h-screen bg-gray-100">
      <AppHeader
        user={user}
        setUser={setUser}
        setAuthVisible={setAuthVisible}
        navBg="bg-blue-600"
        menuTheme="dark"
        menuItems={appMenuItems} // Pass the new menu items
        showUserAvatar={true} // Prop to tell header to show avatar
      />
      <Content
        className="mt-[64px] sm:mt-[85px] px-4 sm:px-6 pb-8 pt-8" // Added pt-8 for spacing below header
        style={{ overflowY: "auto" }} // Removed fixed height, allow content to scroll
      >
        <div className="max-w-5xl mx-auto flex flex-col">
          {" "}
          {/* Changed max-w for better form layout */}
          <Title
            level={2}
            className="!text-2xl sm:!text-3xl !font-bold !text-gray-800 mb-4 sm:mb-6"
          >
            Create New Delivery
          </Title>
          <Steps
            current={currentStep}
            // onChange={(value) => setCurrentStep(value)} // Controlled by buttons now
            className="mb-6 sm:mb-8"
            size="small"
          >
            <Step title="Addresses" description="Set pickup & destination" />
            <Step title="Package" description="Item details & preferences" />
            <Step title="Quote" description="Review delivery quote" />
            <Step title="Confirm" description="Confirm & pay" />
          </Steps>
          {!isLoaded ? (
            <div className="flex-grow flex flex-col items-center justify-center p-10 text-center">
              <LoadingOutlined
                style={{ fontSize: 48, color: "#1890ff" }}
                spin
              />
              <Text className="mt-4 text-lg text-gray-600">
                Loading Map & Services...
              </Text>
              {GOOGLE_API_KEY === "" && (
                <Text strong className="!text-red-600 block mt-2">
                  Warning: Google Maps API Key is not set. Map functionality
                  will be limited.
                </Text>
              )}
            </div>
          ) : (
            renderStepContent()
          )}
        </div>
      </Content>
    </Layout>
  );
}

import {
  GoogleMap,
  Marker,
  useLoadScript,
  DirectionsRenderer,
} from "@react-google-maps/api";
import React, { useEffect, useState, useCallback } from "react";
import AppHeader from "../components/Layout/Header";
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
  Space, // Unused, but could be useful later. Keeping for now.
  Spin,
  Alert,
  Select,
  Empty,
} from "antd";
import {
  // EnvironmentOutlined, // Not used
  // LoadingOutlined, // Not used
  // InboxOutlined, // Not used
  ClockCircleOutlined,
  DollarCircleOutlined,
  HomeOutlined,
  BankOutlined,
  PushpinOutlined,
} from "@ant-design/icons";
import {
  getAddresses,
  getDeliveryTypes,
  getSpeedOptions,
  calculateOrderPrice,
  createOrder,
  payOrder,
} from "../services/api";
import { useAuth } from "../context/AuthContext";

const { Content } = Layout;
const { Step } = Steps;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "";
const GOOGLE_MAP_LIBRARIES = ["places"]; // "directions" is not strictly needed here if API key has Directions API enabled

const SF_CENTER = {
  lat: 37.7749,
  lng: -122.4194,
};

export default function DeliveryPage({ user, setUser, setAuthVisible }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const { currentUser } = useAuth();

  // Data states
  const [addresses, setAddresses] = useState([]);
  const [deliveryTypes, setDeliveryTypes] = useState([]);
  const [speedOptions, setSpeedOptions] = useState([]);
  const [loading, setLoading] = useState(true); // Used for all initial data loading

  // Selection states
  const [selectedPickupAddress, setSelectedPickupAddress] = useState(null);
  const [selectedDeliveryAddress, setSelectedDeliveryAddress] = useState(null);

  // Map states
  const [mapCenter, setMapCenter] = useState(SF_CENTER);
  const [routeResult, setRouteResult] = useState(null);

  // Order states
  const [quote, setQuote] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [processing, setProcessing] = useState(false);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_API_KEY,
    libraries: GOOGLE_MAP_LIBRARIES,
  });

  // Fetch all initial data
  const fetchInitialData = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const [addressesData, deliveryTypesData, speedOptionsData] =
        await Promise.all([
          getAddresses(),
          getDeliveryTypes(),
          getSpeedOptions(),
        ]);
      setAddresses(addressesData.addresses || []);
      setDeliveryTypes(deliveryTypesData.deliveryTypes || []);
      setSpeedOptions(speedOptionsData.speedOptions || []);
    } catch (error) {
      message.error(
        "Failed to load data: " + (error.message || "Please try again.")
      );
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Calculate route when both addresses are selected
  useEffect(() => {
    if (!selectedPickupAddress || !selectedDeliveryAddress || !isLoaded) {
      setRouteResult(null);
      return;
    }

    if (!window.google?.maps?.DirectionsService) {
      console.error("Google Maps DirectionsService not available.");
      // It might be good to show a message to the user here as well
      message.error(
        "Map routing service is not available. Please try refreshing."
      );
      return;
    }

    const pickupCoords = {
      lat: parseFloat(selectedPickupAddress.latitude),
      lng: parseFloat(selectedPickupAddress.longitude),
    };
    const deliveryCoords = {
      lat: parseFloat(selectedDeliveryAddress.latitude),
      lng: parseFloat(selectedDeliveryAddress.longitude),
    };

    // Validate coordinates
    if (
      isNaN(pickupCoords.lat) ||
      isNaN(pickupCoords.lng) ||
      isNaN(deliveryCoords.lat) ||
      isNaN(deliveryCoords.lng)
    ) {
      console.error("Invalid coordinates in selected addresses");
      message.error("Invalid address coordinates for routing.");
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: pickupCoords,
        destination: deliveryCoords,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setRouteResult(result);

          // Center map to show both points
          const bounds = new window.google.maps.LatLngBounds();
          bounds.extend(pickupCoords);
          bounds.extend(deliveryCoords);
          const center = bounds.getCenter();
          setMapCenter({ lat: center.lat(), lng: center.lng() });
        } else {
          console.error("Directions request failed:", status);
          message.error("Could not calculate route between addresses.");
        }
      }
    );
  }, [selectedPickupAddress, selectedDeliveryAddress, isLoaded]);

  const handleAddressSelect = (addressId, type) => {
    const address = addresses.find((addr) => addr.addressId === addressId);
    if (!address) return;

    if (type === "pickup") {
      setSelectedPickupAddress(address);
    } else {
      setSelectedDeliveryAddress(address);
    }

    // Update map center when address is selected
    if (address.latitude && address.longitude) {
      const lat = parseFloat(address.latitude);
      const lng = parseFloat(address.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        setMapCenter({ lat, lng });
      }
    }
  };

  const handleCalculateQuote = async (values) => {
    console.log("[DEBUG] handleCalculateQuote triggered. Form values:", values); // Log 1
    console.log("[DEBUG] selectedPickupAddress:", selectedPickupAddress); // Log 2
    console.log("[DEBUG] selectedDeliveryAddress:", selectedDeliveryAddress); // Log 3

    if (!selectedPickupAddress || !selectedDeliveryAddress) {
      message.error(
        "Pickup or Delivery address is missing. Please select addresses in Step 1."
      );
      console.error(
        "[DEBUG] Error: Pickup or Delivery address is missing in handleCalculateQuote."
      );
      setCurrentStep(0); // Guide user back to address selection
      return;
    }

    setProcessing(true);
    console.log("[DEBUG] setProcessing(true)"); // Log 4

    try {
      const payload = {
        pickupAddressId: selectedPickupAddress.addressId, // Potential error if selectedPickupAddress is null
        deliveryAddressId: selectedDeliveryAddress.addressId, // Potential error if selectedDeliveryAddress is null
        items: [
          {
            name: values.itemName,
            quantity: values.quantity,
            weight: values.weight,
            volume: values.volume,
          },
        ],
        deliveryType: values.deliveryType,
        speed: values.speed,
        requireSignature: values.requireSignature || false,
        notes: values.notes || "",
      };
      console.log("[DEBUG] Payload for calculateOrderPrice:", payload); // Log 5

      const response = await calculateOrderPrice(payload);
      console.log("[DEBUG] Response from calculateOrderPrice:", response); // Log 6

      // Add a check for a valid response structure
      if (!response || typeof response.totalPrice === "undefined") {
        console.error(
          "[DEBUG] Invalid or empty response from calculateOrderPrice API:",
          response
        );
        message.error(
          "Failed to calculate quote: Received an invalid response from the server. Please try again."
        );
        // Set processing to false here as we are returning early
        setProcessing(false); // Important: ensure processing is reset
        return;
      }

      setQuote({ ...response, packageDetails: values });
      console.log("[DEBUG] Quote set successfully."); // Log 7
      setCurrentStep(2);
      console.log("[DEBUG] setCurrentStep(2) called."); // Log 8
      message.success("Quote calculated!");
    } catch (error) {
      console.error(
        "[DEBUG] Error in handleCalculateQuote catch block:",
        error
      ); // Log 9
      message.error(
        "Failed to calculate quote: " +
          (error.response?.data?.message ||
            error.message ||
            "An unknown error occurred. Check console.")
      );
    } finally {
      setProcessing(false);
      console.log("[DEBUG] setProcessing(false) in finally block."); // Log 10
    }
  };

  const handlePlaceOrderAndPay = async () => {
    if (!quote || !quote.packageDetails) {
      message.error("Quote details are missing. Please calculate quote again.");
      setCurrentStep(1); // Go back to package details or quote calculation
      return;
    }
    setProcessing(true);
    try {
      // Step 1: Create Order
      const orderPayload = {
        pickupAddressId: selectedPickupAddress.addressId,
        deliveryAddressId: selectedDeliveryAddress.addressId,
        items: [
          {
            name: quote.packageDetails.itemName,
            quantity: quote.packageDetails.quantity,
            weight: quote.packageDetails.weight,
            volume: quote.packageDetails.volume,
          },
        ],
        deliveryType: quote.packageDetails.deliveryType,
        speed: quote.packageDetails.speed,
        requireSignature: quote.packageDetails.requireSignature || false,
        notes: quote.packageDetails.notes || "",
      };

      const orderResponse = await createOrder(orderPayload);

      // Step 2: Auto Pay (for demo)
      await payOrder(orderResponse.orderId, "CREDIT_CARD");

      setOrderDetails(orderResponse);
      setCurrentStep(3);
      message.success(
        `Order created and paid! Tracking: ${orderResponse.trackingNumber}`
      );
    } catch (error) {
      message.error(
        "Failed to process order: " + (error.message || "Unknown error")
      );
    } finally {
      setProcessing(false);
    }
  };

  const getLabelIcon = (label) => {
    if (label === "Home")
      return <HomeOutlined className="mr-2 text-blue-500" />;
    if (label === "Office")
      return <BankOutlined className="mr-2 text-green-500" />;
    return <PushpinOutlined className="mr-2 text-gray-500" />;
  };

  const getAddressDisplay = (address) => {
    if (!address) return "N/A";
    return `${address.address}, ${address.city}, ${address.zipCode}`;
  };

  if (loadError) {
    return (
      <Layout className="min-h-screen bg-gray-100">
        <AppHeader
          user={user}
          setUser={setUser}
          setAuthVisible={setAuthVisible}
        />
        <Content className="mt-[64px] px-4 py-8 flex justify-center items-center">
          <Alert
            message="Map loading failed"
            description="Google Maps could not be loaded. Please check your internet connection and API key."
            type="error"
            showIcon
          />
        </Content>
      </Layout>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Address Selection
        return (
          <div
            className="flex flex-col lg:flex-row gap-6"
            style={{ minHeight: "calc(100vh - 280px)" }}
          >
            <div className="w-full lg:w-1/3 bg-white p-6 rounded-lg shadow-lg">
              <Title level={3} className="mb-6">
                Select Addresses
              </Title>

              {loading ? (
                <div className="text-center py-8">
                  <Spin size="large" />
                  <Paragraph className="mt-2">Loading addresses...</Paragraph>
                </div>
              ) : addresses.length === 0 ? (
                <Empty description="No saved addresses. Please add addresses in your profile first." />
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      Pickup Address
                    </label>
                    <Select
                      placeholder="Select pickup address"
                      className="w-full"
                      size="large"
                      value={selectedPickupAddress?.addressId}
                      onChange={(value) => handleAddressSelect(value, "pickup")}
                      optionLabelProp="label"
                      showSearch
                      filterOption={(input, option) =>
                        option.label
                          .toLowerCase()
                          .includes(input.toLowerCase()) ||
                        option.children.props.children[1].props.children[1].props.children
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    >
                      {addresses.map((addr) => (
                        <Option
                          key={addr.addressId}
                          value={addr.addressId}
                          label={`${addr.label} - ${getAddressDisplay(addr)}`} // For search and display in input
                          disabled={
                            addr.addressId ===
                            selectedDeliveryAddress?.addressId
                          }
                        >
                          <div className="flex items-start py-1">
                            {getLabelIcon(addr.label)}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm">
                                {addr.label}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {getAddressDisplay(addr)}
                              </div>
                              <div className="text-xs text-gray-400">
                                Contact: {addr.contactName}
                              </div>
                            </div>
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      Delivery Address
                    </label>
                    <Select
                      placeholder="Select delivery address"
                      className="w-full"
                      size="large"
                      value={selectedDeliveryAddress?.addressId}
                      onChange={(value) =>
                        handleAddressSelect(value, "delivery")
                      }
                      optionLabelProp="label"
                      showSearch
                      filterOption={(input, option) =>
                        option.label
                          .toLowerCase()
                          .includes(input.toLowerCase()) ||
                        option.children.props.children[1].props.children[1].props.children
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    >
                      {addresses.map((addr) => (
                        <Option
                          key={addr.addressId}
                          value={addr.addressId}
                          label={`${addr.label} - ${getAddressDisplay(addr)}`} // For search and display in input
                          disabled={
                            addr.addressId === selectedPickupAddress?.addressId
                          }
                        >
                          <div className="flex items-start py-1">
                            {getLabelIcon(addr.label)}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm">
                                {addr.label}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {getAddressDisplay(addr)}
                              </div>
                              <div className="text-xs text-gray-400">
                                Contact: {addr.contactName}
                              </div>
                            </div>
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </div>

                  <Button
                    type="primary"
                    size="large"
                    block
                    disabled={
                      !selectedPickupAddress || !selectedDeliveryAddress
                    }
                    onClick={() => setCurrentStep(1)}
                    className="mt-8"
                  >
                    Next: Package Details
                  </Button>
                </div>
              )}
            </div>

            <div className="w-full lg:w-2/3 bg-gray-200 rounded-lg shadow-lg overflow-hidden">
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={{ width: "100%", height: "100%" }}
                  center={mapCenter}
                  zoom={
                    routeResult
                      ? 12
                      : selectedPickupAddress || selectedDeliveryAddress
                      ? 14
                      : 11
                  }
                  options={{
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: false,
                    zoomControl: true,
                  }}
                >
                  {selectedPickupAddress &&
                    selectedPickupAddress.latitude &&
                    selectedPickupAddress.longitude && (
                      <Marker
                        position={{
                          lat: parseFloat(selectedPickupAddress.latitude),
                          lng: parseFloat(selectedPickupAddress.longitude),
                        }}
                        label={{
                          text: "P",
                          color: "white",
                          fontWeight: "bold",
                        }}
                        icon={{
                          url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
                        }}
                        title={`Pickup: ${selectedPickupAddress.label}`}
                      />
                    )}
                  {selectedDeliveryAddress &&
                    selectedDeliveryAddress.latitude &&
                    selectedDeliveryAddress.longitude && (
                      <Marker
                        position={{
                          lat: parseFloat(selectedDeliveryAddress.latitude),
                          lng: parseFloat(selectedDeliveryAddress.longitude),
                        }}
                        label={{
                          text: "D",
                          color: "white",
                          fontWeight: "bold",
                        }}
                        icon={{
                          url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                        }}
                        title={`Delivery: ${selectedDeliveryAddress.label}`}
                      />
                    )}
                  {routeResult && (
                    <DirectionsRenderer
                      directions={routeResult}
                      options={{
                        suppressMarkers: true,
                        polylineOptions: {
                          strokeColor: "#1890ff",
                          strokeWeight: 4,
                          strokeOpacity: 0.8,
                        },
                      }}
                    />
                  )}
                </GoogleMap>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Spin size="large" />
                  <Text className="ml-3">Loading map...</Text>
                </div>
              )}
            </div>
          </div>
        );

      case 1: // Package Details
        return (
          <Card title="Package & Delivery Preferences" className="shadow-lg">
            {/* FIX: Changed configLoading to loading */}
            {loading ? (
              <div className="text-center py-10">
                <Spin size="large" />
                <Paragraph className="mt-4">
                  Loading delivery options...
                </Paragraph>
              </div>
            ) : (
              <Form
                form={form}
                layout="vertical"
                onFinish={handleCalculateQuote}
                initialValues={{
                  quantity: 1,
                  deliveryType: deliveryTypes[0]?.type,
                  speed:
                    speedOptions.find((s) => s.type === "STANDARD")?.type ||
                    speedOptions[0]?.type,
                  requireSignature: false,
                }}
              >
                <Row gutter={16}>
                  <Col xs={24}>
                    <Form.Item
                      name="itemName"
                      label="Item Name"
                      rules={[
                        { required: true, message: "Please enter item name" },
                      ]}
                    >
                      <Input
                        placeholder="e.g., Documents, Small Box, Electronics"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} sm={8}>
                    <Form.Item
                      name="quantity"
                      label="Quantity"
                      rules={[
                        { required: true, message: "Please enter quantity" },
                      ]}
                    >
                      <InputNumber min={1} className="w-full" size="large" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Form.Item
                      name="weight"
                      label="Total Weight (kg)"
                      rules={[
                        { required: true, message: "Please enter weight" },
                      ]}
                    >
                      <InputNumber
                        min={0.1}
                        step={0.1}
                        className="w-full"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Form.Item
                      name="volume"
                      label="Total Volume (L)"
                      rules={[
                        { required: true, message: "Please enter volume" },
                      ]}
                    >
                      <InputNumber
                        min={0.1}
                        step={0.1}
                        className="w-full"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                {/* Layout for Delivery Type and Speed side-by-side on larger screens */}
                <Row gutter={24} className="mb-6">
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="deliveryType"
                      label="Delivery Type"
                      rules={[
                        {
                          required: true,
                          message: "Please select delivery type",
                        },
                      ]}
                    >
                      <Radio.Group className="w-full">
                        {deliveryTypes.length > 0 ? (
                          deliveryTypes.map((dt) => (
                            <div
                              key={dt.type}
                              className="mb-3 p-3 border rounded hover:border-blue-500 transition-colors"
                            >
                              <Radio value={dt.type} style={{ width: "100%" }}>
                                <div className="flex justify-between items-center">
                                  <div>
                                    <div className="font-semibold">
                                      {dt.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      Max {dt.maxWeight}kg • Base $
                                      {dt.basePrice}
                                    </div>
                                  </div>
                                </div>
                              </Radio>
                            </div>
                          ))
                        ) : (
                          <Text type="secondary">
                            No delivery types available.
                          </Text>
                        )}
                      </Radio.Group>
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      name="speed"
                      label="Delivery Speed"
                      rules={[
                        { required: true, message: "Please select speed" },
                      ]}
                    >
                      <Radio.Group className="w-full">
                        {speedOptions.length > 0 ? (
                          speedOptions.map((so) => (
                            <div
                              key={so.type}
                              className="mb-3 p-3 border rounded hover:border-blue-500 transition-colors"
                            >
                              <Radio value={so.type} style={{ width: "100%" }}>
                                <div className="flex justify-between items-center">
                                  <div>
                                    <div className="font-semibold">
                                      {so.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {so.description}
                                    </div>
                                  </div>
                                  {so.priceMultiplier && (
                                    <Text strong>${so.priceMultiplier}x</Text>
                                  )}
                                </div>
                              </Radio>
                            </div>
                          ))
                        ) : (
                          <Text type="secondary">
                            No speed options available.
                          </Text>
                        )}
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24}>
                    <Form.Item name="requireSignature" valuePropName="checked">
                      <Checkbox>
                        <span className="text-sm">
                          Require Signature on Delivery
                        </span>
                      </Checkbox>
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item name="notes" label="Delivery Notes (Optional)">
                  <TextArea
                    rows={3}
                    placeholder="Special instructions (e.g., Leave at front door, Fragile item, Building access code...)"
                    size="large"
                  />
                </Form.Item>

                <Form.Item className="mt-8">
                  <Row justify="end" gutter={16}>
                    <Col>
                      <Button size="large" onClick={() => setCurrentStep(0)}>
                        Back to Addresses
                      </Button>
                    </Col>
                    <Col>
                      <Button
                        type="primary"
                        size="large"
                        htmlType="submit"
                        loading={processing}
                        className="bg-blue-500 hover:bg-blue-600"
                        disabled={
                          deliveryTypes.length === 0 ||
                          speedOptions.length === 0
                        }
                      >
                        Calculate Quote
                      </Button>
                    </Col>
                  </Row>
                </Form.Item>
              </Form>
            )}
          </Card>
        );
      // FIX: Removed the duplicate <Form> block that was here.
      // The above <Form> within the <Card> is the correct one.

      case 2: // Review Quote
        if (!quote) {
          // Add a guard in case quote is null
          return (
            <Card title="Review Your Quote" className="shadow-lg">
              <Alert
                message="No Quote Available"
                description="Please go back and calculate a quote first."
                type="warning"
                showIcon
              />
              <div className="mt-4 text-right">
                <Button size="large" onClick={() => setCurrentStep(1)}>
                  Back to Package Details
                </Button>
              </div>
            </Card>
          );
        }
        return (
          <Card title="Review Your Quote" className="shadow-lg">
            <div className="space-y-6">
              <div>
                <Title level={4} className="mb-2">
                  Route
                </Title>
                <Paragraph>
                  <strong>From:</strong>{" "}
                  {getAddressDisplay(selectedPickupAddress)}
                </Paragraph>
                <Paragraph>
                  <strong>To:</strong>{" "}
                  {getAddressDisplay(selectedDeliveryAddress)}
                </Paragraph>
              </div>

              <div>
                <Title level={4} className="mb-2">
                  Package & Service
                </Title>
                <Paragraph>
                  <strong>Item:</strong> {quote.packageDetails.itemName} (×
                  {quote.packageDetails.quantity})
                </Paragraph>
                <Paragraph>
                  <strong>Weight:</strong> {quote.packageDetails.weight}kg,{" "}
                  <strong>Volume:</strong> {quote.packageDetails.volume}L
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
                {quote.packageDetails.notes && (
                  <Paragraph>
                    <strong>Notes:</strong> {quote.packageDetails.notes}
                  </Paragraph>
                )}
                {quote.packageDetails.requireSignature && (
                  <Paragraph>
                    <strong>Signature Required:</strong> Yes
                  </Paragraph>
                )}
              </div>

              <div>
                <Title level={4} className="mb-2">
                  Pricing
                </Title>
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Paragraph className="text-lg">
                      <DollarCircleOutlined className="mr-2" />{" "}
                      <strong>Total: ${quote.totalPrice.toFixed(2)}</strong>
                    </Paragraph>
                    <Paragraph>
                      <ClockCircleOutlined className="mr-2" />{" "}
                      <strong>ETA:</strong> {quote.estimatedTime}
                    </Paragraph>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Text strong>Breakdown:</Text>
                    <div className="text-sm text-gray-600 mt-2 space-y-1">
                      <div>Base: {quote.priceBreakdown.base || "N/A"}</div>
                      <div>
                        Distance: {quote.priceBreakdown.distance || "N/A"}
                      </div>
                      <div>Weight: {quote.priceBreakdown.weight || "N/A"}</div>
                      <div>Speed: {quote.priceBreakdown.speed || "N/A"}</div>
                    </div>
                  </Col>
                </Row>
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t mt-6">
                <Button size="large" onClick={() => setCurrentStep(1)}>
                  Back
                </Button>
                <Button
                  type="primary"
                  size="large"
                  onClick={handlePlaceOrderAndPay}
                  loading={processing}
                  className="bg-green-500 hover:bg-green-600"
                >
                  Place Order & Pay ${quote.totalPrice.toFixed(2)}
                </Button>
              </div>
            </div>
          </Card>
        );

      case 3: // Order Confirmation
        if (!orderDetails) {
          // Add a guard in case orderDetails is null
          return (
            <Card title="Order Status" className="shadow-lg">
              <Alert
                message="Order Information Missing"
                description="Something went wrong, and order confirmation details are not available. Please check your order history or contact support."
                type="error"
                showIcon
              />
              <div className="mt-6 text-center">
                <Button
                  type="primary"
                  size="large"
                  onClick={() => {
                    setCurrentStep(0);
                    form.resetFields();
                    setQuote(null);
                    setOrderDetails(null);
                    setSelectedPickupAddress(null);
                    setSelectedDeliveryAddress(null);
                    setRouteResult(null);
                  }}
                >
                  Create Another Order
                </Button>
              </div>
            </Card>
          );
        }
        return (
          <Card title="Order Confirmed!" className="shadow-lg">
            <Alert
              message="Order Successfully Created & Paid!"
              description={
                <div className="space-y-1">
                  <p>
                    <strong>Order ID:</strong> {orderDetails.orderId}
                  </p>
                  <p>
                    <strong>Tracking Number:</strong>{" "}
                    {orderDetails.trackingNumber}
                  </p>
                  <p>
                    <strong>Status:</strong> PAID
                  </p>
                  <p>
                    <strong>Total Paid:</strong> $
                    {orderDetails.paymentAmount?.toFixed(2) || "N/A"}
                  </p>
                </div>
              }
              type="success"
              showIcon
            />
            <div className="mt-6 text-center">
              <Button
                type="primary"
                size="large"
                onClick={() => {
                  setCurrentStep(0);
                  form.resetFields();
                  setQuote(null);
                  setOrderDetails(null);
                  setSelectedPickupAddress(null);
                  setSelectedDeliveryAddress(null);
                  setRouteResult(null);
                  // Optionally re-fetch initial data if needed, or rely on existing
                  // fetchInitialData();
                }}
              >
                Create Another Order
              </Button>
            </div>
          </Card>
        );

      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <Layout className="min-h-screen bg-gray-100">
      <AppHeader
        user={user}
        setUser={setUser}
        setAuthVisible={setAuthVisible}
      />
      <Content className="mt-[64px] px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {" "}
          {/* Changed from max-w-5xl for a bit more width */}
          <Title level={2} className="mb-6 text-center">
            Create New Delivery
          </Title>
          <Steps current={currentStep} className="mb-8">
            <Step title="Addresses" description="Select pickup & delivery" />
            <Step title="Package" description="Item details & preferences" />
            <Step title="Quote" description="Review & confirm" />
            <Step title="Complete" description="Order confirmed" />
          </Steps>
          {renderStepContent()}
        </div>
      </Content>
    </Layout>
  );
}

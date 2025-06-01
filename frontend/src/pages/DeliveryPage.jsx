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
  Space,
  Spin,
  Alert,
  Select,
  Empty,
} from "antd";
import {
  EnvironmentOutlined,
  LoadingOutlined,
  InboxOutlined,
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
const GOOGLE_MAP_LIBRARIES = ["places"];

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
  const [loading, setLoading] = useState(true);

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
    setProcessing(true);
    try {
      const payload = {
        pickupAddressId: selectedPickupAddress.addressId,
        deliveryAddressId: selectedDeliveryAddress.addressId,
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
      };

      const response = await calculateOrderPrice(payload);
      setQuote({ ...response, packageDetails: values });
      setCurrentStep(2);
      message.success("Quote calculated!");
    } catch (error) {
      message.error("Failed to calculate quote: " + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handlePlaceOrderAndPay = async () => {
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
      message.error("Failed to process order: " + error.message);
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
          <Alert message="Map loading failed" type="error" />
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
                </div>
              ) : addresses.length === 0 ? (
                <Empty description="No saved addresses. Please add addresses first." />
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
                    >
                      {addresses.map((addr) => (
                        <Option
                          key={addr.addressId}
                          value={addr.addressId}
                          label={`${addr.label} - ${addr.address}`}
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
                    >
                      {addresses.map((addr) => (
                        <Option
                          key={addr.addressId}
                          value={addr.addressId}
                          label={`${addr.label} - ${addr.address}`}
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
                  {selectedPickupAddress && (
                    <Marker
                      position={{
                        lat: parseFloat(selectedPickupAddress.latitude),
                        lng: parseFloat(selectedPickupAddress.longitude),
                      }}
                      label={{ text: "P", color: "white", fontWeight: "bold" }}
                      icon={{
                        url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
                      }}
                      title={`Pickup: ${selectedPickupAddress.label}`}
                    />
                  )}
                  {selectedDeliveryAddress && (
                    <Marker
                      position={{
                        lat: parseFloat(selectedDeliveryAddress.latitude),
                        lng: parseFloat(selectedDeliveryAddress.longitude),
                      }}
                      label={{ text: "D", color: "white", fontWeight: "bold" }}
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
              {/* Item details in a more balanced layout */}
              <Row gutter={16}>
                <Col xs={24}>
                  <Form.Item
                    name="itemName"
                    label="Item Name"
                    rules={[{ required: true }]}
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
                    rules={[{ required: true }]}
                  >
                    <InputNumber min={1} className="w-full" size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="weight"
                    label="Weight (kg)"
                    rules={[{ required: true }]}
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
                    label="Volume (L)"
                    rules={[{ required: true }]}
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

              <Form.Item
                name="deliveryType"
                label="Delivery Type"
                rules={[{ required: true }]}
              >
                <Radio.Group>
                  {deliveryTypes.map((dt) => (
                    <Radio key={dt.type} value={dt.type}>
                      <div>
                        <strong>{dt.name}</strong>
                        <div className="text-sm text-gray-500">
                          Max {dt.maxWeight}kg, Base ${dt.basePrice}
                        </div>
                      </div>
                    </Radio>
                  ))}
                </Radio.Group>
              </Form.Item>

              <Form.Item
                name="speed"
                label="Delivery Speed"
                rules={[{ required: true }]}
              >
                <Radio.Group>
                  {speedOptions.map((so) => (
                    <Radio key={so.type} value={so.type}>
                      <strong>{so.name}</strong> - {so.description}
                    </Radio>
                  ))}
                </Radio.Group>
              </Form.Item>

              {/* Additional options */}
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
                    >
                      Calculate Quote
                    </Button>
                  </Col>
                </Row>
              </Form.Item>
            </Form>
          </Card>
        );

      case 2: // Review Quote
        return (
          <Card title="Review Your Quote" className="shadow-lg">
            <div className="space-y-4">
              <div>
                <Title level={4}>Route</Title>
                <p>
                  <strong>From:</strong>{" "}
                  {getAddressDisplay(selectedPickupAddress)}
                </p>
                <p>
                  <strong>To:</strong>{" "}
                  {getAddressDisplay(selectedDeliveryAddress)}
                </p>
              </div>

              <div>
                <Title level={4}>Package</Title>
                <p>
                  <strong>Item:</strong> {quote.packageDetails.itemName} (×
                  {quote.packageDetails.quantity})
                </p>
                <p>
                  <strong>Weight:</strong> {quote.packageDetails.weight}kg,{" "}
                  <strong>Volume:</strong> {quote.packageDetails.volume}L
                </p>
                <p>
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
                </p>
              </div>

              <div>
                <Title level={4}>Pricing</Title>
                <Row gutter={16}>
                  <Col span={12}>
                    <p>
                      <DollarCircleOutlined />{" "}
                      <strong>Total: ${quote.totalPrice.toFixed(2)}</strong>
                    </p>
                    <p>
                      <ClockCircleOutlined /> <strong>ETA:</strong>{" "}
                      {quote.estimatedTime}
                    </p>
                  </Col>
                  <Col span={12}>
                    <div className="text-sm">
                      <p>Base: {quote.priceBreakdown.base}</p>
                      <p>Distance: {quote.priceBreakdown.distance}</p>
                      <p>Speed: {quote.priceBreakdown.speed}</p>
                    </div>
                  </Col>
                </Row>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Button size="large" onClick={() => setCurrentStep(1)}>
                  Back
                </Button>
                <Button
                  type="primary"
                  size="large"
                  onClick={handlePlaceOrderAndPay}
                  loading={processing}
                >
                  Place Order & Pay ${quote.totalPrice.toFixed(2)}
                </Button>
              </div>
            </div>
          </Card>
        );

      case 3: // Order Confirmation
        return (
          <Card title="Order Confirmed!" className="shadow-lg">
            <Alert
              message="Order Successfully Created & Paid!"
              description={
                <div>
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
                    {orderDetails.paymentAmount.toFixed(2)}
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
                onClick={() => window.location.reload()}
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
          <Title level={2} className="mb-6">
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

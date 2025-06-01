import React, { useState, useEffect, useCallback } from "react";
import {
  Layout,
  Typography,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
  Card,
  Spin,
  message,
  Popconfirm,
  Empty,
  Space,
  Divider,
  Tooltip, // Added Tooltip
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  BankOutlined,
  PushpinOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import AppHeader from "../components/Layout/Header";
import { fetchCoordinatesFromAddress } from "../services/geocodingService"; // Import the new service

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const DEFAULT_LATITUDE = 37.7749; // San Francisco default
const DEFAULT_LONGITUDE = -122.4194;

const AddressPage = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [form] = Form.useForm();
  const { currentUser } = useAuth();

  const [mapCoordinates, setMapCoordinates] = useState({
    lat: DEFAULT_LATITUDE,
    lon: DEFAULT_LONGITUDE,
  });
  const [geocodingLoading, setGeocodingLoading] = useState(false); // For geocoding search button

  // Hidden form fields for latitude and longitude
  const [currentLatitude, setCurrentLatitude] = useState(DEFAULT_LATITUDE);
  const [currentLongitude, setCurrentLongitude] = useState(DEFAULT_LONGITUDE);

  const fetchAddressesCallback = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const response = await getAddresses();
      setAddresses(response.addresses || []);
    } catch (error) {
      message.error(
        "Failed to fetch addresses: " +
          (error.message || "Please try again later.")
      );
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchAddressesCallback();
  }, [fetchAddressesCallback]);

  const showModal = (address = null) => {
    setEditingAddress(address);
    if (address) {
      form.setFieldsValue({ ...address });
      const lat = parseFloat(address.latitude);
      const lon = parseFloat(address.longitude);
      if (!isNaN(lat) && !isNaN(lon)) {
        setMapCoordinates({ lat, lon });
        setCurrentLatitude(lat);
        setCurrentLongitude(lon);
      } else {
        setMapCoordinates({ lat: DEFAULT_LATITUDE, lon: DEFAULT_LONGITUDE });
        setCurrentLatitude(DEFAULT_LATITUDE);
        setCurrentLongitude(DEFAULT_LONGITUDE);
      }
    } else {
      form.resetFields();
      form.setFieldsValue({ city: "San Francisco" });
      setMapCoordinates({ lat: DEFAULT_LATITUDE, lon: DEFAULT_LONGITUDE });
      setCurrentLatitude(DEFAULT_LATITUDE);
      setCurrentLongitude(DEFAULT_LONGITUDE);
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingAddress(null);
    form.resetFields();
  };

  const handleGeocodeAddress = async () => {
    const street = form.getFieldValue("address");
    const city = form.getFieldValue("city");
    const zipCode = form.getFieldValue("zipCode");

    if (!street || !city) {
      message.warn(
        "Please enter at least street address and city to find coordinates."
      );
      return;
    }

    let addressQuery = `${street}, ${city}`;
    if (zipCode) {
      addressQuery += `, ${zipCode}`;
    }
    // Assuming addresses are in the US for more specific search, can be adjusted
    addressQuery += ", USA";

    setGeocodingLoading(true);
    message.loading({
      content: "Fetching coordinates...",
      key: "geocoding",
      duration: 0,
    });

    const coords = await fetchCoordinatesFromAddress(addressQuery);

    message.destroy("geocoding");
    setGeocodingLoading(false);

    if (coords) {
      setMapCoordinates({ lat: coords.lat, lon: coords.lon });
      setCurrentLatitude(coords.lat);
      setCurrentLongitude(coords.lon);
      message.success("Coordinates found and map updated!");
    } else {
      message.error(
        "Could not find coordinates for the address. Please check the address or use default coordinates."
      );
      // Optionally revert to default or keep previous if preferred
      setMapCoordinates({ lat: DEFAULT_LATITUDE, lon: DEFAULT_LONGITUDE });
      setCurrentLatitude(DEFAULT_LATITUDE);
      setCurrentLongitude(DEFAULT_LONGITUDE);
    }
  };

  const handleFormSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        latitude: currentLatitude, // Use state variable for latitude
        longitude: currentLongitude, // Use state variable for longitude
      };

      if (editingAddress) {
        await updateAddress(editingAddress.addressId, payload);
        message.success("Address updated successfully!");
      } else {
        await addAddress(payload);
        message.success("New address added successfully!");
      }
      setIsModalVisible(false);
      fetchAddressesCallback();
    } catch (error) {
      message.error(
        "Operation failed: " + (error.message || "Please check your input.")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    setLoading(true);
    try {
      await deleteAddress(addressId);
      message.success("Address deleted successfully!");
      fetchAddressesCallback();
    } catch (error) {
      message.error(
        "Deletion failed: " + (error.message || "Please try again later.")
      );
    } finally {
      setLoading(false);
    }
  };

  const getLabelIcon = (label) => {
    if (label === "Home")
      return <HomeOutlined className="mr-2 text-blue-500" />;
    if (label === "Office")
      return <BankOutlined className="mr-2 text-green-500" />;
    return <PushpinOutlined className="mr-2 text-gray-500" />;
  };

  const getMapUrl = (lat, lon) => {
    const validLat = parseFloat(lat);
    const validLon = parseFloat(lon);
    if (!isNaN(validLat) && !isNaN(validLon)) {
      return `https://www.openstreetmap.org/export/embed.html?bbox=${
        validLon - 0.005
      }%2C${validLat - 0.005}%2C${validLon + 0.005}%2C${
        validLat + 0.005
      }&layer=mapnik&marker=${validLat}%2C${validLon}`;
    }
    return `https://www.openstreetmap.org/export/embed.html?bbox=-122.5136%2C37.7080%2C-122.3580%2C37.8324&layer=mapnik`;
  };

  return (
    <Layout className="min-h-screen bg-gray-100">
      <AppHeader navBg="bg-blue-600" menuTheme="dark" />
      <Content className="p-4 md:p-8 pt-[80px] md:pt-[96px]">
        <div className="max-w-5xl mx-auto bg-white p-6 sm:p-8 rounded-lg shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <Title
              level={2}
              className="!text-2xl sm:!text-3xl !text-gray-800 !mb-4 sm:!mb-0"
            >
              My Address Book
            </Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showModal()}
              className="bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700"
            >
              Add New Address
            </Button>
          </div>

          {loading && !isModalVisible ? (
            <div className="text-center py-10">
              <Spin size="large" />
            </div>
          ) : addresses.length === 0 ? (
            <Empty
              description="You haven't added any addresses yet."
              className="py-10"
            />
          ) : (
            <Row gutter={[16, 16]}>
              {addresses.map((addr) => (
                <Col xs={24} sm={12} lg={8} key={addr.addressId}>
                  <Card
                    hoverable
                    className="h-full shadow-md rounded-lg border border-gray-200 flex flex-col"
                    actions={[
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        key="edit"
                        onClick={() => showModal(addr)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        Edit
                      </Button>,
                      <Popconfirm
                        title="Are you sure you want to delete this address?"
                        onConfirm={() => handleDeleteAddress(addr.addressId)}
                        okText="Yes, Delete"
                        cancelText="Cancel"
                        placement="topRight"
                      >
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          key="delete"
                          className="hover:text-red-700"
                        >
                          Delete
                        </Button>
                      </Popconfirm>,
                    ]}
                  >
                    <Card.Meta
                      avatar={getLabelIcon(addr.label)}
                      title={
                        <Text strong className="text-lg text-gray-700">
                          {addr.label}
                        </Text>
                      }
                      description={
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>
                            <EnvironmentOutlined className="mr-1" />{" "}
                            {`${addr.address}, ${addr.city}, ${addr.zipCode}`}
                          </p>
                          <p>Contact: {addr.contactName}</p>
                          <p>Phone: {addr.contactPhone}</p>
                          {addr.latitude && addr.longitude && (
                            <p className="text-xs text-gray-500">
                              Coordinates:{" "}
                              {parseFloat(addr.latitude).toFixed(4)},{" "}
                              {parseFloat(addr.longitude).toFixed(4)}
                            </p>
                          )}
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>

        <Modal
          title={editingAddress ? "Edit Address" : "Add New Address"}
          visible={isModalVisible}
          onCancel={handleCancel}
          footer={null}
          width={800}
          destroyOnClose
        >
          <Spin spinning={(loading && isModalVisible) || geocodingLoading}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleFormSubmit}
              className="space-y-4"
            >
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="label"
                    label="Label"
                    rules={[
                      {
                        required: true,
                        message: "Please select an address label!",
                      },
                    ]}
                  >
                    <Select placeholder="e.g., Home, Office, Other">
                      <Option value="Home">Home</Option>
                      <Option value="Office">Office</Option>
                      <Option value="Other">Other</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="contactName"
                    label="Contact Name"
                    rules={[
                      {
                        required: true,
                        message: "Please enter the contact name!",
                      },
                    ]}
                  >
                    <Input placeholder="John Doe" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col xs={24} sm={16}>
                  <Form.Item
                    name="address"
                    label="Street Address"
                    rules={[
                      {
                        required: true,
                        message: "Please enter the street address!",
                      },
                    ]}
                  >
                    <Input placeholder="e.g., 123 Market St" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item label="&nbsp;">
                    {" "}
                    {/* Spacer for alignment */}
                    <Tooltip title="Find coordinates based on Street, City, and ZIP Code">
                      <Button
                        icon={<SearchOutlined />}
                        onClick={handleGeocodeAddress}
                        loading={geocodingLoading}
                        block
                      >
                        Find on Map
                      </Button>
                    </Tooltip>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    name="city"
                    label="City"
                    rules={[
                      { required: true, message: "Please enter the city!" },
                    ]}
                    initialValue="San Francisco"
                  >
                    <Input placeholder="San Francisco" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    name="zipCode"
                    label="ZIP Code"
                    rules={[
                      {
                        required: true,
                        message:
                          "Please enter the ZIP code!" /*宽松校验，因为格式多样*/,
                      },
                    ]}
                  >
                    <Input placeholder="e.g., 94103" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={8}>
                  <Form.Item
                    name="contactPhone"
                    label="Contact Phone"
                    rules={[
                      {
                        required: true,
                        message: "Please enter the contact phone number!",
                      },
                      {
                        pattern: /^[0-9\-+\s()]*$/,
                        message: "Please enter a valid phone number format!",
                      },
                    ]}
                  >
                    <Input placeholder="e.g., 415-555-0123" />
                  </Form.Item>
                </Col>
              </Row>

              {/* Hidden fields to store lat/lon if needed, or manage in state directly */}
              {/* <Form.Item name="latitude" hidden><Input /></Form.Item> */}
              {/* <Form.Item name="longitude" hidden><Input /></Form.Item> */}

              <Divider>Location Preview</Divider>

              <Form.Item label="Map Preview">
                <iframe
                  title="Map Preview"
                  width="100%"
                  height="250"
                  frameBorder="0"
                  style={{ border: "1px solid #d9d9d9", borderRadius: "4px" }}
                  src={getMapUrl(mapCoordinates.lat, mapCoordinates.lon)}
                  loading="lazy"
                ></iframe>
                <Text type="secondary" className="text-xs mt-1 block">
                  Note: Map shows an approximate location. Click "Find on Map"
                  to update based on address. If not found, default coordinates
                  may be used.
                </Text>
              </Form.Item>

              <Form.Item className="mt-6">
                <Space>
                  <Button onClick={handleCancel}>Cancel</Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {editingAddress ? "Save Changes" : "Add Address"}
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Spin>
        </Modal>
      </Content>
    </Layout>
  );
};

export default AddressPage;

//   const testAddresses = [
//     {
//       key: 1,
//       category: 'Financial District',
//       name: 'Salesforce Tower',
//       address: '415 Mission St',
//       city: 'San Francisco',
//       zipCode: '94105',
//       expectedLat: 37.7897,
//       expectedLng: -122.3972,
//       description: '旧金山最高建筑，金融区核心'
//     },
//     {
//       key: 2,
//       category: 'SOMA',
//       name: 'Twitter HQ',
//       address: '1355 Market St',
//       city: 'San Francisco',
//       zipCode: '94103',
//       expectedLat: 37.7765,
//       expectedLng: -122.4165,
//       description: 'Twitter总部，SOMA区域'
//     },
//     {
//       key: 3,
//       category: 'Union Square',
//       name: 'Apple Store',
//       address: '300 Post St',
//       city: 'San Francisco',
//       zipCode: '94108',
//       expectedLat: 37.7880,
//       expectedLng: -122.4075,
//       description: 'Union Square苹果旗舰店'
//     },

import React, { useState, useEffect, useCallback } from "react";
import {
  Layout,
  Typography,
  Card,
  Spin,
  Empty,
  Button,
  List,
  Tag,
  Pagination,
  Descriptions,
  Space,
  message,
  // Modal, // Modal is now handled by TrackingModal
} from "antd";
import {
  CarryOutOutlined, // Page title icon
  RocketOutlined,
  RobotOutlined,
  FileTextOutlined, // Fallback delivery type icon
  CalendarOutlined,
  EnvironmentOutlined,
  DollarCircleOutlined,
  AimOutlined, // Track Order button icon
} from "@ant-design/icons";
import { getOrders } from "../services/api";
import { useAuth } from "../context/AuthContext";
import AppHeader from "../components/Layout/Header";
import TrackingModal from "../components/Tracking/TrackingModal"; // Added import

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const ITEMS_PER_PAGE = 6; // Number of orders per page
const ACTIVE_ORDER_STATUSES = [
  "PAID",
  "PREPARING",
  "PICKING_UP",
  "PICKED_UP",
  "DELIVERING",
];

const TrackingPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  // State for TrackingModal
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isTrackingModalVisible, setIsTrackingModalVisible] = useState(false);

  const formatOrderDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString)
      .toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(",", "");
  };

  const fetchActiveOrders = useCallback(
    async (page = 1) => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        // Fetch a page of all orders (status: null) and then filter client-side
        // To truly only fetch active orders, the API would need to support multiple status query params
        // e.g. /api/orders?status=PAID&status=PREPARING... or status=ACTIVE_GROUP
        // For now, we fetch a page and filter.
        const response = await getOrders(page, ITEMS_PER_PAGE, null); // Fetch all statuses for the page
        if (response && response.orders) {
          const activeOrders = response.orders.filter((order) =>
            ACTIVE_ORDER_STATUSES.includes(order.status)
          );
          setOrders(activeOrders);
          setTotalOrders(response.totalOrders || 0); // Total orders across all statuses
        } else {
          setOrders([]);
          setTotalOrders(0);
        }
      } catch (error) {
        message.error(
          "Failed to fetch active orders: " +
            (error.message || "Please try again.")
        );
        setOrders([]);
        setTotalOrders(0);
      } finally {
        setLoading(false);
      }
    },
    [currentUser]
  );

  useEffect(() => {
    fetchActiveOrders(currentPage);
  }, [fetchActiveOrders, currentPage]);

  const handleOpenTrackingModal = (order) => {
    setSelectedOrderId(order.orderId);
    setIsTrackingModalVisible(true);
  };

  const handleCloseTrackingModal = () => {
    setIsTrackingModalVisible(false);
    setSelectedOrderId(null); // Clear selected order ID
    // Optionally, refresh active orders if modal interaction could change status
    // fetchActiveOrders(currentPage);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderOrderStatusTag = (status) => {
    let color = "default";
    if (ACTIVE_ORDER_STATUSES.includes(status)) {
      switch (status) {
        case "PAID":
          color = "warning";
          break;
        case "PREPARING":
          color = "cyan";
          break;
        case "PICKING_UP":
          color = "blue";
          break;
        case "PICKED_UP":
          color = "purple";
          break;
        case "DELIVERING":
          color = "geekblue";
          break;
        default:
          color = "processing";
      }
    } else if (status === "COMPLETED") color = "success";
    else if (status === "CANCELLED") color = "error";
    else if (status === "DELIVERED") color = "success";
    return <Tag color={color}>{status.replace("_", " ").toUpperCase()}</Tag>;
  };

  const getDeliveryTypeIcon = (type) => {
    if (type === "DRONE")
      return (
        <RocketOutlined
          className="mr-2 text-blue-500"
          style={{ fontSize: "18px" }}
        />
      );
    if (type === "ROBOT")
      return (
        <RobotOutlined
          className="mr-2 text-green-500"
          style={{ fontSize: "18px" }}
        />
      );
    return <FileTextOutlined className="mr-2" />;
  };

  return (
    <Layout className="min-h-screen bg-gray-100">
      <AppHeader navBg="bg-blue-600" menuTheme="dark" />
      <Content className="p-4 md:p-8 pt-[80px] md:pt-[96px]">
        <div className="max-w-6xl mx-auto">
          <Title
            level={2}
            className="!text-2xl sm:!text-3xl !text-gray-800 !mb-8 text-center sm:text-left"
          >
            <CarryOutOutlined className="mr-3" />
            Track Your Active Orders
          </Title>

          {loading && orders.length === 0 && currentPage === 1 ? ( // Show main loading only on first load/page
            <div className="text-center py-10">
              <Spin size="large" />
              <Paragraph className="mt-4 text-gray-600">
                Loading your active orders...
              </Paragraph>
            </div>
          ) : !loading &&
            orders.length === 0 &&
            totalOrders > 0 &&
            currentPage > 1 ? (
            <div className="text-center py-10">
              <Empty description="No active orders found on this page. Try previous pages or check history.">
                <Button
                  type="primary"
                  className="mt-6 bg-blue-600 hover:bg-blue-700"
                  onClick={() => setCurrentPage(1)}
                >
                  Go to First Page
                </Button>
              </Empty>
            </div>
          ) : !loading && orders.length === 0 ? (
            <div className="text-center py-10">
              <Empty description="You have no active orders at the moment." />
              <Button
                type="primary"
                className="mt-6 bg-blue-600 hover:bg-blue-700"
                onClick={() => (window.location.href = "/create")}
              >
                Place New Order
              </Button>
            </div>
          ) : (
            <>
              {/* Show a smaller spinner for subsequent page loads if orders are already present */}
              {loading && orders.length > 0 && (
                <div className="text-center mb-4">
                  <Spin tip="Loading more orders..." />
                </div>
              )}
              <List
                grid={{
                  gutter: 24,
                  xs: 1,
                  sm: 1,
                  md: 2,
                  lg: 2,
                  xl: 3,
                  xxl: 3,
                }}
                dataSource={orders}
                renderItem={(order) => (
                  <List.Item>
                    <Card
                      hoverable
                      className="shadow-lg rounded-lg border border-gray-200 w-full"
                      title={
                        <div className="flex items-center">
                          {getDeliveryTypeIcon(order.deliveryType)}
                          <Text strong className="text-sm md:text-base">
                            Order ID: {order.orderId}
                          </Text>
                        </div>
                      }
                      extra={renderOrderStatusTag(order.status)}
                    >
                      <Descriptions
                        bordered
                        column={1}
                        size="small"
                        className="mb-4"
                      >
                        <Descriptions.Item
                          label={
                            <>
                              <CalendarOutlined className="mr-2" />
                              Created
                            </>
                          }
                        >
                          {formatOrderDate(
                            order.createdAt || order.statusHistory?.[0]?.time
                          )}
                        </Descriptions.Item>
                        <Descriptions.Item
                          label={
                            <>
                              <EnvironmentOutlined className="mr-2" />
                              Pickup
                            </>
                          }
                        >
                          {order.pickupAddress?.address || "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item
                          label={
                            <>
                              <EnvironmentOutlined className="mr-2" />
                              Delivery
                            </>
                          }
                        >
                          {order.deliveryAddress?.address || "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item
                          label={
                            <>
                              <DollarCircleOutlined className="mr-2" />
                              Total
                            </>
                          }
                        >
                          $
                          {order.pricing?.totalPrice?.toFixed(2) ||
                            order.paymentAmount?.toFixed(2) ||
                            "N/A"}
                        </Descriptions.Item>
                      </Descriptions>

                      <div className="text-center">
                        <Button
                          icon={<AimOutlined />}
                          onClick={() => handleOpenTrackingModal(order)}
                          className="text-blue-500 border-blue-500 hover:!text-blue-600 hover:!border-blue-600"
                          // Disable if status is not suitable for tracking
                          disabled={
                            !["PICKING_UP", "DELIVERING"].includes(
                              order.status
                            ) &&
                            order.status !== "PREPARING" &&
                            order.status !== "PAID"
                          }
                        >
                          {/* Change button text based on status */}
                          {["PICKING_UP", "DELIVERING"].includes(order.status)
                            ? "Track Live"
                            : "View Progress"}
                        </Button>
                      </div>
                    </Card>
                  </List.Item>
                )}
              />
              {totalOrders > ITEMS_PER_PAGE && (
                <Pagination
                  current={currentPage}
                  pageSize={ITEMS_PER_PAGE}
                  total={totalOrders}
                  onChange={handlePageChange}
                  className="text-center mt-8"
                  showSizeChanger={false}
                />
              )}
            </>
          )}
        </div>

        {isTrackingModalVisible && selectedOrderId && (
          <TrackingModal
            visible={isTrackingModalVisible}
            onCancel={handleCloseTrackingModal}
            orderId={selectedOrderId}
          />
        )}
      </Content>
    </Layout>
  );
};

export default TrackingPage;

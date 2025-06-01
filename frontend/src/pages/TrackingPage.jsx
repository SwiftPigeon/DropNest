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
  const [totalOrders, setTotalOrders] = useState(0); // This will be total of ALL user orders from API

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
        const response = await getOrders(page, ITEMS_PER_PAGE, null);
        if (response && response.orders) {
          const activeOrders = response.orders.filter((order) =>
            ACTIVE_ORDER_STATUSES.includes(order.status)
          );
          setOrders(activeOrders);
          // The API's totalOrders will be for all statuses if status=null is passed.
          // Pagination will reflect navigating through all user's orders,
          // but only active ones will be displayed on the current page.
          setTotalOrders(response.totalOrders || 0);
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
    // Placeholder for opening a real tracking modal
    console.log("Tracking order:", order);
    message.info(
      `Tracking for Order ID: ${order.orderId} (Details in console)`
    );
    // Example: setIsTrackingModalVisible(true); setSelectedOrderForTracking(order);
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
    else if (status === "DELIVERED") color = "success"; // Or 'blue' if preferred based on HistoryPage style for non-completed confirmed
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
          className="mr-2 text-green-500" // Different color for variety
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

          {loading && orders.length === 0 ? (
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
            // This case handles when current page (of all orders) has no active orders
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
                dataSource={orders} // Already filtered active orders for the current API page
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
                          {/* Assuming order.createdAt exists, or fallback to first statusHistory entry */}
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
                        >
                          Track Order
                        </Button>
                      </div>
                    </Card>
                  </List.Item>
                )}
              />
              {/* Pagination total is based on ALL user orders. A page might display < ITEMS_PER_PAGE of active orders. */}
              {totalOrders > ITEMS_PER_PAGE && (
                <Pagination
                  current={currentPage}
                  pageSize={ITEMS_PER_PAGE} // API page size
                  total={totalOrders} // Total of ALL orders from API
                  onChange={handlePageChange}
                  className="text-center mt-8"
                  showSizeChanger={false}
                />
              )}
            </>
          )}
        </div>

        {/* 
          Future TrackingModal:
          <Modal
            title="Real-time Order Tracking"
            visible={isTrackingModalVisible}
            onCancel={() => setIsTrackingModalVisible(false)}
            footer={[<Button key="close" onClick={() => setIsTrackingModalVisible(false)}>Close</Button>]}
            width={800} // Or dynamic
          >
            {selectedOrderForTracking && (
              <p>Tracking details for Order ID: {selectedOrderForTracking.orderId}</p>
              // Map component and tracking info would go here
            )}
          </Modal>
        */}
      </Content>
    </Layout>
  );
};

export default TrackingPage;

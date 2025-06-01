import React, { useState, useEffect, useCallback } from "react";
import {
  Layout,
  Typography,
  Card,
  Spin,
  Empty,
  Button,
  Modal,
  Form,
  Input,
  Rate,
  message,
  List,
  Tag,
  Divider,
  Pagination,
  Descriptions,
  Tooltip,
  Space,
} from "antd";
import {
  HistoryOutlined,
  StarOutlined,
  MessageOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  UserOutlined,
  EnvironmentOutlined,
  DollarCircleOutlined,
  CalendarOutlined,
  RobotOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import { getOrders, getOrderReview, submitOrderReview } from "../services/api";
import { useAuth } from "../context/AuthContext";
import AppHeader from "../components/Layout/Header";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const ITEMS_PER_PAGE = 6; // Number of orders per page

const HistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState(null);
  const [existingReview, setExistingReview] = useState(null);
  const [reviewForm] = Form.useForm();
  const { currentUser } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

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

  const fetchCompletedOrders = useCallback(
    async (page = 1) => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        // API might return paginated data directly or all data that we paginate client-side.
        // Assuming API returns paginated data based on 'page' and 'limit' params.
        // The API spec for getOrders has page, limit, and status.
        const response = await getOrders(page, ITEMS_PER_PAGE, "COMPLETED");
        if (response && response.orders) {
          setOrders(response.orders);
          // Assuming the API response includes total count for pagination
          setTotalOrders(response.totalOrders || response.orders.length); // Fallback if totalOrders is not provided
        } else {
          setOrders([]);
          setTotalOrders(0);
        }
      } catch (error) {
        message.error(
          "Failed to fetch order history: " +
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
    fetchCompletedOrders(currentPage);
  }, [fetchCompletedOrders, currentPage]);

  const handleOpenReviewModal = async (order) => {
    setSelectedOrderForReview(order);
    reviewForm.resetFields();
    setExistingReview(null); // Reset existing review

    // Check if a review already exists for this order
    try {
      message.loading({
        content: "Loading review status...",
        key: "reviewStatus",
      });
      const review = await getOrderReview(order.orderId);
      if (review && review.rating) {
        // Assuming a review object is returned, or null/error if not found
        setExistingReview(review);
        reviewForm.setFieldsValue({
          rating: review.rating,
          comment: review.comment,
        });
      }
      message.destroy("reviewStatus");
    } catch (error) {
      message.destroy("reviewStatus");
      // If getOrderReview throws an error (e.g., 404 Not Found), it means no review exists.
      // We can silently ignore this error or log it if needed.
      console.warn(
        `No review found for order ${order.orderId} or failed to fetch:`,
        error.message
      );
    }
    setIsReviewModalVisible(true);
  };

  const handleCloseReviewModal = () => {
    setIsReviewModalVisible(false);
    setSelectedOrderForReview(null);
    setExistingReview(null);
    reviewForm.resetFields();
  };

  const handleSubmitReview = async (values) => {
    if (!selectedOrderForReview) return;
    setLoading(true);
    try {
      await submitOrderReview(
        selectedOrderForReview.orderId,
        values.rating,
        values.comment
      );
      message.success("Review submitted successfully!");
      handleCloseReviewModal();
      fetchCompletedOrders(currentPage); // Refresh orders to potentially update review status display
    } catch (error) {
      message.error(
        "Failed to submit review: " + (error.message || "Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderOrderStatusTag = (status) => {
    let color = "default";
    if (status === "COMPLETED") color = "success";
    else if (status === "CANCELLED") color = "error";
    else if (status === "DELIVERED") color = "blue";
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
          className="mr-2 text-blue-500"
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
            <HistoryOutlined className="mr-3" />
            Order History
          </Title>

          {loading && orders.length === 0 ? (
            <div className="text-center py-10">
              <Spin size="large" />
              <Paragraph className="mt-4 text-gray-600">
                Loading your order history...
              </Paragraph>
            </div>
          ) : !loading && orders.length === 0 ? (
            <div className="text-center py-10">
              <Empty description="You have no completed orders yet." />
              <Button
                type="primary"
                className="mt-6 bg-blue-600 hover:bg-blue-700"
                onClick={() => (window.location.href = "/create")}
              >
                Place Your First Order
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
                              Date
                            </>
                          }
                        >
                          {formatOrderDate(
                            order.createdAt ||
                              order.statusHistory?.find(
                                (s) => s.status === "COMPLETED"
                              )?.time
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
                              <UserOutlined className="mr-2" />
                              Recipient
                            </>
                          }
                        >
                          {order.deliveryAddress?.contactName || "N/A"}
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
                          icon={
                            order.reviewed ? (
                              <CheckCircleOutlined />
                            ) : (
                              <StarOutlined />
                            )
                          }
                          onClick={() => handleOpenReviewModal(order)}
                          className={
                            order.reviewed
                              ? "text-green-500 border-green-500 hover:!text-green-600 hover:!border-green-600"
                              : "text-blue-500 border-blue-500 hover:!text-blue-600 hover:!border-blue-600"
                          }
                        >
                          {order.reviewed ? "View Review" : "Submit Review"}
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

        {selectedOrderForReview && (
          <Modal
            title={
              <div className="flex items-center">
                {existingReview ? (
                  <MessageOutlined className="mr-2" />
                ) : (
                  <StarOutlined className="mr-2" />
                )}
                {existingReview
                  ? "Your Review for Order " + selectedOrderForReview.orderId
                  : "Submit Review for Order " + selectedOrderForReview.orderId}
              </div>
            }
            visible={isReviewModalVisible}
            onCancel={handleCloseReviewModal}
            footer={null} // Custom footer or no footer if just viewing
            destroyOnClose
            width={600}
          >
            <Spin spinning={loading}>
              {existingReview ? (
                <div>
                  <Title level={5}>Your Rating:</Title>
                  <Rate disabled defaultValue={existingReview.rating} />
                  <Title level={5} className="mt-4">
                    Your Comment:
                  </Title>
                  <Paragraph className="p-2 bg-gray-100 rounded">
                    {existingReview.comment || (
                      <Text type="secondary">No comment provided.</Text>
                    )}
                  </Paragraph>
                  <div className="text-right mt-6">
                    <Button onClick={handleCloseReviewModal}>Close</Button>
                  </div>
                </div>
              ) : (
                <Form
                  form={reviewForm}
                  layout="vertical"
                  onFinish={handleSubmitReview}
                >
                  <Form.Item
                    name="rating"
                    label="Your Rating"
                    rules={[
                      { required: true, message: "Please provide a rating!" },
                    ]}
                  >
                    <Rate allowHalf={false} />
                  </Form.Item>
                  <Form.Item name="comment" label="Your Comment (Optional)">
                    <Input.TextArea
                      rows={4}
                      placeholder="Tell us about your experience..."
                    />
                  </Form.Item>
                  <Form.Item className="text-right mt-4">
                    <Space>
                      <Button onClick={handleCloseReviewModal}>Cancel</Button>
                      <Button
                        type="primary"
                        htmlType="submit"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Submit Review
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              )}
            </Spin>
          </Modal>
        )}
      </Content>
    </Layout>
  );
};

export default HistoryPage;

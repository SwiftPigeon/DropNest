// mocks/handlers.js - MSW request handlers for DropNest API (Updated)
import { http, HttpResponse } from "msw";
import {
  mockUsers,
  mockAddresses,
  mockOrders,
  mockPayments,
  mockReviews,
  mockStations,
  deliveryTypes,
  speedOptions,
  generateJWTToken,
  generateOrderId,
  generateTrackingNumber,
  calculatePrice,
} from "./mockData";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

// Helper function to extract user ID from Authorization header
const getUserFromToken = (request) => {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  // In a real app, you'd decode the JWT token
  // For mock purposes, we'll just return the first user
  return mockUsers[0];
};

export const handlers = [
  // ========== Authentication Endpoints ==========

  // POST /api/auth/register
  http.post(`${API_BASE}/api/auth/register`, async ({ request }) => {
    const body = await request.json();
    const { email, password, phone, name } = body;

    // Check if user already exists
    const existingUser = mockUsers.find((user) => user.email === email);
    if (existingUser) {
      return HttpResponse.json(
        { message: "User already exists with this email" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!email || !password || !phone || !name) {
      return HttpResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // Create new user
    const newUser = {
      userId: `user-${Date.now()}`,
      email,
      name,
      phone,
      createdAt: new Date().toISOString(),
      totalOrders: 0,
      memberSince: new Date().toISOString(),
    };

    // Add to mock users (in real app, this would be saved to database)
    mockUsers.push({ ...newUser, password });

    // Return user data with token only (no refresh token)
    return HttpResponse.json(
      {
        ...newUser,
        token: generateJWTToken(),
      },
      { status: 201 }
    );
  }),

  // POST /api/auth/login
  http.post(`${API_BASE}/api/auth/login`, async ({ request }) => {
    const body = await request.json();
    const { email, password } = body;

    // Find user
    const user = mockUsers.find(
      (u) => u.email === email && u.password === password
    );
    if (!user) {
      return HttpResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Return user data without password and refresh token
    const { password: _, ...userWithoutPassword } = user;
    return HttpResponse.json({
      ...userWithoutPassword,
      token: generateJWTToken(),
    });
  }),

  // POST /api/auth/logout
  http.post(`${API_BASE}/api/auth/logout`, () => {
    return HttpResponse.json({ message: "Logged out successfully" });
  }),

  // ========== User Management Endpoints ==========

  // GET /api/users/profile
  http.get(`${API_BASE}/api/users/profile`, ({ request }) => {
    const user = getUserFromToken(request);
    if (!user) {
      return HttpResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const { password: _, ...userWithoutPassword } = user;
    return HttpResponse.json(userWithoutPassword);
  }),

  // PUT /api/users/profile
  http.put(`${API_BASE}/api/users/profile`, async ({ request }) => {
    const user = getUserFromToken(request);
    if (!user) {
      return HttpResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, phone } = body;

    // Update user data
    const updatedUser = { ...user, name, phone };

    // In real app, update in database
    const userIndex = mockUsers.findIndex((u) => u.userId === user.userId);
    if (userIndex !== -1) {
      mockUsers[userIndex] = { ...mockUsers[userIndex], name, phone };
    }

    const { password: _, ...userWithoutPassword } = updatedUser;
    return HttpResponse.json(userWithoutPassword);
  }),

  // PUT /api/users/password
  http.put(`${API_BASE}/api/users/password`, async ({ request }) => {
    const user = getUserFromToken(request);
    if (!user) {
      return HttpResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (user.password !== currentPassword) {
      return HttpResponse.json(
        { message: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Update password
    const userIndex = mockUsers.findIndex((u) => u.userId === user.userId);
    if (userIndex !== -1) {
      mockUsers[userIndex].password = newPassword;
    }

    return HttpResponse.json({ message: "Password changed successfully" });
  }),

  // ========== Address Management Endpoints ==========

  // GET /api/addresses
  http.get(`${API_BASE}/api/addresses`, ({ request }) => {
    const user = getUserFromToken(request);
    if (!user) {
      return HttpResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const userAddresses = mockAddresses.filter(
      (addr) => addr.userId === user.userId
    );
    return HttpResponse.json({ addresses: userAddresses });
  }),

  // POST /api/addresses
  http.post(`${API_BASE}/api/addresses`, async ({ request }) => {
    const user = getUserFromToken(request);
    if (!user) {
      return HttpResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const newAddress = {
      addressId: `addr-${Date.now()}`,
      userId: user.userId,
      ...body,
      // No isDefault field
    };

    mockAddresses.push(newAddress);
    return HttpResponse.json(newAddress, { status: 201 });
  }),

  // PUT /api/addresses/:id
  http.put(`${API_BASE}/api/addresses/:id`, async ({ request, params }) => {
    const user = getUserFromToken(request);
    if (!user) {
      return HttpResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();

    const addressIndex = mockAddresses.findIndex(
      (addr) => addr.addressId === id && addr.userId === user.userId
    );

    if (addressIndex === -1) {
      return HttpResponse.json(
        { message: "Address not found" },
        { status: 404 }
      );
    }

    mockAddresses[addressIndex] = { ...mockAddresses[addressIndex], ...body };
    return HttpResponse.json(mockAddresses[addressIndex]);
  }),

  // DELETE /api/addresses/:id
  http.delete(`${API_BASE}/api/addresses/:id`, ({ request, params }) => {
    const user = getUserFromToken(request);
    if (!user) {
      return HttpResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = params;
    const addressIndex = mockAddresses.findIndex(
      (addr) => addr.addressId === id && addr.userId === user.userId
    );

    if (addressIndex === -1) {
      return HttpResponse.json(
        { message: "Address not found" },
        { status: 404 }
      );
    }

    mockAddresses.splice(addressIndex, 1);
    return HttpResponse.json({ message: "Address deleted successfully" });
  }),

  // ========== Order Management Endpoints ==========

  // POST /api/orders/calculate
  http.post(`${API_BASE}/api/orders/calculate`, async ({ request }) => {
    const user = getUserFromToken(request);
    if (!user) {
      return HttpResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();

    try {
      const priceCalculation = calculatePrice(body, user.userId);
      return HttpResponse.json(priceCalculation);
    } catch (error) {
      return HttpResponse.json({ message: error.message }, { status: 400 });
    }
  }),

  // POST /api/orders
  http.post(`${API_BASE}/api/orders`, async ({ request }) => {
    const user = getUserFromToken(request);
    if (!user) {
      return HttpResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();

    try {
      const priceCalculation = calculatePrice(body, user.userId);
      const orderId = generateOrderId();
      const trackingNumber = generateTrackingNumber();

      const newOrder = {
        orderId,
        trackingNumber,
        userId: user.userId,
        status: "PENDING_PAYMENT",
        paymentAmount: priceCalculation.totalPrice,
        paymentDeadline: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes from now
        assignedStation: priceCalculation.assignedStation,
        ...body,
        pricing: {
          basePrice: priceCalculation.basePrice,
          distancePrice: priceCalculation.distancePrice,
          weightPrice: priceCalculation.weightPrice,
          speedMultiplier: priceCalculation.speedMultiplier,
          totalPrice: priceCalculation.totalPrice,
        },
        estimatedDeliveryTime: new Date(
          Date.now() + 60 * 60 * 1000
        ).toISOString(), // 1 hour from now
        createdAt: new Date().toISOString(),
        canCancel: true,
      };

      mockOrders.push(newOrder);

      return HttpResponse.json(
        {
          orderId,
          status: "PENDING_PAYMENT",
          paymentAmount: priceCalculation.totalPrice,
          paymentDeadline: newOrder.paymentDeadline,
          trackingNumber,
          pickupAddress: priceCalculation.pickupAddress,
          deliveryAddress: priceCalculation.deliveryAddress,
          assignedStation: priceCalculation.assignedStation,
        },
        { status: 201 }
      );
    } catch (error) {
      return HttpResponse.json({ message: error.message }, { status: 400 });
    }
  }),

  // GET /api/orders
  http.get(`${API_BASE}/api/orders`, ({ request }) => {
    const user = getUserFromToken(request);
    if (!user) {
      return HttpResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page")) || 1;
    const limit = parseInt(url.searchParams.get("limit")) || 10;
    const status = url.searchParams.get("status");

    let userOrders = mockOrders.filter((order) => order.userId === user.userId);

    if (status) {
      userOrders = userOrders.filter((order) => order.status === status);
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedOrders = userOrders.slice(startIndex, endIndex);

    const ordersWithReviewStatus = paginatedOrders.map((order) => {
      const hasReview = mockReviews.some(
        (review) =>
          review.orderId === order.orderId && review.userId === user.userId
      );
      return {
        ...order,
        reviewed: hasReview,
      };
    });

    return HttpResponse.json({
      orders: ordersWithReviewStatus, // 替换原来的 paginatedOrders
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(userOrders.length / limit),
        totalItems: userOrders.length,
        itemsPerPage: limit,
      },
    });
  }),

  // GET /api/orders/:id
  http.get(`${API_BASE}/api/orders/:id`, ({ request, params }) => {
    const user = getUserFromToken(request);
    if (!user) {
      return HttpResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = params;
    const order = mockOrders.find(
      (o) => o.orderId === id && o.userId === user.userId
    );

    if (!order) {
      return HttpResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return HttpResponse.json(order);
  }),

  // PUT /api/orders/:id/cancel
  http.put(`${API_BASE}/api/orders/:id/cancel`, async ({ request, params }) => {
    const user = getUserFromToken(request);
    if (!user) {
      return HttpResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { reason } = body;

    const orderIndex = mockOrders.findIndex(
      (o) => o.orderId === id && o.userId === user.userId
    );

    if (orderIndex === -1) {
      return HttpResponse.json({ message: "Order not found" }, { status: 404 });
    }

    const order = mockOrders[orderIndex];

    if (!order.canCancel) {
      return HttpResponse.json(
        { message: "Order cannot be cancelled at this stage" },
        { status: 400 }
      );
    }

    mockOrders[orderIndex] = {
      ...order,
      status: "CANCELLED",
      cancelReason: reason,
      canCancel: false,
    };

    return HttpResponse.json({ message: "Order cancelled successfully" });
  }),

  // PUT /api/orders/:id/confirm
  http.put(
    `${API_BASE}/api/orders/:id/confirm`,
    async ({ request, params }) => {
      const user = getUserFromToken(request);
      if (!user) {
        return HttpResponse.json(
          { message: "Authentication required" },
          { status: 401 }
        );
      }

      const { id } = params;
      const body = await request.json();
      const { confirmed, signatureName } = body;

      const orderIndex = mockOrders.findIndex(
        (o) => o.orderId === id && o.userId === user.userId
      );

      if (orderIndex === -1) {
        return HttpResponse.json(
          { message: "Order not found" },
          { status: 404 }
        );
      }

      const order = mockOrders[orderIndex];

      if (order.status !== "DELIVERED") {
        return HttpResponse.json(
          { message: "Order must be delivered before confirmation" },
          { status: 400 }
        );
      }

      mockOrders[orderIndex] = {
        ...order,
        status: "COMPLETED",
        signatureName,
        completedAt: new Date().toISOString(),
      };

      return HttpResponse.json({ message: "Delivery confirmed successfully" });
    }
  ),

  // GET /api/orders/:id/tracking
  http.get(`${API_BASE}/api/orders/:id/tracking`, ({ request, params }) => {
    const user = getUserFromToken(request);
    if (!user) {
      return HttpResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = params;
    const order = mockOrders.find(
      (o) => o.orderId === id && o.userId === user.userId
    );

    if (!order) {
      return HttpResponse.json({ message: "Order not found" }, { status: 404 });
    }

    if (!["PICKING_UP", "DELIVERING"].includes(order.status)) {
      return HttpResponse.json(
        { message: "Tracking not available for this order status" },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      orderId: order.orderId,
      trackingNumber: order.trackingNumber,
      deviceLocation: {
        latitude: 37.775 + (Math.random() - 0.5) * 0.01,
        longitude: -122.4192 + (Math.random() - 0.5) * 0.01,
        altitude: 50,
        speed: 25,
        heading: 270,
        lastUpdated: new Date().toISOString(),
      },
      route: {
        origin: {
          name: order.assignedStation.name,
          latitude: order.assignedStation.latitude || 37.7749,
          longitude: order.assignedStation.longitude || -122.4194,
        },
        pickup: {
          addressId: order.pickupAddressId,
          address: order.pickupAddress?.address || "456 Mission St",
          latitude: order.pickupAddress?.latitude || 37.7751,
          longitude: order.pickupAddress?.longitude || -122.4193,
        },
        delivery: {
          addressId: order.deliveryAddressId,
          address: order.deliveryAddress?.address || "123 Market St",
          latitude: order.deliveryAddress?.latitude || 37.7749,
          longitude: order.deliveryAddress?.longitude || -122.4194,
        },
        currentSegment:
          order.status === "PICKING_UP"
            ? "STATION_TO_PICKUP"
            : "PICKUP_TO_DELIVERY",
        completedDistance: 1.5,
        totalDistance: 2.0,
      },
      estimatedArrival: "10 minutes",
      estimatedArrivalTime: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      distanceRemaining: 0.5,
      batteryLevel: 85,
      weatherConditions: "Clear",
      obstacles: [],
    });
  }),

  // ========== Payment Endpoints ==========

  // POST /api/payments/pay
  http.post(`${API_BASE}/api/payments/pay`, async ({ request }) => {
    const user = getUserFromToken(request);
    if (!user) {
      return HttpResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { orderId, paymentMethod } = body;

    const orderIndex = mockOrders.findIndex(
      (o) => o.orderId === orderId && o.userId === user.userId
    );

    if (orderIndex === -1) {
      return HttpResponse.json({ message: "Order not found" }, { status: 404 });
    }

    const order = mockOrders[orderIndex];

    if (order.status !== "PENDING_PAYMENT") {
      return HttpResponse.json(
        { message: "Order is not pending payment" },
        { status: 400 }
      );
    }

    // Update order status
    mockOrders[orderIndex] = {
      ...order,
      status: "PAID",
      paidAt: new Date().toISOString(),
    };

    // Create payment record
    const payment = {
      paymentId: `PAY-${Date.now()}`,
      orderId,
      status: "SUCCESS",
      amount: order.paymentAmount,
      paymentMethod,
      transactionId: `TXN-${Date.now()}`,
      paidAt: new Date().toISOString(),
    };

    mockPayments.push(payment);

    return HttpResponse.json(payment);
  }),

  // GET /api/payments/history
  http.get(`${API_BASE}/api/payments/history`, ({ request }) => {
    const user = getUserFromToken(request);
    if (!user) {
      return HttpResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page")) || 1;
    const limit = parseInt(url.searchParams.get("limit")) || 10;

    // Get user's orders to find related payments
    const userOrderIds = mockOrders
      .filter((order) => order.userId === user.userId)
      .map((order) => order.orderId);

    const userPayments = mockPayments.filter((payment) =>
      userOrderIds.includes(payment.orderId)
    );

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPayments = userPayments.slice(startIndex, endIndex);

    return HttpResponse.json({
      payments: paginatedPayments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(userPayments.length / limit),
        totalItems: userPayments.length,
        itemsPerPage: limit,
      },
    });
  }),

  // ========== Review Endpoints ==========

  // POST /api/orders/:id/review
  http.post(
    `${API_BASE}/api/orders/:id/review`,
    async ({ request, params }) => {
      const user = getUserFromToken(request);
      if (!user) {
        return HttpResponse.json(
          { message: "Authentication required" },
          { status: 401 }
        );
      }

      const { id } = params;
      const body = await request.json();
      const { rating, comment } = body;

      const order = mockOrders.find(
        (o) => o.orderId === id && o.userId === user.userId
      );

      if (!order) {
        return HttpResponse.json(
          { message: "Order not found" },
          { status: 404 }
        );
      }

      if (order.status !== "COMPLETED") {
        return HttpResponse.json(
          { message: "Can only review completed orders" },
          { status: 400 }
        );
      }

      const review = {
        reviewId: `REV-${Date.now()}`,
        orderId: id,
        userId: user.userId,
        rating,
        comment,
        createdAt: new Date().toISOString(),
      };

      mockReviews.push(review);

      return HttpResponse.json(review, { status: 201 });
    }
  ),

  // GET /api/orders/:id/review
  http.get(`${API_BASE}/api/orders/:id/review`, ({ request, params }) => {
    const user = getUserFromToken(request);
    if (!user) {
      return HttpResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = params;
    const review = mockReviews.find(
      (r) => r.orderId === id && r.userId === user.userId
    );

    if (!review) {
      return HttpResponse.json(
        { message: "Review not found" },
        { status: 404 }
      );
    }

    return HttpResponse.json(review);
  }),

  // ========== Configuration Endpoints ==========

  // GET /api/config/delivery-types
  http.get(`${API_BASE}/api/config/delivery-types`, () => {
    return HttpResponse.json(deliveryTypes);
  }),

  // GET /api/config/speed-options
  http.get(`${API_BASE}/api/config/speed-options`, () => {
    return HttpResponse.json(speedOptions);
  }),
];

export default handlers;

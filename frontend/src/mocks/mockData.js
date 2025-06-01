// mocks/mockData.js - Mock data for DropNest API (Updated)
import { v4 as uuidv4 } from "uuid";

// Helper function to generate UUIDs for IDs
const generateId = () => uuidv4();

// Mock Users
export const mockUsers = [
  {
    userId: "550e8400-e29b-41d4-a716-446655440000",
    email: "john.doe@example.com",
    password: "password123", // In real app, this would be hashed
    name: "John Doe",
    phone: "415-555-0123",
    createdAt: "2024-01-15T08:30:00Z",
    totalOrders: 15,
    memberSince: "2024-01-15T08:30:00Z",
  },
  {
    userId: "550e8400-e29b-41d4-a716-446655440001",
    email: "jane.smith@example.com",
    password: "password456",
    name: "Jane Smith",
    phone: "415-555-0124",
    createdAt: "2024-02-20T10:15:00Z",
    totalOrders: 8,
    memberSince: "2024-02-20T10:15:00Z",
  },
];

// Mock Addresses (removed isDefault field)
export const mockAddresses = [
  {
    addressId: "addr-001",
    userId: "550e8400-e29b-41d4-a716-446655440000",
    label: "Home",
    address: "123 Market St",
    city: "San Francisco",
    zipCode: "94103",
    latitude: 37.7749,
    longitude: -122.4194,
    contactName: "John Doe",
    contactPhone: "415-555-0123",
  },
  {
    addressId: "addr-002",
    userId: "550e8400-e29b-41d4-a716-446655440000",
    label: "Office",
    address: "456 Mission St",
    city: "San Francisco",
    zipCode: "94105",
    latitude: 37.7751,
    longitude: -122.4193,
    contactName: "John Doe",
    contactPhone: "415-555-0123",
  },
];

// Mock Orders (updated to use addressId)
export const mockOrders = [
  {
    orderId: "ORD-20240524-001",
    userId: "550e8400-e29b-41d4-a716-446655440000",
    trackingNumber: "TRK-12345",
    status: "DELIVERING",
    statusHistory: [
      {
        status: "PENDING_PAYMENT",
        time: "2024-05-24T10:00:00Z",
        description: "Order created, waiting for payment",
      },
      {
        status: "PAID",
        time: "2024-05-24T10:05:00Z",
        description: "Payment confirmed",
      },
      {
        status: "PREPARING",
        time: "2024-05-24T10:06:00Z",
        description: "Station preparing drone for dispatch",
      },
      {
        status: "PICKING_UP",
        time: "2024-05-24T10:10:00Z",
        description: "Drone heading to pickup location",
      },
      {
        status: "PICKED_UP",
        time: "2024-05-24T10:25:00Z",
        description: "Package picked up successfully",
      },
      {
        status: "DELIVERING",
        time: "2024-05-24T10:26:00Z",
        description: "On the way to delivery address",
      },
    ],
    device: {
      type: "DRONE",
      id: "DRONE-SF-023",
      model: "DJI Delivery Pro",
      currentLocation: {
        latitude: 37.775,
        longitude: -122.4192,
      },
    },
    pickupAddressId: "addr-002",
    pickupAddress: {
      addressId: "addr-002",
      address: "456 Mission St, San Francisco",
      contactName: "John Doe",
      contactPhone: "415-555-0123",
      latitude: 37.7751,
      longitude: -122.4193,
    },
    deliveryAddressId: "addr-001",
    deliveryAddress: {
      addressId: "addr-001",
      address: "123 Market St, San Francisco",
      contactName: "John Doe",
      contactPhone: "415-555-0123",
      latitude: 37.7749,
      longitude: -122.4194,
    },
    items: [
      {
        name: "Document Package",
        quantity: 1,
        weight: 2.5,
        volume: 5,
      },
    ],
    pricing: {
      basePrice: 12.0,
      distancePrice: 6.0,
      weightPrice: 0.0,
      speedMultiplier: 1.2,
      totalPrice: 21.6,
    },
    deliveryType: "DRONE",
    speed: "STANDARD",
    estimatedDeliveryTime: "2024-05-24T10:50:00Z",
    requireSignature: true,
    notes: "Fragile items, please handle with care",
    canCancel: false,
    cancelReason: "Already picked up",
    createdAt: "2024-05-24T10:00:00Z",
    assignedStation: {
      stationId: "station-1",
      name: "SkyHub Central",
      address: "789 Howard St, San Francisco",
      latitude: 37.7849,
      longitude: -122.4094,
    },
  },
  {
    orderId: "ORD-20240523-001",
    userId: "550e8400-e29b-41d4-a716-446655440000",
    trackingNumber: "TRK-11111",
    status: "COMPLETED",
    statusHistory: [
      {
        status: "PENDING_PAYMENT",
        time: "2024-05-23T14:00:00Z",
        description: "Order created, waiting for payment",
      },
      {
        status: "PAID",
        time: "2024-05-23T14:05:00Z",
        description: "Payment confirmed",
      },
      {
        status: "PREPARING",
        time: "2024-05-23T14:06:00Z",
        description: "Station preparing robot for dispatch",
      },
      {
        status: "PICKING_UP",
        time: "2024-05-23T14:15:00Z",
        description: "Robot heading to pickup location",
      },
      {
        status: "PICKED_UP",
        time: "2024-05-23T14:45:00Z",
        description: "Package picked up successfully",
      },
      {
        status: "DELIVERING",
        time: "2024-05-23T14:46:00Z",
        description: "On the way to delivery address",
      },
      {
        status: "DELIVERED",
        time: "2024-05-23T15:30:00Z",
        description: "Package delivered successfully",
      },
      {
        status: "COMPLETED",
        time: "2024-05-23T15:35:00Z",
        description: "Delivery confirmed by recipient",
      },
    ],
    pickupAddressId: "addr-001",
    pickupAddress: {
      addressId: "addr-001",
      address: "123 Market St, San Francisco",
      contactName: "John Doe",
      contactPhone: "415-555-0123",
      latitude: 37.7749,
      longitude: -122.4194,
    },
    deliveryAddressId: "addr-002",
    deliveryAddress: {
      addressId: "addr-002",
      address: "456 Mission St, San Francisco",
      contactName: "John Doe",
      contactPhone: "415-555-0123",
      latitude: 37.7751,
      longitude: -122.4193,
    },
    items: [
      {
        name: "Electronics Package",
        quantity: 1,
        weight: 8.5,
        volume: 15,
      },
    ],
    pricing: {
      basePrice: 8.0,
      distancePrice: 4.0,
      weightPrice: 0.0,
      speedMultiplier: 1.0,
      totalPrice: 12.0,
    },
    deliveryType: "ROBOT",
    speed: "BASIC",
    requireSignature: true,
    notes: "Electronics package",
    canCancel: false,
    createdAt: "2024-05-23T14:00:00Z",
    assignedStation: {
      stationId: "station-2",
      name: "SkyHub North",
      address: "456 Market St, San Francisco",
    },
  },

  {
    orderId: "ORD-20240522-001",
    userId: "550e8400-e29b-41d4-a716-446655440000",
    trackingNumber: "TRK-22222",
    status: "COMPLETED",
    statusHistory: [
      {
        status: "PENDING_PAYMENT",
        time: "2024-05-22T09:00:00Z",
        description: "Order created, waiting for payment",
      },
      {
        status: "PAID",
        time: "2024-05-22T09:03:00Z",
        description: "Payment confirmed",
      },
      {
        status: "PREPARING",
        time: "2024-05-22T09:05:00Z",
        description: "Station preparing drone for dispatch",
      },
      {
        status: "PICKING_UP",
        time: "2024-05-22T09:10:00Z",
        description: "Drone heading to pickup location",
      },
      {
        status: "PICKED_UP",
        time: "2024-05-22T09:25:00Z",
        description: "Package picked up successfully",
      },
      {
        status: "DELIVERING",
        time: "2024-05-22T09:26:00Z",
        description: "On the way to delivery address",
      },
      {
        status: "DELIVERED",
        time: "2024-05-22T09:45:00Z",
        description: "Package delivered successfully",
      },
      {
        status: "COMPLETED",
        time: "2024-05-22T09:50:00Z",
        description: "Delivery confirmed by recipient",
      },
    ],
    pickupAddressId: "addr-002",
    pickupAddress: {
      addressId: "addr-002",
      address: "456 Mission St, San Francisco",
      contactName: "John Doe",
      contactPhone: "415-555-0123",
      latitude: 37.7751,
      longitude: -122.4193,
    },
    deliveryAddressId: "addr-001",
    deliveryAddress: {
      addressId: "addr-001",
      address: "123 Market St, San Francisco",
      contactName: "John Doe",
      contactPhone: "415-555-0123",
      latitude: 37.7749,
      longitude: -122.4194,
    },
    items: [
      {
        name: "Food Package",
        quantity: 1,
        weight: 1.2,
        volume: 3,
      },
    ],
    pricing: {
      basePrice: 12.0,
      distancePrice: 6.0,
      weightPrice: 0.0,
      speedMultiplier: 1.5,
      totalPrice: 27.0,
    },
    deliveryType: "DRONE",
    speed: "EXPRESS",
    requireSignature: false,
    notes: "Food delivery",
    canCancel: false,
    createdAt: "2024-05-22T09:00:00Z",
    assignedStation: {
      stationId: "station-1",
      name: "SkyHub Central",
      address: "789 Howard St, San Francisco",
    },
  },

  {
    orderId: "ORD-20240521-001",
    userId: "550e8400-e29b-41d4-a716-446655440000",
    trackingNumber: "TRK-33333",
    status: "COMPLETED",
    statusHistory: [
      {
        status: "PENDING_PAYMENT",
        time: "2024-05-21T16:00:00Z",
        description: "Order created, waiting for payment",
      },
      {
        status: "PAID",
        time: "2024-05-21T16:02:00Z",
        description: "Payment confirmed",
      },
      {
        status: "PREPARING",
        time: "2024-05-21T16:05:00Z",
        description: "Station preparing drone for dispatch",
      },
      {
        status: "PICKING_UP",
        time: "2024-05-21T16:10:00Z",
        description: "Drone heading to pickup location",
      },
      {
        status: "PICKED_UP",
        time: "2024-05-21T16:25:00Z",
        description: "Package picked up successfully",
      },
      {
        status: "DELIVERING",
        time: "2024-05-21T16:26:00Z",
        description: "On the way to delivery address",
      },
      {
        status: "DELIVERED",
        time: "2024-05-21T17:10:00Z",
        description: "Package delivered successfully",
      },
      {
        status: "COMPLETED",
        time: "2024-05-21T17:15:00Z",
        description: "Delivery confirmed by recipient",
      },
    ],
    pickupAddressId: "addr-001",
    pickupAddress: {
      addressId: "addr-001",
      address: "123 Market St, San Francisco",
      contactName: "John Doe",
      contactPhone: "415-555-0123",
      latitude: 37.7749,
      longitude: -122.4194,
    },
    deliveryAddressId: "addr-002",
    deliveryAddress: {
      addressId: "addr-002",
      address: "456 Mission St, San Francisco",
      contactName: "John Doe",
      contactPhone: "415-555-0123",
      latitude: 37.7751,
      longitude: -122.4193,
    },
    items: [
      {
        name: "Book Package",
        quantity: 3,
        weight: 2.8,
        volume: 8,
      },
    ],
    pricing: {
      basePrice: 12.0,
      distancePrice: 6.0,
      weightPrice: 0.0,
      speedMultiplier: 1.2,
      totalPrice: 21.6,
    },
    deliveryType: "DRONE",
    speed: "STANDARD",
    requireSignature: true,
    notes: "Handle with care - books",
    canCancel: false,
    createdAt: "2024-05-21T16:00:00Z",
    assignedStation: {
      stationId: "station-3",
      name: "SkyHub South",
      address: "123 3rd St, San Francisco",
    },
  },
];

// Mock Stations (for order assignment)
export const mockStations = [
  {
    stationId: "station-1",
    name: "SkyHub Central",
    address: "789 Howard St, San Francisco",
    latitude: 37.7849,
    longitude: -122.4094,
    activeRobots: 5,
    activeDrones: 8,
    maxCapacity: {
      robots: 10,
      drones: 15,
    },
  },
  {
    stationId: "station-2",
    name: "SkyHub North",
    address: "456 Market St, San Francisco",
    latitude: 37.7949,
    longitude: -122.3994,
    activeRobots: 3,
    activeDrones: 6,
    maxCapacity: {
      robots: 8,
      drones: 12,
    },
  },
  {
    stationId: "station-3",
    name: "SkyHub South",
    address: "123 3rd St, San Francisco",
    latitude: 37.7649,
    longitude: -122.4294,
    activeRobots: 7,
    activeDrones: 4,
    maxCapacity: {
      robots: 12,
      drones: 10,
    },
  },
];

// Mock Payment History
export const mockPayments = [
  {
    paymentId: "PAY-123456",
    orderId: "ORD-20240524-001",
    status: "SUCCESS",
    amount: 21.6,
    paymentMethod: "CREDIT_CARD",
    transactionId: "TXN-789012",
    paidAt: "2024-05-24T10:05:00Z",
  },
];

// Mock Reviews
// Mock Reviews
export const mockReviews = [
  {
    reviewId: "REV-001",
    orderId: "ORD-20240523-001", // 已评价的订单
    userId: "550e8400-e29b-41d4-a716-446655440000",
    rating: 4,
    comment:
      "Good service, package arrived safely but took longer than expected.",
    createdAt: "2024-05-23T16:00:00Z",
  },
  {
    reviewId: "REV-002",
    orderId: "ORD-20240521-001", // 已评价的订单
    userId: "550e8400-e29b-41d4-a716-446655440000",
    rating: 5,
    comment: "Excellent service! Fast delivery and careful handling.",
    createdAt: "2024-05-21T17:30:00Z",
  },
  // ORD-20240522-001 没有评价 - 测试未评价状态
];

// Configuration Data
export const deliveryTypes = {
  deliveryTypes: [
    {
      type: "ROBOT",
      name: "Ground Robot",
      maxWeight: 30,
      maxVolume: 100,
      basePrice: 8.0,
      pricePerKm: 2.0,
      averageSpeed: 15,
      features: [
        "Heavy loads up to 30kg",
        "Ground level delivery",
        "Weather resistant",
        "Lower cost option",
      ],
    },
    {
      type: "DRONE",
      name: "Aerial Drone",
      maxWeight: 5,
      maxVolume: 20,
      basePrice: 12.0,
      pricePerKm: 3.0,
      averageSpeed: 40,
      features: [
        "Fast aerial delivery",
        "Direct route",
        "Light packages only",
        "Quick service",
      ],
    },
  ],
};

export const speedOptions = {
  speedOptions: [
    {
      type: "BASIC",
      name: "Basic Delivery",
      description: "Standard delivery within 2 hours",
      estimatedTime: "2 hours",
      priceMultiplier: 1.0,
    },
    {
      type: "STANDARD",
      name: "Standard Delivery",
      description: "Faster delivery within 1 hour",
      estimatedTime: "1 hour",
      priceMultiplier: 1.2,
    },
    {
      type: "EXPRESS",
      name: "Express Delivery",
      description: "Priority delivery within 30 minutes",
      estimatedTime: "30 minutes",
      priceMultiplier: 1.5,
    },
  ],
};

// Helper functions for generating mock data
export const generateJWTToken = () => {
  return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
};

// Removed generateRefreshToken function

export const generateOrderId = () => {
  const date = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const sequence = Math.floor(Math.random() * 999) + 1;
  return `ORD-${date}-${sequence.toString().padStart(3, "0")}`;
};

export const generateTrackingNumber = () => {
  return `TRK-${Math.floor(Math.random() * 99999) + 10000}`;
};

// Helper function to find address by ID
const findAddressById = (addressId, userId) => {
  return mockAddresses.find(
    (addr) => addr.addressId === addressId && addr.userId === userId
  );
};

// Calculate price based on order parameters (updated to use addressId)
export const calculatePrice = (orderData, userId) => {
  const {
    pickupAddressId,
    deliveryAddressId,
    deliveryType: deliveryTypeCode,
    speed: speedCode,
  } = orderData;

  const deliveryType = deliveryTypes.deliveryTypes.find(
    (dt) => dt.type === deliveryTypeCode
  );
  const speedOption = speedOptions.speedOptions.find(
    (so) => so.type === speedCode
  );

  if (!deliveryType || !speedOption) {
    throw new Error("Invalid delivery type or speed option");
  }

  // Find addresses by ID
  const pickupAddress = findAddressById(pickupAddressId, userId);
  const deliveryAddress = findAddressById(deliveryAddressId, userId);

  if (!pickupAddress || !deliveryAddress) {
    throw new Error("Invalid pickup or delivery address");
  }

  // Calculate distance (simplified - in real app would use actual distance calculation)
  const distance = Math.random() * 5 + 1; // Random distance between 1-6 km

  const basePrice = deliveryType.basePrice;
  const distancePrice = distance * deliveryType.pricePerKm;
  const weightPrice = 0; // Simplified - no extra weight charges for now
  const speedMultiplier = speedOption.priceMultiplier;
  const totalPrice =
    (basePrice + distancePrice + weightPrice) * speedMultiplier;

  return {
    basePrice,
    distancePrice,
    weightPrice,
    speedMultiplier,
    totalPrice: Math.round(totalPrice * 100) / 100,
    estimatedTime: speedOption.estimatedTime,
    distance: Math.round(distance * 100) / 100,
    pickupAddress: {
      addressId: pickupAddress.addressId,
      address: pickupAddress.address,
      contactName: pickupAddress.contactName,
      contactPhone: pickupAddress.contactPhone,
      latitude: pickupAddress.latitude,
      longitude: pickupAddress.longitude,
    },
    deliveryAddress: {
      addressId: deliveryAddress.addressId,
      address: deliveryAddress.address,
      contactName: deliveryAddress.contactName,
      contactPhone: deliveryAddress.contactPhone,
      latitude: deliveryAddress.latitude,
      longitude: deliveryAddress.longitude,
    },
    assignedStation:
      mockStations[Math.floor(Math.random() * mockStations.length)],
    priceBreakdown: {
      base: `$${basePrice.toFixed(2)} (${deliveryType.name} base price)`,
      distance: `$${distancePrice.toFixed(2)} (${distance.toFixed(1)}km × $${
        deliveryType.pricePerKm
      }/km)`,
      weight: `$${weightPrice.toFixed(2)} (0-5kg free)`,
      speed: `×${speedMultiplier} (${speedOption.name})`,
      total: `$${totalPrice.toFixed(2)}`,
    },
  };
};

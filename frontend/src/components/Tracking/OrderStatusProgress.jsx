// src/components/Tracking/OrderStatusProgress.jsx
import React from "react";
import { Steps, Grid, Typography } from "antd";
import {
  DollarCircleOutlined,
  SettingOutlined,
  ShopOutlined, // Icon for going to pickup location
  InboxOutlined, // Icon for package picked up
  RocketOutlined, // Icon for delivering (could be RobotOutlined too)
  CheckCircleOutlined,
  // Fallback/Error icons if needed
  // ExclamationCircleOutlined, // For error status
  // ClockCircleOutlined, // For waiting status if not covered
} from "@ant-design/icons";

const { useBreakpoint } = Grid;
const { Text } = Typography;

// Define the standard progression of order statuses
const PROGRESS_STEPS_CONFIG = [
  {
    key: "PAID",
    title: "Payment Confirmed",
    icon: <DollarCircleOutlined />,
    description: "Payment processed.",
  },
  {
    key: "PREPARING",
    title: "Order Preparing",
    icon: <SettingOutlined />,
    description: "Preparing for dispatch.",
  },
  {
    key: "PICKING_UP",
    title: "Out for Pickup",
    icon: <ShopOutlined />, // Represents device going TO the pickup address
    description: "Device en route to pickup.",
  },
  {
    key: "PICKED_UP",
    title: "Package Picked Up",
    icon: <InboxOutlined />, // Package is now secured
    description: "Package collected.",
  },
  {
    key: "DELIVERING",
    title: "Out for Delivery",
    icon: <RocketOutlined />, // Represents device delivering TO the final address
    description: "On the way to you.",
  },
  {
    key: "DELIVERED",
    title: "Package Delivered",
    icon: <CheckCircleOutlined />,
    description: "Successfully delivered.",
  },
];

const OrderStatusProgress = ({ currentStatus, statusHistory = [] }) => {
  const screens = useBreakpoint();
  const direction = screens.md ? "horizontal" : "vertical"; // Horizontal on md and up, vertical below

  let calculatedCurrentStep = 0; // Ant Design's `current` prop for Steps (0-indexed)
  let calculatedStepsOverallStatus; // Ant Design's `status` prop for the <Steps> component ('error', 'process', etc.)

  const currentStatusIndexInConfig = PROGRESS_STEPS_CONFIG.findIndex(
    (step) => step.key === currentStatus
  );

  if (currentStatus === "COMPLETED") {
    // If order is fully COMPLETED, all defined steps are marked as 'finish'.
    calculatedCurrentStep = PROGRESS_STEPS_CONFIG.length; // Setting current beyond the last index makes all 'finish'
    calculatedStepsOverallStatus = "finish";
  } else if (currentStatusIndexInConfig !== -1) {
    // Current status is one of the defined progress steps
    calculatedCurrentStep = currentStatusIndexInConfig;
    calculatedStepsOverallStatus = "process"; // The current step is 'process'
  } else if (currentStatus === "CANCELLED" || currentStatus === "FAILED") {
    // Order was cancelled or failed. Find the last valid step from history.
    let lastAchievedStepIndex = -1;
    if (statusHistory && statusHistory.length > 0) {
      // Iterate from newest to oldest history entry
      for (const historyEntry of [...statusHistory].reverse()) {
        const idx = PROGRESS_STEPS_CONFIG.findIndex(
          (step) => step.key === historyEntry.status
        );
        if (idx !== -1) {
          lastAchievedStepIndex = idx;
          break;
        }
      }
    }
    // The 'current' step for Steps component is where it failed or was active during cancellation.
    calculatedCurrentStep = lastAchievedStepIndex;
    // If no relevant history matched (e.g., cancelled before 'PAID'), default to the first step being in error.
    if (lastAchievedStepIndex === -1) {
      calculatedCurrentStep = 0;
    }
    calculatedStepsOverallStatus = "error"; // Mark this step/overall progress as error
  } else {
    // Fallback for unknown statuses or statuses before 'PAID' (e.g., PENDING_PAYMENT)
    // We'll show 'PAID' as the current step, implying it's the next one to be processed.
    calculatedCurrentStep = 0;
    // If currentStatus is PENDING_PAYMENT, the first step (PAID) is 'process'
    // This could also be 'wait' if calculatedCurrentStep = -1, but 0 makes 'PAID' active.
    calculatedStepsOverallStatus = "process";
  }

  return (
    <div className="py-4">
      {" "}
      {/* Tailwind for padding */}
      <Steps
        current={calculatedCurrentStep}
        status={calculatedStepsOverallStatus}
        direction={direction}
        labelPlacement={direction === "horizontal" ? "vertical" : "horizontal"} // Adjust label placement for readability
        responsive // Antd's built-in responsiveness
      >
        {PROGRESS_STEPS_CONFIG.map((step, index) => (
          <Steps.Step
            key={step.key}
            title={
              <Text className={direction === "vertical" ? "text-sm" : ""}>
                {step.title}
              </Text>
            }
            icon={step.icon}
            description={
              direction === "horizontal" ? (
                <Text type="secondary" className="text-xs">
                  {step.description}
                </Text>
              ) : null
            } // Show description only in horizontal mode for brevity
          />
        ))}
      </Steps>
    </div>
  );
};

export default OrderStatusProgress;

// import React from "react";
// import { Layout, Menu, Typography, Button } from "antd";

// const { Header } = Layout;
// const { Title } = Typography;

// const AppHeader = ({
//   navBg,
//   menuTheme,
//   scrollToSection,
//   onSignUp,
//   onLogin,
// }) => {
//   // 导航菜单项配置 - Features和Pricing
//   const menuItems = [
//     { key: "features", label: "Features" },
//     { key: "pricing", label: "Pricing" },
//   ];

//   return (
//     <Header
//       className={`fixed w-full z-50 transition-all duration-300 ease-in-out shadow-md ${navBg}`}
//       style={{ padding: "0 50px" }}
//     >
//       <div className="flex items-center justify-between h-full">
//         {/* 左侧：Logo + DropNest + 导航菜单 */}
//         <div className="flex items-center">
//           {/* Logo */}
//           <img
//             src="../images/SwiftPigeonLogo.png"
//             alt="DropNest Logo"
//             className="h-10 w-10 mr-4 transition-opacity duration-300 rounded-md"
//           />

//           {/* DropNest 标题 */}
//           <Title
//             level={3}
//             className={`!mb-0 mr-8 transition-colors duration-300 ${
//               menuTheme === "dark" ? "!text-white" : "!text-neutral-800"
//             }`}
//           >
//             DropNest
//           </Title>

//           {/* 导航菜单 */}
//           <Menu
//             theme={menuTheme}
//             mode="horizontal"
//             items={menuItems.map((item) => ({
//               key: item.key,
//               label: item.label,
//               className: `${
//                 menuTheme === "dark"
//                   ? "hover:!bg-blue-700"
//                   : "hover:!bg-gray-200"
//               }`,
//               onClick: () => {
//                 if (item.key === "features" || item.key === "pricing") {
//                   scrollToSection(item.key + "-section");
//                 }
//               },
//             }))}
//             className="bg-transparent border-b-0"
//             style={{ lineHeight: "64px" }}
//           />
//         </div>

//         {/* 右侧：Sign Up + Log In 按钮 */}
//         <div className="flex items-center gap-3">
//           <Button
//             type="text"
//             size="large"
//             className={`font-medium transition-all duration-300 ${
//               menuTheme === "dark"
//                 ? "text-white hover:!text-blue-300 hover:!bg-blue-700/20"
//                 : "text-neutral-800 hover:!text-blue-600 hover:!bg-gray-200"
//             }`}
//             onClick={onSignUp}
//           >
//             Sign Up
//           </Button>
//           <Button
//             type="text"
//             size="large"
//             className={`font-medium transition-all duration-300 ${
//               menuTheme === "dark"
//                 ? "text-white border border-current hover:!text-blue-300 hover:!border-blue-300 hover:!bg-blue-700/20"
//                 : "text-neutral-800 border border-current hover:!text-blue-600 hover:!border-blue-600 hover:!bg-gray-200"
//             }`}
//             onClick={onLogin}
//           >
//             Log In
//           </Button>
//         </div>
//       </div>
//     </Header>
//   );
// };

// export default AppHeader;
import React from "react";
import {
  Layout,
  Menu,
  Typography,
  Button,
  Dropdown,
  Avatar,
  Space,
} from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons"; // Optional: for icons in dropdown
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Assuming this path is correct

const { Header } = Layout;
const { Title } = Typography;

const AppHeader = ({
  // Props for unauthenticated state
  navBg,
  menuTheme,
  scrollToSection,
  onSignUp,
  onLogin,
}) => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  // --- Unauthenticated State Configuration ---
  const unauthMenuItems = [
    { key: "features", label: "Features", sectionId: "features-section" },
    { key: "pricing", label: "Pricing", sectionId: "pricing-section" },
  ];

  // --- Authenticated State Configuration ---
  const authMenuItems = [
    { key: "create", label: "Create", path: "/create" },
    { key: "tracking", label: "Tracking", path: "/tracking" },
    { key: "history", label: "History", path: "/history" },
    { key: "address", label: "Address", path: "/address" }, // Assuming path is /address
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/"); // Redirect to homepage or login page after logout
    } catch (error) {
      console.error("Failed to log out", error);
      // Optionally, show an error message to the user
    }
  };

  const userDisplayName = currentUser?.email
    ? currentUser.email.split("@")[0]
    : currentUser?.displayName || "User";

  const userInitial = userDisplayName.charAt(0).toUpperCase();

  const dropdownMenuItems = [
    {
      key: "email",
      label: currentUser?.email || "User Profile",
      disabled: true, // Just for display
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: "Log Out",
      icon: <LogoutOutlined />, // Optional icon
      onClick: handleLogout,
    },
  ];

  // Common Logo and Title part
  const LogoAndTitle = ({ titleColorClass = "!text-neutral-800" }) => (
    <div className="flex items-center">
      <img
        src="../images/SwiftPigeonLogo.png" // Ensure this path is correct relative to your public/build folder
        alt="DropNest Logo"
        className="h-10 w-10 mr-4 transition-opacity duration-300 rounded-md"
      />
      <Title
        level={3}
        className={`!mb-0 mr-8 transition-colors duration-300 ${titleColorClass}`}
      >
        DropNest
      </Title>
    </div>
  );

  if (currentUser) {
    // --- Authenticated User Header ---
    return (
      <Header
        className="fixed w-full z-50 transition-all duration-300 ease-in-out shadow-md bg-blue-600" // Fixed blue background
        style={{ padding: "0 50px" }}
      >
        <div className="flex items-center justify-between h-full">
          {/* Left Side: Logo + DropNest + Navigation */}
          <div className="flex items-center">
            <LogoAndTitle titleColorClass="!text-white" />
            <Menu
              theme="dark" // Dark theme for blue background
              mode="horizontal"
              items={authMenuItems.map((item) => ({
                key: item.key,
                label: item.label,
                className: "hover:!bg-blue-700", // Adjust hover as needed
                onClick: () => navigate(item.path),
              }))}
              className="bg-transparent border-b-0"
              style={{ lineHeight: "64px" }}
            />
          </div>

          {/* Right Side: User Info Dropdown */}
          <div className="flex items-center">
            <Dropdown
              menu={{ items: dropdownMenuItems }}
              placement="bottomRight"
            >
              <Button type="text" className="!h-auto p-0">
                <Space className="text-white hover:text-blue-300 transition-colors duration-300">
                  <Avatar
                    style={{
                      backgroundColor: "#1890ff",
                      verticalAlign: "middle",
                    }} // Ant Design blue
                    size="default"
                  >
                    {userInitial}
                  </Avatar>
                  <span className="font-medium hidden sm:inline">
                    {userDisplayName}
                  </span>
                </Space>
              </Button>
            </Dropdown>
          </div>
        </div>
      </Header>
    );
  } else {
    // --- Unauthenticated User Header (Original Logic) ---
    return (
      <Header
        className={`fixed w-full z-50 transition-all duration-300 ease-in-out shadow-md ${navBg}`}
        style={{ padding: "0 50px" }}
      >
        <div className="flex items-center justify-between h-full">
          {/* Left Side: Logo + DropNest + Navigation */}
          <div className="flex items-center">
            <LogoAndTitle
              titleColorClass={
                menuTheme === "dark" ? "!text-white" : "!text-neutral-800"
              }
            />
            <Menu
              theme={menuTheme}
              mode="horizontal"
              items={unauthMenuItems.map((item) => ({
                key: item.key,
                label: item.label,
                className: `${
                  menuTheme === "dark"
                    ? "hover:!bg-blue-700"
                    : "hover:!bg-gray-200"
                }`,
                onClick: () => {
                  if (item.sectionId) {
                    scrollToSection(item.sectionId);
                  }
                },
              }))}
              className="bg-transparent border-b-0"
              style={{ lineHeight: "64px" }}
            />
          </div>

          {/* Right Side: Sign Up + Log In Buttons */}
          <div className="flex items-center gap-3">
            <Button
              type="text"
              size="large"
              className={`font-medium transition-all duration-300 ${
                menuTheme === "dark"
                  ? "text-white hover:!text-blue-300 hover:!bg-blue-700/20"
                  : "text-neutral-800 hover:!text-blue-600 hover:!bg-gray-200"
              }`}
              onClick={onSignUp}
            >
              Sign Up
            </Button>
            <Button
              type="text"
              size="large"
              className={`font-medium transition-all duration-300 ${
                menuTheme === "dark"
                  ? "text-white border border-current hover:!text-blue-300 hover:!border-blue-300 hover:!bg-blue-700/20"
                  : "text-neutral-800 border border-current hover:!text-blue-600 hover:!border-blue-600 hover:!bg-gray-200"
              }`}
              onClick={onLogin}
            >
              Log In
            </Button>
          </div>
        </div>
      </Header>
    );
  }
};

export default AppHeader;

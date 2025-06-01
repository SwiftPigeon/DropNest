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
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const { Header } = Layout;
const { Title } = Typography;

const AppHeader = ({
  navBg,
  menuTheme,
  scrollToSection,
  onSignUp,
  onLogin,
}) => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const unauthMenuItems = [
    { key: "features", label: "Features", sectionId: "features-section" },
    { key: "pricing", label: "Pricing", sectionId: "pricing-section" },
  ];

  const authMenuItems = [
    { key: "create", label: "Create", path: "/create" },
    { key: "tracking", label: "Tracking", path: "/tracking" },
    { key: "history", label: "History", path: "/history" },
    { key: "address", label: "Address", path: "/address" },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Failed to log out", error);
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
      disabled: true,
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: "Log Out",
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  const LogoAndTitle = ({ titleColorClass = "!text-neutral-800" }) => (
    <div className="flex items-center">
      <img
        src="../images/SwiftPigeonLogo.png"
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
    // 认证用户Header
    return (
      <Header
        className="fixed w-full z-50 transition-all duration-300 ease-in-out shadow-md bg-blue-600"
        style={{ padding: "0 50px" }}
      >
        <div className="flex items-center justify-between h-full">
          {/* 左侧：Logo + DropNest + 导航菜单 */}
          <div className="flex items-center flex-1 min-w-0">
            <LogoAndTitle titleColorClass="!text-white" />

            {/* 修复方案：给Menu更多空间并禁用省略号 */}
            <div className="flex-1 max-w-2xl">
              <Menu
                theme="dark"
                mode="horizontal"
                items={authMenuItems.map((item) => ({
                  key: item.key,
                  label: item.label,
                  className: "hover:!bg-blue-700",
                  onClick: () => navigate(item.path),
                }))}
                className="bg-transparent border-b-0"
                style={{
                  lineHeight: "64px",
                  minWidth: "400px", // 设置最小宽度确保所有菜单项显示
                }}
                // 禁用省略号功能
                overflowedIndicator={null}
                // 或者使用以下属性强制显示所有项目
                triggerSubMenuAction="click"
              />
            </div>
          </div>

          {/* 右侧：用户信息下拉菜单 */}
          <div className="flex items-center ml-4 flex-shrink-0">
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
                    }}
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
    // 未认证用户Header（原始逻辑）
    return (
      <Header
        className={`fixed w-full z-50 transition-all duration-300 ease-in-out shadow-md ${navBg}`}
        style={{ padding: "0 50px" }}
      >
        <div className="flex items-center justify-between h-full">
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

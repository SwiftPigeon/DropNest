import React from "react";
import { Layout, Menu, Typography, Button } from "antd";

const { Header } = Layout;
const { Title } = Typography;

const AppHeader = ({
  navBg,
  menuTheme,
  scrollToSection,
  onSignUp,
  onLogin,
}) => {
  // 导航菜单项配置 - Features和Pricing
  const menuItems = [
    { key: "features", label: "Features" },
    { key: "pricing", label: "Pricing" },
  ];

  return (
    <Header
      className={`fixed w-full z-50 transition-all duration-300 ease-in-out shadow-md ${navBg}`}
      style={{ padding: "0 50px" }}
    >
      <div className="flex items-center justify-between h-full">
        {/* 左侧：Logo + DropNest + 导航菜单 */}
        <div className="flex items-center">
          {/* Logo */}
          <img
            src="../images/SwiftPigeonLogo.png"
            alt="DropNest Logo"
            className="h-10 w-10 mr-4 transition-opacity duration-300 rounded-md"
          />

          {/* DropNest 标题 */}
          <Title
            level={3}
            className={`!mb-0 mr-8 transition-colors duration-300 ${
              menuTheme === "dark" ? "!text-white" : "!text-neutral-800"
            }`}
          >
            DropNest
          </Title>

          {/* 导航菜单 */}
          <Menu
            theme={menuTheme}
            mode="horizontal"
            items={menuItems.map((item) => ({
              key: item.key,
              label: item.label,
              className: `${
                menuTheme === "dark"
                  ? "hover:!bg-blue-700"
                  : "hover:!bg-gray-200"
              }`,
              onClick: () => {
                if (item.key === "features" || item.key === "pricing") {
                  scrollToSection(item.key + "-section");
                }
              },
            }))}
            className="bg-transparent border-b-0"
            style={{ lineHeight: "64px" }}
          />
        </div>

        {/* 右侧：Sign Up + Log In 按钮 */}
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
};

export default AppHeader;

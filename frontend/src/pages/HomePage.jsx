import React, { useState, useEffect, useRef } from "react";
import { Layout, Menu, Typography, Card, Row, Col, Button } from "antd";
import {
  RocketOutlined,
  RobotOutlined,
  FieldTimeOutlined,
  EyeOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

const { Header, Content, Footer } = Layout;
const { Title, Paragraph } = Typography;

// Data derived from API specification for card content (保持不变)
const deliveryTypesData = [
  {
    type: "ROBOT",
    name: "Ground Robot Delivery",
    description:
      "Ideal for heavier loads up to 30kg. Ground-level, weather-resistant, and a cost-effective solution.",
    icon: <RobotOutlined className="text-3xl text-blue-500" />,
    features: ["Max Weight: 30kg", "Base Price: $8.00", "Price per KM: $2.00"],
  },
  {
    type: "DRONE",
    name: "Aerial Drone Delivery",
    description:
      "The fastest option for light packages up to 5kg. Direct routes for quick service.",
    icon: <RocketOutlined className="text-3xl text-blue-500" />,
    features: ["Max Weight: 5kg", "Base Price: $12.00", "Price per KM: $3.00"],
  },
];

const speedOptionsData = [
  {
    name: "Basic Speed",
    description: "Delivery within ~2 hours.",
    multiplier: "1.0x Price",
    icon: <FieldTimeOutlined className="text-2xl text-green-500" />,
  },
  {
    name: "Standard Speed",
    description: "Delivery within ~1 hour.",
    multiplier: "1.2x Price",
    icon: <FieldTimeOutlined className="text-2xl text-yellow-500" />,
  },
  {
    name: "Express Speed",
    description: "Priority delivery within ~30 minutes.",
    multiplier: "1.5x Price",
    icon: <FieldTimeOutlined className="text-2xl text-red-500" />,
  },
];

// 主应用组件
const App = () => {
  // 导航栏背景色 state
  const [navBg, setNavBg] = useState("bg-gray-100"); // 初始米白色
  // 导航栏文字颜色 state (配合 Ant Design Menu theme)
  const [menuTheme, setMenuTheme] = useState("light"); // 初始浅色主题，对应深色文字
  // Hero区域背景图片上覆盖层的透明度 state
  const [heroOverlayOpacity, setHeroOverlayOpacity] = useState(0);
  // Feature卡片是否显示 state
  const [showFeatures, setShowFeatures] = useState(false);
  // 指向Feature区域的ref
  const featuresSectionRef = useRef(null);
  // 指向Hero区域的ref (用于计算滚动比例)
  const heroSectionRef = useRef(null);

  // 处理滚动事件的 Effect Hook
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const navTriggerHeight = 50; // 导航栏颜色变化的滚动阈值

      // 1. 导航栏背景和主题变化
      if (scrollY > navTriggerHeight) {
        setNavBg("bg-blue-600"); // 滚动后变为蓝色
        setMenuTheme("dark"); // 菜单变为深色主题 (浅色文字)
      } else {
        setNavBg("bg-gray-100"); // 初始米白色
        setMenuTheme("light"); // 菜单变为浅色主题 (深色文字)
      }

      // 2. Hero区域背景图片淡出为米白色效果
      if (heroSectionRef.current) {
        const heroHeight = heroSectionRef.current.offsetHeight;
        // 在Hero区域高度的 مثلا 75% 内完成过渡
        const fadeEndScroll = heroHeight * 0.75;
        const currentFadeProgress = Math.min(1, scrollY / fadeEndScroll);
        setHeroOverlayOpacity(currentFadeProgress);
      }

      // 3. Feature卡片浮现效果
      if (featuresSectionRef.current) {
        const { top } = featuresSectionRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        // 当Feature区域顶部进入视窗的75%时显示卡片
        if (top < windowHeight * 0.85) {
          setShowFeatures(true);
        } else {
          // 可选: 如果希望卡片在向上滚动时再次隐藏，可以取消下面的注释
          // setShowFeatures(false);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    // 清理函数：组件卸载时移除滚动事件监听器
    return () => window.removeEventListener("scroll", handleScroll);
  }, []); // 空依赖数组，effect仅在挂载和卸载时运行

  // 导航菜单项配置
  const menuItems = [
    { key: "features", label: "Features" },
    { key: "pricing", label: "Pricing" },
    { key: "signup", label: "Sign Up", className: "ml-auto" }, // Tailwind class 使其靠右
    { key: "login", label: "Log In" },
  ];

  // 平滑滚动到指定ID的元素
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <Layout className="min-h-screen bg-gray-100">
      {" "}
      {/* 整体布局背景设为米白色 */}
      {/* 导航栏 Header */}
      <Header
        className={`fixed w-full z-50 transition-all duration-300 ease-in-out shadow-md ${navBg}`}
        style={{ padding: "0 50px" }}
      >
        <div className="flex items-center h-full">
          <Title
            level={3}
            className={`!mb-0 mr-10 transition-colors duration-300 ${
              menuTheme === "dark" ? "!text-white" : "!text-neutral-800"
            }`}
          >
            DropNest
          </Title>
          <Menu
            theme={menuTheme} // 动态设置Menu主题
            mode="horizontal"
            items={menuItems.map((item) => ({
              key: item.key,
              label: item.label,
              className: `${item.className || ""} ${
                menuTheme === "dark"
                  ? "hover:!bg-blue-700"
                  : "hover:!bg-gray-200"
              }`, // 自定义hover效果
              onClick: () => {
                if (item.key === "features" || item.key === "pricing") {
                  scrollToSection(item.key + "-section");
                }
                // 后续添加注册/登录的导航逻辑
              },
            }))}
            className="flex-grow bg-transparent border-b-0" // 使Menu背景透明
            style={{ lineHeight: "64px" }}
          />
        </div>
      </Header>
      {/* 主要内容区域 Content */}
      <Content className="pt-[64px]">
        {" "}
        {/* pt-[64px] 为Header高度留出空间 */}
        {/* Hero 区域 */}
        <section
          ref={heroSectionRef}
          id="hero-section"
          className="h-screen flex flex-col items-center justify-center text-center relative overflow-hidden" // `overflow-hidden` 防止滚动条问题
          style={{
            backgroundImage: "url('../images/delivery.jpeg')", // 请确保图片路径正确
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed", // 使背景图片在滚动时固定，增强视差感
          }}
        >
          {/* 米白色覆盖层，用于实现背景图片到纯色的过渡 */}
          <div
            className="absolute inset-0 bg-gray-100 transition-opacity duration-500 ease-in-out" // 米白色
            style={{ opacity: heroOverlayOpacity, zIndex: 1 }}
          />
          {/* Hero区域内容，确保在覆盖层之上 */}
          <div className="z-10 p-5 relative">
            {" "}
            {/* 添加 relative 使 zIndex 生效 */}
            <Title
              level={1}
              className="!text-6xl !text-white font-bold mb-6"
              style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}
            >
              Revolutionizing Urban Delivery
            </Title>
            <Paragraph
              className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto"
              style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
            >
              DropNest offers swift, reliable, and intelligent package delivery
              across San Francisco using a state-of-the-art fleet of drones and
              ground robots.
            </Paragraph>
            <Button
              type="primary"
              size="large"
              className="bg-blue-500 hover:bg-blue-700 border-blue-500 hover:border-blue-700 shadow-lg"
            >
              Get Started
            </Button>
          </div>
          {/* 向下滚动指示器 (可选) */}
          <div className="absolute bottom-10 text-white animate-bounce z-10">
            {" "}
            {/* 确保在覆盖层之上 */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m4.5 5.25 7.5 7.5 7.5-7.5m-15 6 7.5 7.5 7.5-7.5"
              />
            </svg>
          </div>
        </section>
        {/* Features & Pricing 区域 - 滚动时浮现 */}
        {/* 注意：此区域的背景已是米白色，因为 Content 的父级 Layout 已设为 bg-gray-100 */}
        <section
          id="features-section"
          ref={featuresSectionRef}
          className="py-20 bg-gray-100" // 主体内容区域的米白色背景
        >
          <div className="container mx-auto px-6">
            <Title
              level={2}
              className="text-center mb-16 text-4xl font-semibold text-gray-800"
            >
              Why Choose DropNest?
            </Title>
            {/* 卡片容器，根据 showFeatures state 控制透明度和位移 */}
            <Row
              gutter={[32, 32]}
              className={`transition-all duration-1000 ease-in-out ${
                showFeatures
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              {/* Feature 卡片1 */}
              <Col xs={24} md={12} lg={6}>
                <Card
                  bordered={false}
                  className="shadow-xl hover:shadow-2xl transition-shadow h-full text-center p-6 rounded-lg bg-white"
                >
                  <RobotOutlined className="text-5xl text-blue-600 mb-4" />
                  <Title level={4} className="text-gray-700">
                    Advanced Fleet
                  </Title>
                  <Paragraph className="text-gray-600">
                    Utilizing state-of-the-art drones and ground robots for
                    efficient and secure city-wide delivery.
                  </Paragraph>
                </Card>
              </Col>
              {/* Feature 卡片2 */}
              <Col xs={24} md={12} lg={6}>
                <Card
                  bordered={false}
                  className="shadow-xl hover:shadow-2xl transition-shadow h-full text-center p-6 rounded-lg bg-white"
                >
                  <RocketOutlined className="text-5xl text-blue-600 mb-4" />
                  <Title level={4} className="text-gray-700">
                    Unmatched Speed
                  </Title>
                  <Paragraph className="text-gray-600">
                    Choose your pace: Basic, Standard, or Express 30-minute
                    delivery. We get it there, fast.
                  </Paragraph>
                </Card>
              </Col>
              {/* Feature 卡片3 */}
              <Col xs={24} md={12} lg={6}>
                <Card
                  bordered={false}
                  className="shadow-xl hover:shadow-2xl transition-shadow h-full text-center p-6 rounded-lg bg-white"
                >
                  <EyeOutlined className="text-5xl text-blue-600 mb-4" />
                  <Title level={4} className="text-gray-700">
                    Real-Time Tracking
                  </Title>
                  <Paragraph className="text-gray-600">
                    Monitor your package live from pickup to drop-off with our
                    precise GPS tracking system.
                  </Paragraph>
                </Card>
              </Col>
              {/* Feature 卡片4 */}
              <Col xs={24} md={12} lg={6}>
                <Card
                  bordered={false}
                  className="shadow-xl hover:shadow-2xl transition-shadow h-full text-center p-6 rounded-lg bg-white"
                >
                  <SafetyCertificateOutlined className="text-5xl text-blue-600 mb-4" />
                  <Title level={4} className="text-gray-700">
                    Reliable & Secure
                  </Title>
                  <Paragraph className="text-gray-600">
                    Three dispatch stations ensure comprehensive San Francisco
                    coverage. Your items are safe with us.
                  </Paragraph>
                </Card>
              </Col>
            </Row>
          </div>
        </section>
        {/* Pricing 区域 */}
        <section id="pricing-section" className="py-20 bg-white">
          {" "}
          {/* 此区域用纯白色背景以区分 */}
          <div className="container mx-auto px-6">
            <Title
              level={2}
              className="text-center mb-16 text-4xl font-semibold text-gray-800"
            >
              Flexible Delivery Solutions
            </Title>
            {/* 卡片容器，同样根据 showFeatures state 控制效果 (可以考虑为此区域设置单独的 state 和 ref 如果需要不同的触发时机) */}
            <Row
              gutter={[32, 32]}
              className={`transition-all duration-1000 ease-in-out ${
                showFeatures
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              {deliveryTypesData.map((type) => (
                <Col key={type.type} xs={24} md={12} className="mb-8">
                  <Card
                    bordered={false}
                    className="shadow-xl hover:shadow-2xl transition-shadow h-full rounded-lg overflow-hidden bg-white"
                  >
                    <div className="p-8 text-center">
                      {type.icon}
                      <Title level={3} className="mt-4 mb-2 text-gray-700">
                        {type.name}
                      </Title>
                      <Paragraph className="text-gray-600 mb-6">
                        {type.description}
                      </Paragraph>
                      <ul className="text-left text-gray-600 space-y-2 mb-6">
                        {type.features.map((feature) => (
                          <li key={feature} className="flex items-center">
                            <svg
                              className="w-5 h-5 text-green-500 mr-2 shrink-0"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              ></path>
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
            <Title
              level={3}
              className="text-center mt-16 mb-8 text-3xl font-semibold text-gray-700"
            >
              Choose Your Speed
            </Title>
            <Row
              gutter={[32, 32]}
              className={`transition-all duration-1000 ease-in-out ${
                showFeatures
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              {speedOptionsData.map((option) => (
                <Col key={option.name} xs={24} md={8}>
                  <Card
                    bordered={false}
                    className="shadow-lg hover:shadow-xl transition-shadow h-full text-center p-6 rounded-lg bg-white"
                  >
                    {option.icon}
                    <Title level={4} className="mt-3 mb-1 text-gray-700">
                      {option.name}
                    </Title>
                    <Paragraph className="text-gray-600">
                      {option.description}
                    </Paragraph>
                    <Paragraph className="font-semibold text-gray-700">
                      {option.multiplier}
                    </Paragraph>
                  </Card>
                </Col>
              ))}
            </Row>
            <div className="text-center mt-16">
              <Paragraph className="text-gray-600">
                Note: For detailed pricing, please use the in-app calculator
                after signing up. Delivery is subject to item type and adherence
                to our prohibited items list.
              </Paragraph>
              <Button type="link" className="text-blue-600 hover:text-blue-800">
                View Prohibited Items
              </Button>
            </div>
          </div>
        </section>
      </Content>
      {/* 页脚 Footer */}
      <Footer className="text-center bg-neutral-800 text-gray-400 py-10">
        DropNest ©{new Date().getFullYear()} - Your Future Delivery Partner.
        <div className="mt-2">
          <a href="/privacy" className="text-gray-400 hover:text-white mx-2">
            Privacy Policy
          </a>
          <a href="/terms" className="text-gray-400 hover:text-white mx-2">
            Terms of Service
          </a>
        </div>
      </Footer>
    </Layout>
  );
};

export default App;

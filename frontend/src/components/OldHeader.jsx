import React, { useState } from "react";
import { Layout, Avatar, Menu, Typography, Divider, Dropdown } from "antd";
import { TruckOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import BoringAvatar from "boring-avatars";
import { Link, useNavigate } from "react-router-dom";

const { Header } = Layout;
const { Title, Text } = Typography;

// get random color for avatar
function generateAvatarColor() {
  let color;
  do {
    color = `#${Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, "0")}`;
  } while (lightTool(color));
  return color;
}

function lightTool(hex) {
  const r = parseInt(hex.substr(1, 2), 16);
  const g = parseInt(hex.substr(3, 2), 16);
  const b = parseInt(hex.substr(5, 2), 16);
  const lumi = 0.299 * r + 0.587 * g + 0.114 * b;
  return lumi > 200;
}

export default function AppHeader({ user, setUser, setAuthVisible }) {
  const [isHover, setIsHover] = useState(false);
  const [avatarColor] = useState(generateAvatarColor());
  const navigate = useNavigate();

  let username = "User";

  if (user && user.name) {
    username = user.name.charAt(0).toUpperCase() + user.name.slice(1);
  }

  const handleLogout = () => {
    // clear all the tokens
    localStorage.clear();
    sessionStorage.clear();
    setUser(null);
    navigate("/");
  };

  const menuItemStyle = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 20px",
    fontSize: 17,
    fontWeight: 500,
  };

  const iconStyle = {
    fontSize: 20,
  };

  const labelStyle = {
    flex: 1,
    whiteSpace: "nowrap",
  };

  const avatarDropDown = (
    <div
      style={{
        width: 260,
        backgroundColor: "#e5e5e5",
        padding: 12,
        borderRadius: 20,
        boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
        overflow: "hidden",
      }}
    >
      {/* user information */}
      <div
        style={{
          textAlign: "center",
          padding: "28px 24px 16px",
        }}
      >
        <Text strong style={{ fontSize: 20, color: "#000" }}>
          Hi, {username}
        </Text>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: 14,
            marginBottom: 14,
          }}
        >
          <BoringAvatar
            size={48}
            name={username}
            variant="beam"
            colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]}
          />
        </div>
        <Text type="secondary" style={{ fontSize: 16 }}>
          {user?.email || "unknown@example.com"}
        </Text>
      </div>

      <Divider style={{ margin: "0 0 4px 0", borderColor: "#e5e5e5" }} />

      <Menu
        mode="vertical"
        selectable={false}
        style={{ border: "none", padding: "8px 0" }}
        onClick={({ key }) => {
          if (key === "logout") {
            handleLogout();
          }
          // if (info.key === "profile") {
          //   onProfileClick?.(); // add profile
          // }
        }}
      >
        <Menu.Item key="profile" style={{ padding: 0 }}>
          <div style={menuItemStyle}>
            <UserOutlined style={{ ...iconStyle, color: "#1890ff" }} />
            <span style={labelStyle}>Profile</span>
          </div>
        </Menu.Item>

        <Menu.Item key="logout" style={{ padding: 0 }}>
          <div style={menuItemStyle}>
            <LogoutOutlined style={{ ...iconStyle, color: "red" }} />
            <span style={labelStyle}>Logout</span>
          </div>
        </Menu.Item>
      </Menu>
    </div>
  );

  return (
    <Header
      className="fixed top-0 left-0 w-full flex justify-between items-center px-6 z-50"
      style={{
        height: "85px",
        boxShadow: "inset 0 -1px 0 rgba(255, 255, 255, 0.2)",
      }}
    >
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-4">
          <div className="w-14 h-14 flex items-center justify-center bg-[#0f766e] rounded-xl">
            <TruckOutlined style={{ fontSize: "2.5rem", color: "#99f6e4" }} />
          </div>
          <div className="flex flex-col justify-between h-15 pl-3 leading-none">
            <Title
              level={3}
              style={{
                margin: 0,
                marginBottom: 0,
                fontWeight: 600,
                fontSize: "2rem",
                lineHeight: 1,
                fontFamily: "'Montserrat', sans-serif",
                color: "#22d3ee",
              }}
            >
              Drop
            </Title>
            <Title
              level={3}
              style={{
                margin: 0,
                marginBottom: 0,
                fontWeight: 600,
                fontSize: "2rem",
                lineHeight: 1,
                fontFamily: "'Montserrat', sans-serif",
                color: "#ffffff",
              }}
            >
              Nest
            </Title>
          </div>
        </Link>

        {/* create delivery button  */}
        {user && (
          <div
            onClick={() => navigate("/createDelivery")}
            className="ml-4 px-6 py-1.5 rounded-full font-semibold text-white text-xl transition-all duration-300 hover:scale-105 hover:bg-cyan-600/30"
          >
            New Delivery
          </div>
        )}
      </div>

      {user ? (
        <div className="flex items-center gap-3 text-white">
          <Dropdown
            placement="bottomRight"
            dropdownRender={() => avatarDropDown}
            trigger="click"
          >
            <Avatar
              style={{
                backgroundColor: avatarColor,
                color: "#fff",
                cursor: "pointer",
                width: 45,
                height: 45,
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </Avatar>
          </Dropdown>
        </div>
      ) : (
        <span
          className="flex items-center gap-2 font-medium text-lg cursor-pointer px-3 py-1.5 rounded-md font-medium transition duration-300"
          style={{
            fontSize: 24,
            color: isHover ? "#40e0d0" : "#ffffff",
          }}
          onClick={() => {
            console.log("Clicked Sign In");
            // setAuthVisible(true);
            if (setAuthVisible) setAuthVisible(true);
          }}
          onMouseEnter={(e) => setIsHover(true)}
          onMouseLeave={(e) => setIsHover(false)}
        >
          <UserOutlined className="mr-2" />
          Sign In
        </span>
      )}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/20" />
    </Header>
  );
}

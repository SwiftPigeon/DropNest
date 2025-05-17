import React, { useState } from "react";
import { Layout, Avatar, Menu, Typography, Dropdown, Divider } from "antd";
import { TruckOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import BoringAvatar from "boring-avatars";

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

export default function AppHeader({ user, setAuthVisible }) {
  const [isHover, setIsHover] = useState(false);
  const [avatarColor] = useState(generateAvatarColor());

  const AvatarDropDownList = ({ user }) => {
    const username = user.name.charAt(0).toUpperCase() + user.name.slice(1);

    return (
      <Menu style={{ padding: "12px 16px", width: 220 }}>
        <div
          style={{
            marginBottom: 8,
            textAlign: "center",
            padding: "26px 24px",
            backgroundColor: "rgba(240, 240, 240, 0.85)",
            borderRadius: 8,
          }}
        >
          <Text strong style={{ fontSize: 18 }}>
            Hi, {username}
          </Text>
          <br />
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: 8,
              marginBottom: 8,
            }}
          >
            <BoringAvatar
              size={40}
              name={user.name}
              variant="beam"
              colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]}
            />
          </div>
          <br />
          <Text type="secondary" style={{ fontSize: 16 }}>
            {user.email}
          </Text>
        </div>
        <Divider style={{ margin: "15px 0" }} />
        <Menu.Item
          key="profile"
          style={{
            fontSize: 16,
            fontWeight: 400,
            backgroundColor: "#ebebeb",
            padding: "12px 20px",
          }}
          icon={<UserOutlined style={{ fontSize: 16 }} />}
        >
          Profile
        </Menu.Item>
        <div style={{ height: 8, backgroundColor: "#fff" }} />
        <Menu.Item
          key="logout"
          style={{
            fontSize: 16,
            fontWeight: 400,
            backgroundColor: "#ebebeb",
            padding: "12px 20px",
          }}
          icon={<LogoutOutlined style={{ fontSize: 16 }} />}
        >
          Logout
        </Menu.Item>
      </Menu>
    );
  };

  return (
    <Header
      className="fixed top-0 left-0 w-full flex justify-between items-center px-6 z-50"
      style={{ height: "85px", boxShadow: "inset 0 -1px 0 rgba(255, 255, 255, 0.2)" }}
    >
      <div className="flex items-center">
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
      </div>

      {user ? (
        <div className="flex items-center gap-3 text-white">
          <Dropdown
            overlay={<AvatarDropDownList user={user} />}
            placement="bottomRight"
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

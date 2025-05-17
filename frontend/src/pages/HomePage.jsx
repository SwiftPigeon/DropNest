import React, { useState } from "react";
import { Layout, Typography, Modal, Button, Row, Col } from "antd";
import {
  ClockCircleFilled,
  CompassFilled,
  EnvironmentFilled,
  RobotFilled,
  ThunderboltFilled,
} from "@ant-design/icons";
import AuthForm from "../components/AuthForm";
import AppHeader from "../components/Header";

const { Content } = Layout;
const { Title, Paragraph } = Typography;

export default function HomePage({ user, setUser }) {
  // control the visible of the modal
  const [authVisible, setAuthVisible] = useState(false);

  const handleCancel = () => {
    setAuthVisible(false);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AppHeader user={user} setAuthVisible={setAuthVisible} />

      <div
        className="fixed left-1/2 top-[20%] transform -translate-x-1/2 z-50 bg-black/25 p-14 rounded-xl text-center text-teal-300 shadow-lg"
        style={{ width: "90%", maxWidth: "1000px", minHeight: "320px" }}
      >
        <Title
          level={1}
          style={{
            fontFamily: "'Playfair Display', serif",
            color: "#fff",
            fontSize: "3.5rem",
            letterSpacing: "0.15rem",
            textShadow: "0px 1px 3px rgba(0, 0, 0, 0.4)",
            marginBottom: 28,
            fontWeight: 300,
          }}
        >
          It's time to{" "}
          <span
            className="text-[#10b981] font-normal"
            style={{
              fontSize: "3.5rem",
              fontFamily: "'Orbitron', sans-serif",
            }}
          >
            {" "}
            deliver
          </span>{" "}
          <strong>better.</strong>
        </Title>
        <Paragraph
          style={{
            fontSize: "1.30rem",
            color: "#a5f3fc",
            maxWidth: "100%",
            lineHeight: "1.6",
            textAlign: "center",
            fontFamily: "'Inter', sans-serif",
            textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
            marginBottom: 32,
          }}
        >
          Experience smart urban delivery powered by <strong>drones </strong>
          and <strong>robots</strong>.
        </Paragraph>

        {/* TODO: add the button onClick function based on the user state  */}
        <Button
          type="primary"
          size="large"
          style={{
            background: "linear-gradient(90deg, #ff6a00, #ee0979)",
            border: "none",
            borderRadius: "1.25rem",
            boxShadow:
              "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
            fontSize: "1.28rem",
            padding: "2rem 2rem",
            fontWeight: 700,
            marginTop: 24,
          }}
          onClick={() => {}}
        >
          Try Delivery Now!
        </Button>
      </div>

      <Content
        className="flex flex-col min-h-[calc(100vh-64px)] justify-center items-center px-10 relative"
        style={{
          padding: 0,
          backgroundImage: "url('../images/delivery.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="mt-auto w-full">
          <Row
            gutter={[50, 32]}
            justify="space-between"
            className="w-full mx-auto"
          >
            {[
              { icon: <ThunderboltFilled />, text: "Fast Delivery" },
              { icon: <RobotFilled />, text: "Robot & Drones" },
              { icon: <CompassFilled />, text: "Live Tracking" },
              { icon: <ClockCircleFilled />, text: "Real-Time ETA" },
              { icon: <EnvironmentFilled />, text: "Eco-Friendly" },
            ].map(({ icon, text }, index) => (
              <Col key={index} flex="1" className="w-1/5 text-center">
                <div className="flex flex-col justify-end items-center h-full text-[#38bdf8]">
                  <div className="text-3xl font-bold bg-white/70 p-3 rounded-full shadow-md">
                    {icon}
                  </div>
                  <p className="mt-2 text-base font-bold text-green-900 bg-white/70 px-2 rounded-md shadow-sm">
                    {text}
                  </p>
                </div>
              </Col>
            ))}
          </Row>
        </div>

        <Modal
          open={authVisible}
          onCancel={handleCancel}
          destroyOnClose={true}
          footer={null}
          title={
            <div
              style={{
                fontFamily: "'American Typewriter', Georgia, serif",
                textAlign: "center",
                fontSize: 30,
                fontWeight: 600,
              }}
            >
              Welcome to DropNest
            </div>
          }
        >
          <AuthForm
            onSuccess={(userData) => {
              setUser(userData);
              setAuthVisible(false);
            }}
          />
        </Modal>
      </Content>
    </Layout>
  );
}

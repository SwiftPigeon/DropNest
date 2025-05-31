import React, { useState } from "react";
import { Modal, Form, Input, Button, Typography, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";

const { Title, Text } = Typography;

const LoginModal = ({ visible, onCancel, onSwitchToRegister }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      // Call your actual login API based on the Postman collection
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();

      // Call the login function from AuthContext with the API response
      await login(data);

      message.success("Login successful!");
      form.resetFields();
      onCancel(); // Close the modal
    } catch (error) {
      message.error("Login failed. Please check your credentials.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={400}
      centered
      styles={{
        body: { padding: "2rem" },
      }}
    >
      <div className="text-center mb-6">
        <Title level={3} className="!mb-2">
          Welcome Back
        </Title>
        <Text type="secondary">Sign in to your DropNest account</Text>
      </div>

      <Form
        form={form}
        name="login"
        onFinish={handleLogin}
        layout="vertical"
        size="large"
      >
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Please input your email!" },
            { type: "email", message: "Please enter a valid email!" },
          ]}
        >
          <Input prefix={<UserOutlined />} placeholder="Enter your email" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[
            { required: true, message: "Please input your password!" },
            { min: 6, message: "Password must be at least 6 characters!" },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Enter your password"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            className="bg-blue-500 hover:bg-blue-700 border-blue-500 hover:border-blue-700"
          >
            Sign In
          </Button>
        </Form.Item>
      </Form>

      <div className="text-center">
        <Text type="secondary">
          Don't have an account?{" "}
          <Button
            type="link"
            onClick={onSwitchToRegister}
            className="!p-0 !h-auto text-blue-600 hover:text-blue-800"
          >
            Sign up here
          </Button>
        </Text>
      </div>
    </Modal>
  );
};

export default LoginModal;

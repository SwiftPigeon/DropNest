import React, { useState } from "react";
import { Modal, Form, Input, Button, Typography, message } from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";

const { Title, Text } = Typography;

const RegisterModal = ({ visible, onCancel, onSwitchToLogin }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async (values) => {
    setLoading(true);
    try {
      // Call your actual registration API based on the Postman collection
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          phone: values.phone,
          name: values.name,
        }),
      });

      if (!response.ok) {
        throw new Error("Registration failed");
      }

      const data = await response.json();

      // Call the register function from AuthContext with the API response
      await register(data);

      message.success("Registration successful! Welcome to DropNest!");
      form.resetFields();
      onCancel(); // Close the modal
    } catch (error) {
      message.error("Registration failed. Please try again.");
      console.error("Registration error:", error);
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
      width={450}
      centered
      styles={{
        body: { padding: "2rem" },
      }}
    >
      <div className="text-center mb-6">
        <Title level={3} className="!mb-2">
          Join DropNest
        </Title>
        <Text type="secondary">Create your account to start delivering</Text>
      </div>

      <Form
        form={form}
        name="register"
        onFinish={handleRegister}
        layout="vertical"
        size="large"
      >
        <Form.Item
          name="name"
          label="Full Name"
          rules={[
            { required: true, message: "Please input your full name!" },
            { min: 2, message: "Name must be at least 2 characters!" },
          ]}
        >
          <Input prefix={<UserOutlined />} placeholder="Enter your full name" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Please input your email!" },
            { type: "email", message: "Please enter a valid email!" },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="Enter your email" />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Phone Number"
          rules={[
            { required: true, message: "Please input your phone number!" },
            {
              pattern: /^[\+]?[1-9][\d]{0,15}$/,
              message:
                "Please enter a valid phone number (e.g., 415-555-0123)!",
            },
          ]}
          extra="Format: 415-555-0123"
        >
          <Input prefix={<PhoneOutlined />} placeholder="415-555-0123" />
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

        <Form.Item
          name="confirmPassword"
          label="Confirm Password"
          dependencies={["password"]}
          rules={[
            { required: true, message: "Please confirm your password!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("The two passwords do not match!")
                );
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Confirm your password"
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
            Create Account
          </Button>
        </Form.Item>
      </Form>

      <div className="text-center">
        <Text type="secondary">
          Already have an account?{" "}
          <Button
            type="link"
            onClick={onSwitchToLogin}
            className="!p-0 !h-auto text-blue-600 hover:text-blue-800"
          >
            Sign in here
          </Button>
        </Text>
      </div>
    </Modal>
  );
};

export default RegisterModal;

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
      // 使用AuthContext中的login方法，传入email和password
      const userData = await login(values.email, values.password);

      console.log("Login successful:", userData);
      message.success("Login successful!");
      form.resetFields();
      onCancel(); // Close the modal

      // 登录成功后可以进行页面跳转等操作
      // navigate 会在AuthContext中处理，或者你可以在这里添加
    } catch (error) {
      console.error("Login error:", error);
      message.error(
        error.message || "Login failed. Please check your credentials."
      );
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
        // 为了测试方便，预填充测试账户信息
        initialValues={{
          email: "john.doe@example.com",
          password: "password123",
        }}
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

      {/* 测试提示 */}
      {/* <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
        <Text type="secondary">
          <strong>Test Account:</strong>
          <br />
          Email: john.doe@example.com
          <br />
          Password: password123
        </Text>
      </div> */}
    </Modal>
  );
};

export default LoginModal;

import { Form, Input, Checkbox, Button } from "antd";
import { storeTokens } from "../service/AuthService";

export function LoginForm({ onSuccess, loading }) {
  const handleLogin = async (data) => {
    const { email, password, remember } = data;

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const info = await response.json();

      // store tokens
      storeTokens({
        accessToken: info.accessToken,
        remember: remember,
      });

      // login success, update state
      onSuccess({
        email: info.user.email,
        id: info.user.id,
      });
    } catch (error) {
      console.error("Login failed: ", error);
    }
  };

  return (
    <Form
      layout="vertical"
      initialValues={{
        remember: true,
      }}
      onFinish={handleLogin}
    >
      <Form.Item
        label={<span style={{ fontSize: 15, fontWeight: 600 }}>Email</span>}
        name="email"
        rules={[{ required: true, message: "Enter a valid email address" }]}
        style={{ marginBottom: 40 }}
      >
        <Input size="large" placeholder="Enter email" />
      </Form.Item>
      <Form.Item
        label={<span style={{ fontSize: 15, fontWeight: 600 }}>Password</span>}
        name="password"
        rules={[{ required: true, message: "Please input your Password" }]}
        style={{ marginBottom: 20 }}
      >
        <Input.Password size="large" placeholder="Enter password" />
      </Form.Item>
      <Form.Item style={{ marginBottom: 30 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Form.Item
            name="remember"
            valuePropName="checked"
            style={{ fontWeight: 600 }}
          >
            <Checkbox>Remember me</Checkbox>
          </Form.Item>
          {/* TODO: add forgot password function  */}
          <a className="login-form-forgot" href="" style={{ fontWeight: 600 }}>
            Forgot password
          </a>
        </div>
      </Form.Item>
      <Form.Item>
        {/* TODO: add sign in button function  */}
        <Button
          type="primary"
          htmlType="submit"
          block
          size="large"
          loading={loading}
        >
          Sign In
        </Button>
      </Form.Item>
    </Form>
  );
}

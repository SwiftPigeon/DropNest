import { Form, Input, Button, Progress } from "antd";
import { useState } from "react";
import { CheckOutlined } from "@ant-design/icons";
import { storeTokens } from "../service/AuthService";

export function RegisterForm({ onSuccess, loading }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  // handle register logic
  // TODO: Test with the backend API
  const handleRegister = async () => {
    try {
      // send request to the backend API
      const response = await fetch("/api/auth/register", {
        method: "POST",
        Headers: { "Content-Type": "applicatin/json" },
        body: JSON.stringify({ email, password, username }),
      });

      if (!response.ok) {
        throw new Error("Registration failed");
      }

      const data = await response.json();

      // store token
      storeTokens({
        accessToken: data.accessToken,
        remember: true,
      });

      // update user state
      onSuccess({
        id: data.user.id,
        name: data.user.username,
        email: data.user.email,
      });
    } catch (error) {
      throw error;
    }
  };

  // check if password valid
  const validPassword = {
    length: password.length >= 8,
    mix: /[A-Za-z]/.test(password) && /[0-9]/.test(password),
    speicalCharacter: /[^A-Za-z0-9]/.test(password),
    case: /[a-z]/.test(password) && /[A-Z]/.test(password),
  };

  // track the count of the passed conditions of password
  const passedCount = Object.values(validPassword).filter(Boolean).length;
  // check if the password passed all the conditions
  const passedAll = Object.values(validPassword).every(Boolean);

  // the state of the button (if the button is able to click)
  const canSubmit = username.trim() && email.trim() && passedAll;

  // the strength color of password
  const strength = {
    0: { color: "red", text: "Weak" },
    1: { color: "red", text: "Weak" },
    2: { color: "orange", text: "Medium" },
    3: { color: "orange", text: "Medium" },
    4: { color: "green", text: "Strong" },
  };

  const { color: strengthColor, text: strengthText } =
    strength[passedCount] || strength[0];

  return (
    <Form layout="vertical" onFinish={handleRegister}>
      <Form.Item
        label={<span style={{ fontSize: 15, fontWeight: 600 }}>User Name</span>}
        name="username"
        rules={[{ required: true, message: "Enter an account name" }]}
        style={{ marginBottom: 40 }}
      >
        <Input
          size="large"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="example: Jacob"
        />
      </Form.Item>
      <Form.Item
        label={<span style={{ fontSize: 15, fontWeight: 600 }}>Email</span>}
        name="email"
        rules={[{ required: true, message: "Enter a valid email address" }]}
        style={{ marginBottom: 40 }}
      >
        <Input
          size="large"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email"
        />
      </Form.Item>
      <Form.Item
        label={<span style={{ fontSize: 15, fontWeight: 600 }}>Password</span>}
        name="password"
        rules={[{ required: true }]}
      >
        <Input.Password
          size="large"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create password"
        />
        {password && (
          <div style={{ display: "flex", marginTop: 5 }}>
            <Progress
              percent={(passedCount / 4) * 100}
              showInfo={false}
              strokeColor={strengthColor}
              style={{
                height: 6,
                width: 250,
                borderRadius: 4,
              }}
            />
            <span
              style={{ color: strengthColor, fontWeight: 600, marginLeft: 200 }}
            >
              {strengthText}
            </span>
          </div>
        )}
      </Form.Item>
      <Form.Item style={{ marginBottom: 15 }}>
        <div style={{ paddingLeft: 12, marginTop: -5 }}>
          <ul
            style={{
              listStyle: "none",
              fontSize: 14,
              paddingLeft: 0,
              marginBottom: 16,
            }}
          >
            <li
              style={{
                color: validPassword.length ? "green" : "#000",
                display: "flex",
                alignItems: "center",
              }}
            >
              {validPassword.length ? (
                <CheckOutlined style={{ paddingRight: 5 }} />
              ) : (
                ""
              )}
              At least 8 characters
            </li>
            <li
              style={{
                color: validPassword.mix ? "green" : "#000",
                display: "flex",
                alignItems: "center",
              }}
            >
              {validPassword.mix ? (
                <CheckOutlined style={{ paddingRight: 5 }} />
              ) : (
                ""
              )}
              Mix of letters and numbers
            </li>
            <li
              style={{
                color: validPassword.speicalCharacter ? "green" : "#000",
                display: "flex",
                alignItems: "center",
              }}
            >
              {validPassword.speicalCharacter ? (
                <CheckOutlined style={{ paddingRight: 5 }} />
              ) : (
                ""
              )}
              At least 1 special character
            </li>
            <li
              style={{
                color: validPassword.case ? "green" : "#000",
                display: "flex",
                alignItems: "center",
              }}
            >
              {validPassword.case ? (
                <CheckOutlined style={{ paddingRight: 5 }} />
              ) : (
                ""
              )}
              At least 1 lowercase and 1 uppercase letter
            </li>
          </ul>
        </div>
      </Form.Item>
      <Form.Item>
        {/* TODO: add register button function  */}
        <Button
          type="primary"
          htmlType="submit"
          block
          size="large"
          loading={loading}
          disabled={!canSubmit}
          style={{
            fontWeight: 600,
            ...(!canSubmit && {
              backgroundColor: "#87CEFA",
              color: "#fff",
            }),
          }}
        >
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
}

import { Tabs, Form } from "antd";
import React, { useState } from "react";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

export default function AuthForm({ onSuccess }) {
  //   const { form } = Form.useForm();

  return (
    <Tabs
      defaultActiveKey="signin"
      tabBarStyle={{ textAlign: "left", paddingLeft: 8 }}
      tabBarGutter={40}
      items={[
        {
          key: "signin",
          label: <span style={{ fontSize: 18, fontWeight: 600 }}>Sign in</span>,
          children: <LoginForm onSuccess={onSuccess} />,
        },
        {
          key: "register",
          label: (
            <span style={{ fontSize: 18, fontWeight: 600 }}>Register</span>
          ),
          children: <RegisterForm onSuccess={onSuccess} />,
        },
      ]}
    />
  );
}

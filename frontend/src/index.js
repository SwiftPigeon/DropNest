// index.js - 更新后的入口文件，添加MSW支持
import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { enableMocking } from "./mocks/browser";

// for latest ant design
import "antd/dist/reset.css";

// Enable MSW mocking before rendering the app
enableMocking().then(() => {
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  // If you want to start measuring performance in your app, pass a function
  // to log results (for example: reportWebVitals(console.log))
  // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
  reportWebVitals();
});

// 备选方案：如果你想要同步启动而不等待MSW，可以使用这种方式：
/*
// 同时启动MSW和React应用
enableMocking();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
*/

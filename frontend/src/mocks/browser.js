// mocks/browser.js - MSW browser setup for development
import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

// This configures a Service Worker with the given request handlers.
export const worker = setupWorker(...handlers);

// Enable API mocking when the app is in development
export const enableMocking = async () => {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  // Start the mocking
  await worker.start({
    onUnhandledRequest: "warn", // Warn about unhandled requests
    serviceWorker: {
      url: "/mockServiceWorker.js", // This file needs to be in the public folder
    },
  });

  console.log("🔶 MSW: API mocking enabled");

  // Add some helpful dev tools
  if (process.env.NODE_ENV === "development") {
    // Add MSW devtools to window for debugging
    window.msw = {
      worker,
      handlers,
      // Helper to quickly reset all handlers
      resetHandlers: () => worker.resetHandlers(...handlers),
      // Helper to see all current handlers
      listHandlers: () => worker.listHandlers(),
      // Helper to stop mocking
      stop: () => worker.stop(),
      // Helper to start mocking again
      start: () => worker.start(),
    };

    console.log("🔧 MSW: Debug tools available at window.msw");
  }
};

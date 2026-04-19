import "@telegram-apps/telegram-ui/dist/styles.css";
import "leaflet/dist/leaflet.css";
import "./styles/index.css";

import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { bootstrapTelegram, subscribeThemeChanged } from "./lib/telegram";

function Bootstrap() {
  useEffect(() => {
    bootstrapTelegram();
    return subscribeThemeChanged(() => {
      // Theme changes are already reflected through TelegramUI CSS variables.
    });
  }, []);

  return <App />;
}

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element not found");
}

createRoot(root).render(
  <StrictMode>
    <Bootstrap />
  </StrictMode>
);

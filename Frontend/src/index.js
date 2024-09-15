import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "App";

// Material Dashboard 2 React Context Provider
import { PlayVerseUIControllerProvider } from "context";

const container = document.getElementById("app");
const root = createRoot(container);

root.render(
  <BrowserRouter>
    <PlayVerseUIControllerProvider>
      <App />
    </PlayVerseUIControllerProvider>
  </BrowserRouter>
);

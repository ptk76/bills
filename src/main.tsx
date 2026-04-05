import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AppProvider } from "./context/AppContext";

const url = new URL(location.href);
const token = url.searchParams.get("t");
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProvider token={token ?? "test"}>
      <App />
    </AppProvider>
  </StrictMode>,
);

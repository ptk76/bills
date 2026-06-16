import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AppProvider } from "./context/AppContext";
import { I18nProvider } from "./i18n/I18nContext";

const url = new URL(location.href);
const token = url.searchParams.get("t");
createRoot(document.getElementById("root")!).render(
  <StrictMode>
  <I18nProvider>
    <AppProvider token={token ?? "test"}>
      <App />
    </AppProvider>
  </I18nProvider>,
  </StrictMode>,
);

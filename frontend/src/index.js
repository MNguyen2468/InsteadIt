import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthContextProvider } from "./context/authContext";
import { DarkModeContextProvider } from "./context/darkModeContext";

// Create the root element
const root = ReactDOM.createRoot(document.getElementById("root"));

// Render the components using React.createElement (without JSX)
root.render(
  React.createElement(
    React.StrictMode,
    null,
    React.createElement(
      DarkModeContextProvider,
      null,
      React.createElement(
        AuthContextProvider,
        null,
        React.createElement(App, null)
      )
    )
  )
);


// import { StrictMode } from "react";
// import { createRoot } from "react-dom/client";
// import "./index.css";
// import App from "./App.jsx";
// import { BrowserRouter } from "react-router-dom";

// createRoot(document.getElementById("root")).render(
//   <BrowserRouter>
//     <StrictMode>
//       <App />
//     </StrictMode>
//   </BrowserRouter>
// );

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { ThirdwebProvider } from "thirdweb/react";
import { client } from "./client";
import { sepolia } from "thirdweb/chains";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ThirdwebProvider client={client} chain={sepolia}>
        <App />
      </ThirdwebProvider>
    </BrowserRouter>
  </StrictMode>
);

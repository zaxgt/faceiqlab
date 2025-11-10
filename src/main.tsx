import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
<Route path="/premium" element={<Premium />} />
<Route path="/signin" element={<SignIn />} />
<Route path="/checkout" element={<Checkout />} />
<Route path="/dashboard" element={<Dashboard />} />

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Submit from "./pages/SubmitReport";
import InfoAI from "./pages/Info/AI";
import InfoData from "./pages/Info/Data";
import InfoDocs from "./pages/Info/Docs";
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/Admin/Dashboard";
import { MainLayout } from "./layouts/MainLayout";
import "./style.css";

// todo:

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/submitreport" element={<Submit />} />
          <Route path="/info" element={<InfoDocs />} />
          <Route path="/info/AI" element={<InfoAI />} />
          <Route path="/info/Data" element={<InfoData />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Dashboard />} />{" "}
          {/* Placeholder for now */}
          <Route path="reports" element={<Dashboard />} />{" "}
          {/* Placeholder for now */}
          <Route path="ai" element={<Dashboard />} />{" "}
          {/* Placeholder for now */}
        </Route>
      </Routes>
    </Router>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

export default App;

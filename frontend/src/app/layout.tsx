import React from "react";
import { Route, BrowserRouter as Router } from "react-router-dom";
import Dashboard from "./dashboard/page";

const layout = () => {
  return (
    <Router>
      <Route path="/" element={Home} />
      <Route path="/about" element={About} />
      <Route path="/signup" element={} />
      <Route path="/login" element={} />
      <Route path="/profile" element={} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Router>
  );
};

export default layout;

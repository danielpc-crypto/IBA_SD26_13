import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import Start from "./Start";
import Signup from "./Signup";
import Login from "./Login";


function App() {
  return(
    <Router>
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;

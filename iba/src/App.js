import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import Start from "./Start";
import Signup from "./Signup";
import Login from "./Login";
import Profile from "./Profile";
import { Container } from "@mui/material";


function App() {
  return(
    <div>
        <Router>
          <Routes>
            <Route path="/" element={<Start />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Router>
        
        </div>
  );
}

export default App;

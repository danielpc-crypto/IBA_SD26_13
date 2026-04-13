import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Container } from "@mui/material";

function Signup() {
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();

        const res = await fetch("http://localhost:5000/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ firstName, lastName, username, email, password }),
        });
        const data = await res.json();
        console.log(data);

        navigate("/dashboard");
    };
    return(
        <div>
            <div style={{ marginBottom: "20px"}}>
          <Container>
            <nav class="navbar navbar-expand-lg fixed-top bg-body-tertiary" data-bs-theme="dark">
              <div class="container-fluid">
                <a class="navbar-brand" href="/">Intelligent Business Analyzer</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                  <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                  <ul class="navbar-nav">
                    <li class="nav-item">
                      <a class="nav-link" href="/login">Login</a>
                    </li>
                    <li class="nav-item">
                      <a class="nav-link" href="/signup">Get Started</a>
                    </li>
                  </ul>
                </div>
              </div>
            </nav>
          </Container>
        </div>
        <Container style={{ marginTop: "100px", justifyContent: "center", display: "flex", backgroundColor: "RoyalBlue", width: "400px", padding: "20px", borderRadius: "10px"}}>
            <div style={{ width: "300px"}}>
                <h1 align="center">Welcome!</h1>
                <label class="form-label">First Name</label>
                <input type="text" class="form-control" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                <label class="form-label">Last Name</label>
                <input type="text" class="form-control" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                <label class="form-label">Username</label>
                <input type="text" class="form-control" value={username} onChange={(e) => setUsername(e.target.value)} />
                <label class="form-label">Email address</label>
                <input type="email" class="form-control" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com"/>
                <label class="form-label">Password</label>
                <input type="password" class="form-control" value={password} onChange={(e) => setPassword(e.target.value)} />
                <div align="center" style={{ paddingTop: "20px" }}>
                    <button type="submit" class="btn btn-light" onClick={handleSignup}>Sign Up</button>
                </div>
                </div>
        </Container>
        </div>
    );
}

export default Signup;
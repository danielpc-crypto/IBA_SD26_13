import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Container } from "@mui/material";
import "./start.css";

function Start() {


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

          <div style={{ marginTop: "50px"}}>
            {/* <a href="https://www.vecteezy.com/free-vector/futuristic">Futuristic Vectors by Vecteezy</a> */}
            <div>
            <div className="banner">
              <img className="img" src="/pictures/vector-jan-2021-34_generated.jpg" alt="Banner"/>
              <div className="banner-text">
                <h1>Welcome to Intelligent Business Analyzer</h1>
                <p>Unlock insights from your business data with AI-powered analysis</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    );
}


const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 20px",
    borderBottom: "1px solid #ccc",
  },
  logo: {
    margin: 0,
  },
  nav: {
    display: "flex",
    gap: "15px",
  },
  link: {
    textDecoration: "none",
    color: "blue",
  },
};

export default Start;
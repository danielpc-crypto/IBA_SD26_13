import React from "react";
import { Container } from "@mui/material";
import "./start.css";

function Start() {
    return (
      <div>
        <div style={{ marginBottom: "20px" }}>
          <Container>
            <nav className="navbar navbar-expand-lg fixed-top bg-body-tertiary" data-bs-theme="dark">
              <div className="container-fluid">
                <a className="navbar-brand" href="/">Intelligent Business Analyzer</a>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                  <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                  <ul className="navbar-nav ms-auto">
                    <li className="nav-item">
                      <a className="nav-link" href="/login">Login</a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="/signup">
                        <span style={{
                          background: "linear-gradient(135deg, #1a73e8, #4791db)",
                          padding: "6px 18px",
                          borderRadius: "6px",
                          color: "#fff",
                          fontWeight: 600
                        }}>Get Started</span>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </nav>
          </Container>

          {/* Hero Banner */}
          <div style={{ marginTop: "56px" }}>
            <div className="banner">
              <img className="img" src="/pictures/vector-jan-2021-34_generated.jpg" alt="Banner" />
              <div className="banner-text">
                <h1>Intelligent Business Analyzer</h1>
                <p>Harness the power of AI to detect anomalies, uncover insights, and make smarter decisions from your business data.</p>
                <div style={{ marginTop: "20px" }}>
                  <a href="/signup" className="cta-btn">Get Started Free</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section className="features-section">
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: 700, color: "#1a1a2e" }}>
              Why Choose IBA?
            </h2>
            <p style={{ fontSize: "1.05rem", color: "#5a6270", maxWidth: "550px", margin: "8px auto 0" }}>
              Built for teams who want actionable intelligence, not just charts.
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Anomaly Detection</h3>
              <p>AI-powered analysis finds irregularities and patterns humans might miss in your datasets.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Business Rules Engine</h3>
              <p>Define custom rules and let the analyzer cross-reference data against your specific criteria.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Instant Insights</h3>
              <p>Upload your data and get a detailed analysis report in seconds — no setup required.</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <h2>Ready to analyze your data?</h2>
          <p>Create a free account and start uncovering insights today.</p>
          <a href="/signup" className="cta-btn">Sign Up Now</a>
        </section>

        {/* Footer */}
        <footer className="site-footer">
          <p>&copy; 2026 Intelligent Business Analyzer. All rights reserved.</p>
        </footer>
      </div>
    );
}

export default Start;
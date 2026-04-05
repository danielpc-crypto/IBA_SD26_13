import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Start() {


    return(
        <div>
            <header style={styles.header}>
                <nav style={styles.nav}>
                    <Link to="/login" style={styles.link}>Login</Link>
                    <Link to="/signup" style={styles.link}>Get Started</Link>
                </nav>
            </header>
            <h1>Start Page</h1>
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
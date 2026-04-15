import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  Stack,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch("http://localhost:5000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            console.log(data);

            if (data.user) {
                localStorage.setItem("user", JSON.stringify(data.user));
                navigate("/dashboard");
            } else {
                alert(data.message || "Invalid credentials");
            }
        } catch (err) {
            console.error("Login error:", err);
            alert("Could not connect to server");
        }
    };

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
                                        <a className="nav-link" href="/signup">Get Started</a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </nav>
                </Container>
            </div>

            <Box sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #e8eaf6 0%, #f5f7fa 50%, #e3f2fd 100%)",
                pt: "56px",
            }}>
                <Paper
                    elevation={6}
                    sx={{
                        p: 5,
                        width: 420,
                        maxWidth: "90vw",
                        textAlign: "center",
                    }}
                >
                    <Box sx={{
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #1a73e8, #0d47a1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mx: "auto",
                        mb: 2,
                    }}>
                        <LockOutlinedIcon sx={{ color: "#fff", fontSize: 28 }} />
                    </Box>
                    <Typography variant="h5" fontWeight={700} gutterBottom>
                        Welcome Back
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Sign in to access your dashboard
                    </Typography>

                    <Stack spacing={2.5} component="form" onSubmit={handleLogin}>
                        <TextField
                            label="Email Address"
                            type="email"
                            fullWidth
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            variant="outlined"
                            required
                        />
                        <TextField
                            label="Password"
                            type="password"
                            fullWidth
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            variant="outlined"
                            required
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            fullWidth
                            sx={{
                                py: 1.4,
                                background: "linear-gradient(135deg, #1a73e8, #0d47a1)",
                                fontSize: "1rem",
                                "&:hover": {
                                    background: "linear-gradient(135deg, #1557b0, #0a3d91)",
                                },
                            }}
                        >
                            Login
                        </Button>
                    </Stack>

                    <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
                        Don't have an account?{" "}
                        <Link to="/signup" style={{ color: "#1a73e8", fontWeight: 600, textDecoration: "none" }}>
                            Sign up
                        </Link>
                    </Typography>
                </Paper>
            </Box>
        </div>
    );
}

export default Login;
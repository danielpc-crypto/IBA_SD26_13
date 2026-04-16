import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import {
  Box,
  Button,
  Typography,
  Paper,
  Container,
  Stack,
  Chip,
  Divider,
  Grid,
  TextField,
  IconButton,
  CircularProgress,
  Dialog,
  Slide,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { Send } from '@mui/icons-material';

function GeminiAssistant(){
    const navigate = useNavigate();
    const [logoutOpen, setLogoutOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const user = localStorage.getItem("user");
    const parsedUser = JSON.parse(user);
    const flags = JSON.parse(localStorage.getItem("flags")) || {
        supplier_name: "",
        contract_start: "",
        non_pay: false,
        chargeback: false,
        variance_com_drop: false
    };

    const handleLogout = () => {
            localStorage.removeItem("user");
            localStorage.removeItem("flags");
            setLogoutOpen(false);
            navigate("/");
          };
        
    useEffect(() => {
    if (!user) {
        navigate("/login");
    }
    }, [navigate]);

    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        if(!input.trim()) return;

        const userMsg = { role: "user", text: input};
        const updated = [...messages, userMsg];

        setMessages(updated);
        setInput("");
        setLoading(true);

        const assistantMsg = { role: "model", text: "" };
        setMessages([...updated, assistantMsg]);

        const gemInput = JSON.stringify({messages: updated});
        const res = await fetch("http://localhost:5000/chat-stream", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: gemInput,
        });

        const reader = res.body.getReader();

        const decoder = new TextDecoder("utf-8");

        let fullText = "";

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            fullText += chunk;

            // update last message (streaming effect)
            setMessages((prev) => {
                    const copy = [...prev];
                    copy[copy.length - 1] = {
                    role: "model",
                    text: fullText,
                    };
                    return copy;
            });
        }

        setLoading(false);
    };
    

    return (
        <div>
            <div style={{ marginBottom: "20px"}}>
            <Container >
                <nav className="navbar navbar-expand-lg fixed-top bg-body-tertiary" data-bs-theme="dark">
                <div className="container-fluid">
                    <a className="navbar-brand" href="#" onClick={(e) => { e.preventDefault(); setLogoutOpen(true); }}>Intelligent Business Analyzer</a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                        <a className="nav-link" href="/dashboard">Dashboard</a>
                        </li>
                        </ul>
                    <div className="collapse navbar-collapse">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item dropdown">
                        <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <img src="pictures/default.png" alt="Profile" className="rounded-circle" width="30" height="30" style={{backgroundColor: "#212529"}} />
                        </a>
                        <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                            <li><a className="dropdown-item" href="/profile">Profile</a></li>
                            <li><a className="dropdown-item" href="#">Another action</a></li>
                            <li><hr className="dropdown-divider"/></li>
                            <li><a className="dropdown-item" href="/" onClick={() => localStorage.removeItem("user")}>Log Out</a></li>
                        </ul>
                        </li>
                    </ul>
                    </div>
                    </div>
                </div>
                </nav>
            </Container>
            </div>
            <Box sx={{ maxWidth: 800, mx: "auto", p: 2 }}>
                <Typography variant="h5" sx={{ mb: 2 }}>
                    Gemini Chat
                </Typography>

                {/* Chat container */}
                <Paper
                    sx={{
                    height: "70vh",
                    p: 2,
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    }}
                >
                    {messages.map((msg, i) => (
                    <Box
                        key={i}
                        sx={{
                        display: "flex",
                        justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                        }}
                    >
                        <Box
                        sx={{
                            maxWidth: "70%",
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: msg.role === "user" ? "#1976d2" : "#eee",
                            color: msg.role === "user" ? "white" : "black",
                            whiteSpace: "pre-wrap",
                        }}
                        >
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </Box>
                    </Box>
                    ))}

                    {loading && messages[messages.length - 1]?.text === "" && (
                    <Stack direction="row" spacing={1} alignItems="center">
                        <CircularProgress size={14} />
                        <Typography variant="caption">Gemini is typing...</Typography>
                    </Stack>
                    )}

                    <div ref={bottomRef} />
                </Paper>

                {/* Input box */}
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <TextField
                    fullWidth
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Message..."
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    />

                    <IconButton onClick={sendMessage} color="primary">
                    <Send />
                    </IconButton>
                </Stack>
                </Box>
        </div>
    );
}

export default GeminiAssistant;
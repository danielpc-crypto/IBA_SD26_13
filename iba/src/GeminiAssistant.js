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
import Header from './Header';

const getUserDocuments = async (username, s3_file_key) => {
    try {
        const userFile = await fetch(`http://localhost:5000/retrieve/bucket/${username}/${s3_file_key}`,{
            method: "GET",
        }).then(res => res.json());
        return userFile;
    } catch (error) {
        console.error("Error fetching user file:", error);
        throw error;
    }
};

function GeminiAssistant(){
    const navigate = useNavigate();
    const [logoutOpen, setLogoutOpen] = useState(false);
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [fileData, setFileData] = useState(null);
    const user = localStorage.getItem("user");
    const parsedUser = JSON.parse(user);
    const flags = JSON.parse(localStorage.getItem("flags")) || {
        supplier_name: "",
        contract_start: "",
        non_pay: false,
        chargeback: false,
        variance_com_drop: false
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

    useEffect(() => {
        const fetchDocument = async () => {
            try {
                const userFile = await getUserDocuments(
                    parsedUser.username,
                    parsedUser.s3_file_key
                );

                setFileData(userFile);
                console.log("Fetched user document:", userFile);

            } catch (error) {
                console.error(error);
            }
        };

        fetchDocument();
    }, [parsedUser.username, parsedUser.s3_file_key]);
    

    const sendMessage = async () => {
        if(!input.trim()) return;

        const userMsg = { role: "user", text: input };
        const updated = [...messages, userMsg];

        setMessages(updated);
        setInput("");
        setLoading(true);

        const assistantMsg = { role: "model", text: "" };
        setMessages([...updated, assistantMsg]);

        const gemInput = new FormData();
        gemInput.append("messages", JSON.stringify({messages: updated}))
        gemInput.append("file", fileData.body);
        gemInput.append("flags", JSON.stringify(flags));
        const res = await fetch("http://localhost:5000/chat-stream", {
            method: "POST",
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
            <Header open={open} setOpen={setOpen} />
            <Box sx={{ maxWidth: 800, mx: "auto", p: 2, paddingTop: '80px'}}>

                {/* Chat container */}
                <Container
                    sx={{
                    height: "70vh",
                    p: 2,
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.2,
                    scrollBehavior: "smooth",
                    }}
                >
                    <Box
                        sx={{
                        display: "flex",
                        justifyContent: "flex-start",
                        }}
                    >
                        <Box
                        sx={{
                            maxWidth: "75%",
                            py: 1.2,
                            px: 2,
                            borderRadius: 2.5,
                            bgcolor: "#f5f5f5",
                            color: "#111",
                            whiteSpace: "pre-wrap",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",

                            whiteSpace: "normal",
                            "& p": {
                                margin: 0,
                                marginBottom: "0.6em",
                            },

                            "& p:last-child": {
                                marginBottom: 0,
                            },

                            "& pre": {
                                margin: "8px 0",
                                padding: "10px",
                                borderRadius: "8px",
                                overflowX: "auto",
                                backgroundColor: "#eee",
                            },

                            "& code": {
                                fontFamily: "monospace",
                                fontSize: "0.9em",
                            },
    
                        }}
                        >
                        <ReactMarkdown
                        components={{
                            p: ({ children }) => <p style={{ margin: 0 }}>{children}</p>,
                        }}>
                            {"Hi! I am your IBA Assistant! I am here to help you with any questions you may have. I already have access to your commission document and your business analytics. How can I assist you today?"}</ReactMarkdown>
                        </Box>
                    </Box>
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
                            maxWidth: "75%",
                            py: 1.2,
                            px: 2,
                            borderRadius: 2.5,
                            bgcolor: msg.role === "user" ? "#1976d2" : "#f5f5f5",
                            color: msg.role === "user" ? "#fff" : "#111",
                            whiteSpace: "pre-wrap",
                            boxShadow: msg.role === "user"
                                ? "0 1px 2px rgba(0,0,0,0.2)"
                                : "0 1px 3px rgba(0,0,0,0.08)",

                            whiteSpace: "normal",
                            "& p": {
                                margin: 0,
                                marginBottom: "0.6em",
                            },

                            "& p:last-child": {
                                marginBottom: 0,
                            },

                            "& pre": {
                                margin: "8px 0",
                                padding: "10px",
                                borderRadius: "8px",
                                overflowX: "auto",
                                backgroundColor: msg.role === "user" ? "#1565c0" : "#eee",
                            },

                            "& code": {
                                fontFamily: "monospace",
                                fontSize: "0.9em",
                            },
    
                        }}
                        >
                        <ReactMarkdown
                        components={{
                            p: ({ children }) => <p style={{ margin: 0 }}>{children}</p>,
                        }}>
                            {msg.text}</ReactMarkdown>
                        </Box>
                    </Box>
                    ))}

                    {loading && messages[messages.length - 1]?.text === "" && (
                    <Stack direction="row" spacing={1} alignItems="center">
                        <CircularProgress size={14} />
                        <Typography variant="caption">Assistant is typing...</Typography>
                    </Stack>
                    )}

                    <div ref={bottomRef} />
                </Container>

                {/* Input box */}
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <TextField
                    fullWidth
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Message..."
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                     sx={{
                        "& .MuiOutlinedInput-root": {
                            boxShadow: "0 0 10px rgba(25,118,210,0.4)",
                            "& fieldset": {
                            borderColor: "rgba(25,118,210,0.6)",
                            },
                        },
                        }}
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
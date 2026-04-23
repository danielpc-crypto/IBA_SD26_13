import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import DashboardHandler from "./DashboardHandler";
import Start from "./Start";
import Signup from "./Signup";
import Login from "./Login";
import Profile from "./Profile";
import GeminiAssistant from "./GeminiAssistant";
import ViewDocument from "./ViewDocument";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1a73e8",
      light: "#4791db",
      dark: "#115293",
    },
    secondary: {
      main: "#0d47a1",
    },
    background: {
      default: "#f5f7fa",
    },
  },
  typography: {
    fontFamily: "'Inter', 'Segoe UI', 'Roboto', sans-serif",
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 8,
          padding: "10px 24px",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Start />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<DashboardHandler />} />
          <Route path="/assistant" element={<GeminiAssistant />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/view-document" element={<ViewDocument />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;

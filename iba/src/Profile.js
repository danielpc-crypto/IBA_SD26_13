

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Paper,
  Container,
  Stack,
  Divider,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [logoutOpen, setLogoutOpen] = useState(false);

    const handleLogout = () => {
      localStorage.removeItem("user");
      setLogoutOpen(false);
      navigate("/");
    };

    useEffect(() => {
        const stored = localStorage.getItem("user");
        if (stored) {
            setUser(JSON.parse(stored));
        } else {
            navigate("/login");
        }
    }, [navigate]);

    return (
        <div>
            <div style={{ marginBottom: "20px"}}>
                <Container>
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
            <Box
                sx={{
                    minHeight: '100vh',
                    backgroundColor: '#f4f6f8',
                    py: 6,
                    paddingTop: '80px'
                }}
            >
                <Container maxWidth="md">
                    <Box sx={{ mb: 5 }}>
                        <Typography variant="h4" fontWeight={600} gutterBottom>
                            Profile
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            View your account information.
                        </Typography>
                    </Box>

                    <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
                        {user ? (
                            <Stack spacing={3}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
                                        <PersonIcon sx={{ fontSize: 36 }} />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h5" fontWeight={600}>
                                            {user.firstName} {user.lastName}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            @{user.username}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Divider />

                                <Stack spacing={2}>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">First Name</Typography>
                                        <Typography variant="body1">{user.firstName}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Last Name</Typography>
                                        <Typography variant="body1">{user.lastName}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Username</Typography>
                                        <Typography variant="body1">{user.username}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">Email</Typography>
                                        <Typography variant="body1">{user.email}</Typography>
                                    </Box>
                                </Stack>
                            </Stack>
                        ) : (
                            <Typography color="text.secondary">
                                No profile data available. Please log in.
                            </Typography>
                        )}
                    </Paper>
                </Container>
            </Box>

            <Dialog open={logoutOpen} onClose={() => setLogoutOpen(false)}>
              <DialogTitle>Log Out</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Are you sure you want to log out?
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setLogoutOpen(false)}>Cancel</Button>
                <Button onClick={handleLogout} variant="contained" sx={{ backgroundColor: '#1a73e8' }}>Yes, Log Out</Button>
              </DialogActions>
            </Dialog>
        </div>
    );
}

export default Profile;
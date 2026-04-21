

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
import Header from './Header';

function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [open, setOpen] = useState(false);
    const [logoutOpen, setLogoutOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');

    const handleLogout = () => {
      localStorage.removeItem("user");
      setLogoutOpen(false);
      navigate("/");
    };

    const handleDeleteUser = async () => {
      try {
        const response = await fetch('http://localhost:5000/users', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: user.username,
            password: deletePassword
          })
        });

        if (response.ok) {
          localStorage.removeItem("user");
          setDeleteOpen(false);
          navigate("/");
        } else {
          alert('Failed to delete account. Please check your password.');
        }
      } catch (error) {
        console.error('Error deleting account:', error);
        alert('An error occurred while deleting your account.');
      }
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
            <Header open={open} setOpen={setOpen} />
            <Box
                sx={{
                    minHeight: '100vh',
                    backgroundColor: '#f4f6f8',
                    py: 6,
                    width: open ? 'calc(100% - 240px)' : '100%', marginLeft: open ? '240px' : '0px',transition: 'margin 0.3s ease',
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

                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={() => setDeleteOpen(true)}
                        >
                            Delete Account
                        </Button>
                    </Box>
                </Container>
            </Box>

            <Dialog open={deleteOpen} onClose={() => { setDeleteOpen(false); setDeletePassword(''); }}>
              <DialogTitle>Delete Account</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Are you sure you want to delete your account? This action cannot be undone. Please enter your password to confirm.
                </DialogContentText>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    marginTop: '15px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxSizing: 'border-box'
                  }}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => { setDeleteOpen(false); setDeletePassword(''); }}>Cancel</Button>
                <Button onClick={handleDeleteUser} variant="contained" color="error">Delete Account</Button>
              </DialogActions>
            </Dialog>
        </div>
    );
}

export default Profile;
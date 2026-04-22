import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Container,
  Box,
  Toolbar,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  AppBar,
  CssBaseline,
} from '@mui/material';

import Menu from '@mui/icons-material/Menu';

function Header({open, setOpen}){ 
    const navigate = useNavigate();
    const [logoutOpen, setLogoutOpen] = useState(false);

    const handleLogout = () => {
      localStorage.removeItem("user");
      setLogoutOpen(false);
      navigate("/");
    };

    return (
        <div>
            <div style={{ marginBottom: "10px"}}>
                <Container>
                    <nav className="navbar navbar-expand-lg fixed-top bg-body-tertiary" style={{width: open ? 'calc(100% - 240px)' : '100%', marginLeft: open ? '240px' : '0px', transition: 'margin 0.3s ease',}} data-bs-theme="dark">
                        <div className="container-fluid">
                            <IconButton color="inherit" aria-label="open drawer" onClick={()=>setOpen(!open)} edge="start" sx={{ mr: 2 }}>
                                <Menu />
                            </IconButton>
                            <a className="navbar-brand" href="#" onClick={(e) => { e.preventDefault(); setLogoutOpen(true); }}>Intelligent Business Analyzer</a>
                            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                                <span className="navbar-toggler-icon"></span>
                            </button>
                            <div className="collapse navbar-collapse" id="navbarNav">
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
                {/* <Box sx={{ display: 'flex'}}>
                    <CssBaseline />
                    <AppBar position="static" sx={{ backgroundColor: '#1a73e8' }}>
                        <Toolbar variant="dense">
                            <IconButton color="inherit" aria-label="open drawer" onClick={handleDrawerOpen} edge="start" sx={{ mr: 2, display: { sm: 'none' } }}>
                                <Menu />
                            </IconButton>
                        </Toolbar>
                    </AppBar> */}

                    <Drawer anchor="left" variant="persistent" open={open} sx={{width: 240, flexShrink: 0, '& .MuiDrawer-paper': { width: 240,boxSizing: 'border-box',},}}>
                        <List>
                            <ListItem disablePadding>
                                <ListItemButton>
                                    <Avatar src="pictures/default.png" alt="Profile" onClick={() => navigate("/profile")} sx={{ width: 60, height: 60, backgroundColor: "#212529"}} />
                                </ListItemButton>
                            </ListItem>
                            <ListItem>
                                <ListItemButton>
                                    <ListItemText primary="Dashboard" onClick={() => navigate("/dashboard")} />
                                </ListItemButton>
                            </ListItem>
                            <ListItem>
                                <ListItemButton>
                                    <ListItemText primary="IBA Assistant" onClick={() => navigate("/assistant")} />
                                </ListItemButton>
                            </ListItem>

                        </List>
                    </Drawer>
            </div>

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

export default Header;
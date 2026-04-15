import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';

function Header(){ 
    const navigate = useNavigate();
    const [logoutOpen, setLogoutOpen] = useState(false);

    const handleLogout = () => {
      localStorage.removeItem("user");
      setLogoutOpen(false);
      navigate("/");
    };

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
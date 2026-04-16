import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  Dialog,
  Slide,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { SmartToy, East } from '@mui/icons-material'

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function FullDashboard(){
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(null);
    const [businessRules, setBusinessRules] = useState(null);
    const [result, setResult] = useState('');
    const [logoutOpen, setLogoutOpen] = useState(false);
    const [data, setData] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogContent, setDialogContent] = useState({ title: '', content: '' });
    const user = localStorage.getItem("user");
    const parsedUser = JSON.parse(user);
    const flags = JSON.parse(localStorage.getItem("flags")) || {
        supplier_name: "",
        contract_start: "",
        non_pay: false,
        chargeback: false,
        variance_com_drop: false
    };

    const handleClickOpen = (clicked) => {
        setDialogOpen(true);
        switch (clicked){
            case 1:
                setDialogContent({title:"Non-Pay Flag", content:"This flag identifies an account that did not make a payment in the current month."});
                break;
            case 2:
                setDialogContent({title:"Chargeback Flag", content:"This flag identifies a negative commision in the current month which indicates a supplier chargeback."});
                break;
            case 3:
                setDialogContent({title:"Variance Flag", content:"Also known as the commission drop flag. This flag identifies a significant commissions drop between the current month and the previous month. If this is flagged, seek investigation by a professional."});
                break;
        }
    };

    const handleChattingAssistant = () => {
        navigate("/assistant");
    }

    const handleClose = () => {
        setDialogOpen(false);
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

    return(
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
            <Box
                sx={{
                minHeight: '100vh',
                backgroundColor: '#f4f6f8',
                py: 6,
                paddingTop: '80px' // to account for fixed navbar
                }}
            >
                <Container maxWidth="lg">
                    {/* Header */}
                    <Box sx={{ mb: 5 }}>
                        <Typography variant="h4" fontWeight={600} gutterBottom>
                        Welcome Back, {parsedUser.firstName}! 
                        </Typography>
                    </Box>
                    <Grid container direction="row" spacing={2} sx={{alignItems: "stretch",}}>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Paper elevation={3} sx={{ p: 4, borderRadius: 3, mb: 4 }}>
                                <Stack spacing={3}>
                                    <Typography variant="h6" fontWeight={500}>
                                    Case Summary
                                    </Typography> 
                                    <Divider />
                                    <Typography variant="body1" color="text.secondary">
                                        Supplier: {flags.supplier_name || "N/A"}
                                    </Typography>

                                    <Typography variant="body1" color="text.secondary">
                                        Contract Start Date: {flags.contract_start || "N/A"}
                                    </Typography>
                                </Stack>
                            </Paper>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 8 }}>
                                <Paper elevation={3} sx={{ p: 4, borderRadius: 3, mb: 4 }}>
                                    <Stack spacing={3}>
                                        <Typography variant="h6" fontWeight={500}>
                                            Flags Found
                                        </Typography>
                                        <Divider />
                                        <Typography variant="body1" color="text.secondary">
                                            If your commission data shows a significant drop compared to historical trends, it may indicate potential issues such as non-payment or chargebacks. This could be a red flag for supplier performance or financial stability.
                                        </Typography>
                                        
                                        <Stack direction="row" spacing={1}>
                                            <Chip clickable onClick={() => handleClickOpen(1)} label={`Non-Pay: ${flags.non_pay ? "Yes" : "No"}`} color={flags.non_pay ? "error" : "success"} />
                                            <Chip clickable onClick={() => handleClickOpen(2)} label={`Chargeback: ${flags.chargeback ? "Yes" : "No"}`} color={flags.chargeback ? "error" : "success"} />
                                            <Chip clickable onClick={() => handleClickOpen(3)} label={`Variance in Commission Drop: ${flags.variance_com_drop ? "Yes" : "No"}`} color={flags.variance_com_drop ? "error" : "success"} />
                                        </Stack>
                                    </Stack>
                                </Paper>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                <Paper elevation={3} sx={{ p: 4, borderRadius: 3, mb: 4 }}>
                                    <Stack spacing={3}>
                                        <Typography variant="h6" fontWeight={500}>
                                            Fairness Score
                                        </Typography>
                                        <Divider />
                                        <Stack direction="row" spacing={2}>
                                            <Box sx={{ position: "relative", display: "inline-flex" }}>
      
                                            {/* Progress circle */}
                                            <CircularProgress variant="determinate" value={flags.fairness} size={80} thickness={5} color={flags.fairness > 80 ? "success" : "error"}/>

                                            {/* Center label */}
                                            <Box
                                                sx={{
                                                top: 0,
                                                left: 0,
                                                bottom: 0,
                                                right: 0,
                                                position: "absolute",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                }}
                                            >
                                                <Typography
                                                variant="body1"
                                                component="div"
                                                color="text.secondary"
                                                >
                                                {`${Math.round(flags.fairness[0])}%`}
                                                </Typography>
                                            </Box>

                                            </Box>
                                            <Typography variant="body1" color="text.secondary">
                                                Your fairness score is... 
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                </Paper>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                <Paper elevation={3} sx={{ p: 4, borderRadius: 3, mb: 4 }}>
                                    <Stack spacing={3}>
                                    <Typography variant="h6" fontWeight={500}>
                                        <SmartToy /> Chat with IBA Assistant
                                    </Typography>
                                        <Divider />
                                        <Button onClick={handleChattingAssistant} size="small" variant="contained" endIcon={<East />}>
                                            Get Started
                                        </Button>
                                    </Stack>
                                </Paper>
                            </Grid>
                    </Grid>
                </Container>
            </Box>
            <Dialog
                open={dialogOpen}
                slots={{
                transition: Transition,
                }}
                keepMounted
                onClose={handleClose}
                aria-describedby="alert-dialog-slide-description"
                role="alertdialog"
            >
                <DialogTitle>{dialogContent.title}</DialogTitle>
                <Divider/>
                <DialogContent>
                <DialogContentText id="alert-dialog-slide-description">
                    {dialogContent.content}
                </DialogContentText>
                </DialogContent>
                <DialogActions>
                <Button onClick={handleClose} autoFocus>
                    Got It!
                </Button>
                </DialogActions>
            </Dialog>
    
        </div>
    );
}

export default FullDashboard;
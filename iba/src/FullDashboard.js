import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./start.css"
import ReactMarkdown from 'react-markdown';
import {
  Box,
  Button,
  Typography,
  Paper,
  Container,
  Stack,
  Card,
  CardContent,
  CardActionArea,
  Popover,
  Chip,
  Divider,
  Grid,
  CircularProgress,
  Dialog,
  Slide,
  DialogTitle,
  popoverContent,
  popoverContentText,
  DialogActions
} from '@mui/material';
import { SmartToy, East } from '@mui/icons-material'
import { LineChart } from '@mui/x-charts/LineChart';
import Header from './Header';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});


const QuickFactsCard = ({ title, value, color }) => (
<Card
    elevation={0}
    sx={{
        border: "1px solid #e5e7eb",
        borderRadius: 3,
        p: 3,
        bgcolor: "white",
        background: `linear-gradient(to right, ${color}12, #ffffff)`,
        transition: "0.2s ease",
        "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
        },

    }}
>
    <Typography variant="caption" color="text.secondary">
    {title}
    </Typography>
    <Typography variant="h6" fontWeight={600}>
    {value || "N/A"}
    </Typography>
</Card>
);



const Flag = ({ label, value }) => (
    <Chip
        label={`${label}: ${value ? "Yes" : "No"}`}
        color={value ? "error" : "success"}
        variant="outlined"
        clickable
        sx={{
        fontWeight: 500,
        borderRadius: 2,
        }}
    />
    );

function FullDashboard(){
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(null);
    const [businessRules, setBusinessRules] = useState(null);
    const [result, setResult] = useState('');
    const [logoutOpen, setLogoutOpen] = useState(false);
    const [data, setData] = useState([]);
    const [open, setOpen] = useState(false);
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [popoverContent, setPopoverContent] = useState({ content: '' });
    const currMonth = new Date().getMonth();
    const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const xLabels = [month[(currMonth - 5 + 12) % 12], month[(currMonth - 4 + 12) % 12], month[(currMonth - 3 + 12) % 12], month[(currMonth - 2 + 12) % 12], month[(currMonth - 1 + 12) % 12], month[currMonth]];
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
        setPopoverOpen(true);
        switch (clicked){
            case 1:
                setPopoverContent({title:"Non-Pay Flag", content:"This flag identifies an account that did not make a payment in the current month."});
                break;
            case 2:
                setPopoverContent({title:"Chargeback Flag", content:"This flag identifies a negative commision in the current month which indicates a supplier chargeback."});
                break;
            case 3:
                setPopoverContent({title:"Variance Flag", content:"Also known as the commission drop flag. This flag identifies a significant commissions drop between the current month and the previous month. If this is flagged, seek investigation by a professional."});
                break;
        }
    };

    const handleChattingAssistant = () => {
        navigate("/assistant");
    }

    const handleClose = () => {
        setPopoverOpen(false);
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
            <Header open={open} setOpen={setOpen}></Header>
            <Box
            sx={{
                minHeight: "100vh",
                bgcolor: "#f7f8fa",
                pt: 10,
                pl: open ? "260px" : 0,
                transition: "all 0.3s ease",
            }}
            >
            <Container maxWidth="lg">
                
                {/* ================= HEADING ================= */}
                <Grid container spacing={4} alignItems="stretch" sx={{ mb: 6 }}>
                    <Grid item xs={12} lg={8}>
                        <Box sx={{ mb: 6 }}>
                        <Typography
                            variant="h4"
                            fontWeight={700}
                            sx={{ letterSpacing: "-0.03em" }}
                        >
                            Welcome back, {parsedUser.firstName}
                        </Typography>

                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Supplier analytics overview and performance monitoring
                        </Typography>
                        </Box>
                        </Grid>
                {/* ================= QUICK FACTS SECTION ================= */}
                    

                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                    <QuickFactsCard title="Supplier Name " value={flags.supplier_name} color="#4f46e5" />
                    </Grid>
                    <Grid item xs={12} md={4}>
                    <QuickFactsCard title="Contract Start " value={flags.contract_start} color="#0ea5e9" />
                    </Grid>
                    <Grid item xs={12} md={4}>
                    <QuickFactsCard title="Term (Months) " value={flags.contract_term_months} color="#10b981" />
                    </Grid>
                </Grid>
                <Grid container spacing={3} alignItems="stretch" sx={{ mt: 1 }}>
                <Grid item xs={12} lg={4}>
                        <Paper
                            elevation={0}
                            sx={{
                            p: 4,
                            borderRadius: 3,
                            bgcolor: "#fff",
                            border: "1px solid #eef0f3",
                            }}
                        >
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                        Fairness Score
                        </Typography>

                        <Box sx={{ position: "relative", display: "flex", justifyContent: "center" }}>
                            <CircularProgress
                            variant="determinate"
                            value={flags.fairness}
                            size={85}
                            thickness={5}
                            sx={{ color: "#4f46e5" }}
                            />
                            <Box
                            sx={{
                                position: "absolute",
                                inset: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                            >
                            <Typography fontWeight={700}>
                                {Math.round(flags.fairness)}%
                            </Typography>
                            </Box>
                        </Box>
                        </Paper>
                        </Grid>
                        <Grid item xs={12} lg={4}>
                        <Paper
                        elevation={0}
                        sx={{
                        p: 4,
                        borderRadius: 3,
                        bgcolor: "#fff",
                        border: "1px solid #eef0f3",
                        height: "100%",
                        }}
                    >
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                        Risk Flags
                        </Typography>

                        <Stack direction="row" spacing={1} flexWrap="wrap">
                            <Flag label="Non-Pay" onClick={() => handleClickOpen(1)} value={flags.non_pay} />
                            <Flag label="Chargeback" onClick={() => handleClickOpen(2)} value={flags.chargeback} />
                            <Flag label="Variance Drop" onClick={() => handleClickOpen(3)} value={flags.variance_com_drop} />
                        </Stack>
                    </Paper>
                        </Grid>
                        </Grid>
                </Grid>

                {/* ================= ANALYTICS SECTION ================= */}
                <Box sx={{ mb: 7 }}>
                <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
                    Payments Trend
                </Typography>

                <Paper
                    elevation={0}
                    sx={{
                    p: 4,
                    borderRadius: 3,
                    bgcolor: "#fff",
                    border: "1px solid #eef0f3",
                    }}
                >
                    <LineChart
                    xAxis={[{ data: xLabels, scaleType: "point" }]}
                    series={[
                        {
                        data: [
                            flags.prior_month_5_commission,
                            flags.prior_month_4_commission,
                            flags.prior_month_3_commission,
                            flags.prior_month_2_commission,
                            flags.last_month_commission,
                            flags.current_month_commission,
                        ],
                        showMark: false,
                        color: "#4f46e5",
                        },
                    ]}
                    height={280}
                    />
                </Paper>
                </Box>

                <Box sx={{ mb: 8 }}>
                <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
                    AI Support
                </Typography>

                <Paper
                    elevation={0}
                    sx={{
                    p: 4,
                    borderRadius: 3,
                    bgcolor: "#fff",
                    border: "1px solid #eef0f3",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    }}
                >
                    <Stack spacing={1}>
                    <Typography fontWeight={600}>
                        <SmartToy sx={{ mr: 1 }} />
                        Chat with Assistant
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Ask questions about supplier performance and anomalies
                    </Typography>
                    </Stack>

                    <Button
                    onClick={handleChattingAssistant}
                    variant="contained"
                    endIcon={<East />}
                    sx={{
                        borderRadius: 2,
                        background: "#4f46e5",
                        px: 3,
                    }}
                    >
                    Open Chat
                    </Button>
                </Paper>
                </Box>

            </Container>
            </Box>
            <Popover
                id= 'simple-popover'
                open={popoverOpen}
                onClose={handleClose}
                anchorPosition={{ top: 200, left: 400 }}
                anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
                }}
            >
                {popoverContent.content}
            </Popover>
        <footer className="site-footer">
          <p>&copy; 2026 Intelligent Business Analyzer</p>
          <p>Please note that this is purely based off of predictive modeling and general business rules. For a better tailored experience, please reach out to a local financial analyst or legal professional.</p>
        </footer>

        </div>
    );
}

export default FullDashboard;
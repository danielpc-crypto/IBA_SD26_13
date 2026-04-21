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
  CircularProgress,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DescriptionIcon from '@mui/icons-material/Description';
import * as XLSX from 'xlsx';
import { LocalFireDepartmentSharp } from '@mui/icons-material';
import Header from './Header';


const excelToText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0]; // Get first sheet
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to Markdown-like text which Gemini understands well
      const json = XLSX.utils.sheet_to_csv(worksheet); 
      resolve(json);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

function UploadDashboard({ onUploadSuccess }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [businessRules, setBusinessRules] = useState(null);
  const [result, setResult] = useState('');
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [data, setData] = useState([]);
  const [s3Url, setS3Url] = useState("");
  const user = localStorage.getItem("user");
  // const [flags, setFlags] = useState({});

  const handleLogout = () => {
    localStorage.removeItem("user");
    setLogoutOpen(false);
    navigate("/");
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [navigate]);

  const handleFileChange = (event) => {
    const f = event.target.files[0] || null;
    setFile(f);
  };

  const handleBusinessRulesChange = (event) => {
    const businessRules = event.target.files[0];
    setBusinessRules(businessRules);
  };

  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) return resolve(null);
      try {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (err) => reject(err);
        reader.readAsText(file);
      } catch (err) {
        reject(err);
      }
    });
  };

  const handleUpload = async () => {
    if (!file) return;
    const userInfo = JSON.parse(user);
    const formData = new FormData();
    formData.append("file", file);
    localStorage.setItem("file", file);

    /**
     * 
     * UPLOADING FILE TO MODEL AND GETTING RESPONSE
     * 
    */
    try{
      const res = await fetch("http://localhost:8000/upload-data", {
        method: "POST",
        body: formData,
      });
      const resultingFlags = await res.json();
      if(resultingFlags.error){
        console.error("Model processing error:", resultingFlags.error);
        alert("File does not include required columns: " + resultingFlags.error);
        return;
      }
      setData(resultingFlags);
      localStorage.setItem("flags", JSON.stringify(resultingFlags));
    } catch (err) {
      console.error("File to model upload error:", err);
    }

    /**
     * 
     * STORE DOCUMENT IN S3 BUCKET
     * 
     */
    try {
      formData.append("username", userInfo.username);
      const res =await fetch("http://localhost:5000/upload/bucket", {
        method: "POST",
        body: formData,
      });
      const urlData = await res.json();
      console.log("File uploaded to S3 at URL:", urlData.file_url);
      localStorage.setItem("s3_url", urlData.file_url);
      try{
        const res = await fetch(`http://localhost:5000/data_uploaded/${userInfo.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ s3_url: urlData.file_url }),
        });
        const data = await res.json();
        console.log(data);
    } catch (err) {
      console.error("Error updating user data upload status:", err);
    }
    } catch (err) {
      console.error("Error uploading file to S3:", err);
    }


    /**
     * 
     * STORING FLAGS IN DATABASE
     * 
    */
    try {
      const flags = JSON.parse(localStorage.getItem("flags"));
      const res = await fetch(`http://localhost:5000/stored_flags/${userInfo.id}`,{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          non_pay: flags.non_pay, 
          chargeback: flags.chargeback, 
          variance_com_drop: flags.variance_commission_drop, 
          anomaly_score: flags.anomaly_score, 
          anomaly_pred: flags.anomaly_pred, 
          supplier_name: flags.supplier_name, 
          contract_start_date: flags.contract_start_date, 
          fairness: flags.fairness,
          current_month_commission: flags.current_month_commission,
          last_month_commission: flags.last_month_commission,
          prior_month_2_commission: flags.prior_month_2_commission,
          prior_month_3_commission: flags.prior_month_3_commission,
          prior_month_4_commission: flags.prior_month_4_commission,
          prior_month_5_commission: flags.prior_month_5_commission,
          contract_term_months: flags.contract_term_months,
          account_age_months: flags.account_age_months,}),
      });
      const data = await res.json();
      console.log("Flags stored response:", data);
      } catch (err) {
        console.error("Error processing model response:", err);
      }


    /**
     * 
     * UPDATING USER DATA TO INDICATE DATA HAS BEEN UPLOADED BY USER
     * 
    */
    

    // const fileContent = await excelToText(file); // CSV/text from Excel
    // const bR = businessRules ? await readFileAsText(businessRules) : null; // business rules as plain text
    //console.log(fileContent);

    onUploadSuccess(); // Notify parent to refresh dashboard view
    // try {
    //     setLoading(true);
    //     //const response = await getResponse(fileContent, bR);
    //     const response = "placeholder response";
    //     setLoading(false);
    //     const base64ToUtf8 = (base64) => {
    //       try {
    //         const binary = atob(base64);
    //         const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    //         return new TextDecoder().decode(bytes);
    //       } catch (e) {
    //         return base64;
    //       }
    //     };

    //     const extractReadable = (res) => {
    //       if (!res) return null;
    //       const candidate = res.candidates && res.candidates[0];
    //       if (candidate && candidate.content && Array.isArray(candidate.content.parts)) {
    //         const parts = candidate.content.parts.map((p) => {
    //           if (!p) return '';
    //           if (typeof p === 'string') return p;
    //           if (p.text) return p.text;
    //           if (p.attachment && p.attachment.data) return base64ToUtf8(p.attachment.data);
    //           return '';
    //         });
    //         return parts.filter(Boolean).join('\n\n');
    //       }
    //       // fallback: try older output shape
    //       if (res.output && Array.isArray(res.output) && res.output[0] && res.output[0].content) {
    //         return JSON.stringify(res.output[0].content);
    //       }
    //       return JSON.stringify(res, null, 2);
    //     };

    //     const readable = extractReadable(response);
    //     setResult(readable || 'No readable content in response');
    // } catch (error) {
    //   console.error('Upload error:', error);
    // }
  };
  return (
    <div>
    <Header></Header>
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f4f6f8',
        py: 6,
        paddingTop: '80px' // to account for fixed navbar
      }}
    >
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Business Anomaly Detection
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Upload your business dataset and optionally provide business rules.
            The AI will analyze and detect anomalies.
          </Typography>
        </Box>

        {/* Upload Section */}
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3, mb: 4 }}>
          <Stack spacing={3}>
            <Typography variant="h6" fontWeight={500}>
              Upload Files
            </Typography>

            <Divider />

            {/* Business Data */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                variant="contained"
                startIcon={<UploadFileIcon />}
                component="label"
              >
                Upload Business Data
                <input hidden type="file" onChange={handleFileChange} />
              </Button>

              {file && (
                <Chip
                  icon={<DescriptionIcon />}
                  label={file.name}
                  color="primary"
                  variant="outlined"
                />
              )}
            </Stack>


            {/* Upload Button */}
            <Box sx={{ pt: 2 }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleUpload}
                disabled={!file || loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Analyze Data"}
              </Button>
            </Box>
          </Stack>
        </Paper>

      </Container>
    </Box>
    </div>
  );
}

export default UploadDashboard;
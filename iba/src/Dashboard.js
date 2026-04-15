import { useState, useEffect } from 'react';
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
import { GoogleGenAI } from "@google/genai";
import * as XLSX from 'xlsx';
import Header from './Header';

const ai = new GoogleGenAI({
  //INSERT KEY HERE
    apiKey: process.env.REACT_APP_GOOGLE_GENAI_KEY
});


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


async function getResponse(input, businessRules) {
  // The SDK accepts plain text parts (strings). Ensure we pass strings only.
  const parts = [];
  if (input) parts.push(input);
  if (businessRules) parts.push(businessRules);
  parts.push("Use the business rules to detect anomalies in the input and explain them.");

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: parts,
  });
  return response;
}

function Dashboard(){
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [businessRules, setBusinessRules] = useState(null);
  const [result, setResult] = useState('');

  useEffect(() => {
    const user = localStorage.getItem("user");
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
    const fileContent = await excelToText(file); // CSV/text from Excel
    const bR = businessRules ? await readFileAsText(businessRules) : null; // business rules as plain text
    //console.log(fileContent);
    try {
        setLoading(true);
        const response = await getResponse(fileContent, bR);
        setLoading(false);
        const base64ToUtf8 = (base64) => {
          try {
            const binary = atob(base64);
            const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
            return new TextDecoder().decode(bytes);
          } catch (e) {
            return base64;
          }
        };

        const extractReadable = (res) => {
          if (!res) return null;
          const candidate = res.candidates && res.candidates[0];
          if (candidate && candidate.content && Array.isArray(candidate.content.parts)) {
            const parts = candidate.content.parts.map((p) => {
              if (!p) return '';
              if (typeof p === 'string') return p;
              if (p.text) return p.text;
              if (p.attachment && p.attachment.data) return base64ToUtf8(p.attachment.data);
              return '';
            });
            return parts.filter(Boolean).join('\n\n');
          }
          // fallback: try older output shape
          if (res.output && Array.isArray(res.output) && res.output[0] && res.output[0].content) {
            return JSON.stringify(res.output[0].content);
          }
          return JSON.stringify(res, null, 2);
        };

        const readable = extractReadable(response);
        setResult(readable || 'No readable content in response');
    } catch (error) {
      console.error('Upload error:', error);
    }
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

            {/* Business Rules */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                variant="outlined"
                component="label"
              >
                Upload Business Rules (Optional)
                <input hidden type="file" onChange={handleBusinessRulesChange} />
              </Button>

              {businessRules && (
                <Chip
                  icon={<DescriptionIcon />}
                  label={businessRules.name}
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

        {/* Results Section */}
        <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={500} gutterBottom>
            Analysis Results
          </Typography>

          <Divider sx={{ mb: 3 }} />

          {!result ? (
            <Typography color="text.secondary">
              No results yet. Upload a file and click Analyze.
            </Typography>
          ) : (
            <Box
              sx={{
                backgroundColor: '#fafafa',
                p: 3,
                borderRadius: 2,
                maxHeight: 400,
                overflowY: 'auto'
              }}
            >
              <ReactMarkdown>{result}</ReactMarkdown>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
    </div>
  );
}

export default Dashboard;
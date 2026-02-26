import { ChangeEvent, useState } from 'react';
import './App.css';
import { GoogleGenAI } from "@google/genai";
import * as XLSX from 'xlsx';

const ai = new GoogleGenAI({
  //INSERT KEY HERE
    apiKey: ""
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

async function fileToGenerativePart(file) {
  const base64EncodedDataPromise = new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]); // Extract base64 part
    reader.readAsDataURL(file);
  });

  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
}

async function getResponse(input, businessRules) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [input, businessRules, "Use the business rules to detect anomalies in the input and explain them."],
  });
  return response;   
}

function App(){
  const [file, setFile] = useState(null);
  const [businessRules, setBusinessRules] = useState(null);
  const [result, setResult] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setFile(file);
  };

  const handleBusinessRulesChange = (event) => {
    const businessRules = event.target.files[0];
    setBusinessRules(businessRules);
  };

  const handleUpload = async () => {
    if(!file) {
      return;
    }
    const fileContent = await excelToText(file); // convert file to generative part
    const bR = await fileToGenerativePart(businessRules); // convert business rules file to generative part
    //console.log(fileContent);
    try {
      const response = await getResponse(fileContent, bR); 
      setResult(response);
    } catch (error) {
      console.error('Upload error:', error);
    }
  };
   return (
    <><div className="upload-container">
       <input
         type="file"
         onChange={handleFileChange} />
     </div>
      <div className="upload-bR-container">
        <input
          type="file"
          onChange={handleBusinessRulesChange} />
          <button onClick={handleUpload}>
            Upload
          </button>
      </div>
     <div className="response-container">
       <p>{result}</p>

      </div></>
  );
}

export default App;

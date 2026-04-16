# IBA_SD26_13
ISU Senior Design Project Team 13 - Intelligent Business Analyzer

# Configuration
To run the server:
``bash
cd backend
node server.js
``
Note: make sure you have the gemini api key in a .env file in your backend folder

To run the model:
``bash
cd mlmodel
python -m uvicorn modelapi:app --reload
``
If you don't have uvicorn installed:
pip install uvicorn

To run the frontend:
``bash 
cd iba
npm start
``

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Add global styles
const globalStyles = document.createElement('style');
globalStyles.innerHTML = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
  
  * {
    box-sizing: border-box;
  }
  
  body {
    margin: 0;
    padding: 0;
    font-family: 'Poppins', 'Roboto', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #f8fafc;
    color: #171717;
  }
  
  #root {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }
  
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #bbf7d0;
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: #16a34a;
  }
`;
document.head.appendChild(globalStyles);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

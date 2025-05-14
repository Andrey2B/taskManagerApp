import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import './assets/styles/fonts.css';
import './assets/styles/variables.css';
import './assets/styles/global.css';

// Импортируем AuthProvider
import { AuthProvider } from './context/AuthContext';
import { CustomThemeProvider } from './context/ThemeContext';
import { ProjectProvider } from './context/ProjectContext';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <CustomThemeProvider>
        <ProjectProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ProjectProvider>
      </CustomThemeProvider>
    </AuthProvider>

  </React.StrictMode>
);



reportWebVitals();

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './csses/index.css';
import App from './App.jsx';
import AuthorPage from './pages/AuthorPage';
import ReviewerPage from './pages/ReviewerPage.jsx';
import EditorPage from './pages/EditorPage.jsx';
import QueryPage from './pages/QueryPage.jsx';
import LogPage from './pages/LogPage.jsx';
import MessagePage from './pages/MessagePage.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/yazar" element={<AuthorPage />} />
        <Route path="/hakem" element={<ReviewerPage />} />
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/query" element={<QueryPage />} />
        <Route path="/log" element={<LogPage/>} />
        <Route path="/message" element={<MessagePage/>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);

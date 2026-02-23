import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ClerkProvider } from '@clerk/clerk-react';
const PUBLISHABLE_KEY = "pk_test_bW9yYWwtY3ViLTQyLmNsZXJrLmFjY291bnRzLmRldiQ";
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
    <App />
  </ClerkProvider>
);

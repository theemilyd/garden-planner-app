import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// Import mobile test utility in development mode
if (process.env.NODE_ENV === 'development') {
  import('./utils/mobileTest').then(module => {
    window.runMobileTests = module.default;
    console.log('%c Mobile test utility loaded. Run window.runMobileTests() in console to test mobile optimizations.', 'background: #4A7C59; color: white; padding: 4px;');
  });
}

// Add a fallback for localStorage
const localStorageAvailable = () => {
  try {
    const storage = window.localStorage;
    const x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return false;
  }
};

if (!localStorageAvailable()) {
  window.localStorage = {
    _data: {},
    setItem(id, val) { this._data[id] = String(val); },
    getItem(id) { return this._data[id] || null; },
    removeItem(id) { delete this._data[id]; },
    clear() { this._data = {}; }
  };
  console.warn('localStorage not available, using fallback implementation.');
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// Register service worker for offline functionality
serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
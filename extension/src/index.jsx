//*global chrome */
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './css/navigation.css';
import './css/footer.css';
import 'bootstrap/dist/css/bootstrap.css';
import App from './App';

//Environment Variables
// require('dotenv').config();


//get query paramters
const query = window.location.href
  .replace(/.*index.html\/\?/gmi, '')
  .replace(/.*index.html\?/gmi, '')
  .replace(/index.html/gmi, '')
  //.replace(chrome.runtime.getURL("/"), '');


const full_screen = query.indexOf("fullscreen=true") !== -1;


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <App fullScreen={full_screen} />
);
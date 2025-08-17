/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react'; // <--- 请把这一行添加进去
import {createRoot} from 'react-dom/client';
import App from './App.jsx';
import './main.css';

createRoot(document.getElementById('root')).render(<App />);

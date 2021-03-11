import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from 'react-router-dom';
import Header from './app/components/Header';
import Routes from './app/routes/Routes';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./theme.css";

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <div>
        <Header />
        <Routes />
      </div>
    </Router>
  </React.StrictMode>,
  document.getElementById("app"),
);
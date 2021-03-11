import * as React from "react";
import logo from "~/assets/logo.svg";
import Navbar from 'react-bootstrap/Navbar';
import { Link } from "react-router-dom";

const Header: React.FC = () => {
  return (
    <Navbar bg="light">
      <Navbar.Brand>
        <Link to="/">
          <img
            src={logo}
            width="50"
            height="50"
            className="d-inline-block align-top"
            alt="RealTrends"
          />
        </Link>
      </Navbar.Brand>
    </Navbar>
  );
};

export default Header;
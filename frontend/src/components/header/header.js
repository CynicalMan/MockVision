import React from "react";
// import { Navbar } from 'react-bootstrap';
import "./header.css";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="header">
      {/* make header link to root */}

      <a className="header-brand" href="/">
        <h1 className="header-brand">Home design</h1>
      </a>

      <ul className="headerUl">
        <Link to="/drawing"><li className="start">Drawing</li></Link>
        <li>About</li>
        <li>Log in</li>
        <li>Sgin Up</li>
      </ul>
    </header>
  );
};

export default Header;

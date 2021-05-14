import React, { useContext } from "react";
import { NavLink, Redirect } from "react-router-dom";

import Button from "../FormElements/Button";
import { AuthContext } from "../../context/auth-context";
import "./NavLinks.css";

const NavLinks = (props) => {
  const auth = useContext(AuthContext);

  const signOutHandler = () => {
    auth.logout();
  }

  return (
    <ul className="nav-links">
      <li>
        <NavLink to="/" exact>
          ALL USERS
        </NavLink>
      </li>
      {auth.isLoggedIn && (
        <li>
          <NavLink to="/u1/places">MY PLACES</NavLink>
        </li>
      )}
      {auth.isLoggedIn && (
        <li>
          <NavLink to="/places/new">ADD PLACE</NavLink>
        </li>
      )}
      {!auth.isLoggedIn && (
        <li>
          <NavLink to="/auth">AUTHENTICATE</NavLink>
        </li>
      )}
      {auth.isLoggedIn && (
        <li>
          <Button type="submit" onClick={signOutHandler}>
          SIGN OUT
        </Button>
        </li>
      )}
    </ul>
  );
};

export default NavLinks;

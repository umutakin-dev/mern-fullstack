import { createContext } from "react";

export const AuthContext = createContext({
  isLogginIn: false,
  login: () => {},
  logout: () => {},
});

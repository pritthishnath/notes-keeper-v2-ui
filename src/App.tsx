import "bootstrap/dist/css/bootstrap.min.css";
import { createContext, useState } from "react";
import { useLocalStorage } from "./hooks/useLocalStorage";
import RootLayout from "./layouts/RootLayout";
import { AuthContextStateType } from "./types";

export type AuthContextType = [AuthContextStateType, Function];

export type ThemeContextType = [string, Function];

const authContextInitialState = {
  isAuth: false,
  authLoading: false,
  authUserLoading: false,
};

export const ThemeContext = createContext<ThemeContextType>(
  {} as ThemeContextType
);
export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType
);

function App() {
  const [mode, setMode] = useLocalStorage<string>("MODE", "");

  const [authContext, setAuthContext] = useState(authContextInitialState);

  return (
    <ThemeContext.Provider value={[mode, setMode]}>
      <AuthContext.Provider value={[authContext, setAuthContext]}>
        <RootLayout />
      </AuthContext.Provider>
    </ThemeContext.Provider>
  );
}

export default App;

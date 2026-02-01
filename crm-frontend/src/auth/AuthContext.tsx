import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { setTokenSetter } from "../api/auth";

interface AuthContextType {
    token: string | null;
    role: string | null;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(
        localStorage.getItem("token")
    );
    const [role, setRole] = useState<string | null>(
        localStorage.getItem("role")
    );

    useEffect(() => {
        // Wire up so auth.ts can trigger a re-render after login
        setTokenSetter((newToken) => {
            setToken(newToken);
            setRole(localStorage.getItem("role"));
        });
    }, []);

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        setToken(null);
        setRole(null);
    };

    return (
        <AuthContext.Provider value={{ token, role, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
}
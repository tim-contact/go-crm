import { api } from "./client";

let _setToken: ((token: string | null) => void) | null = null;

export function setTokenSetter(fn: (token: string | null) => void) {
    _setToken = fn;
}

export const login = async (email: string, password: string) => {
    const r = await api.post("/auth/login", {email, password})
    const token = r.data.access_token as string;
    localStorage.setItem("token", token);
    localStorage.setItem("role", r.data.user?.role ?? "");
    _setToken?.(token);

    return r.data.user;
}

export const registerUser = (payload: {
    name: string;
    email: string;
    phone?: string;
    role: "admin" | "coordinator" | "agent" | "viewer";
    password: string;
}) => {
    return api.post("/auth/register", payload).then(r => r.data);
}
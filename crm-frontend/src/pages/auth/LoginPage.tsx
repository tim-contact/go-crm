import { useState, type FormEvent } from "react";
import { useNavigate, Navigate } from "react-router-dom";  
import { login } from "@/api/auth";

const LoginPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string  | null>(null);

    const token = localStorage.getItem("token");
    if (token) {
        return <Navigate to="/" replace />;
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await login(email, password);
            navigate("/", { replace: true });
        } catch (err: any) {
            // basic error handling 
            if (err?.response?.status === 401) {
                setError("Invalid email or password");
            } else {
                setError("Something went wrong. Please try again");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
                <h1 className="text-2xl font-semibold mb-2">Login into CRM</h1>
                <p className="text-grey-600 mb-6">(
                    Enter your credentials to access the Dashboard.
                </p>

                {error && (
                    <div className="mb-4 p-3 rounded-md bg-red-100 text-red-700 text-sm">
                        {error}
                    </div>
                )} 

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-1"> Email</label>
                        <input 
                            id="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full px-3 border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-200 outline-none"/> 
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium mb-1"> Password</label>
                        <input 
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full px-3 border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-200 outline-none"/> 
                    </div>
                    <div>
                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition">
                                {loading ? "Logging in..." : "Login"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
    


};

export default LoginPage;

import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Form, Input, Button, Typography, Alert, Space } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { login } from "@/api/auth";
import "@/styles/glass.css"; // Import the glass CSS

const { Title, Text } = Typography;

const LoginPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const token = localStorage.getItem("token");
    
    if (token) {
        return <Navigate to="/" replace />;
    }

    const handleSubmit = async (values: { email: string; password: string }) => {
        setError(null);
        setLoading(true);
        try {
            await login(values.email, values.password);
            navigate("/", { replace: true });
        } catch (err: any) {
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
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundImage: "url('/login-page-background.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                padding: "20px",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Dark overlay for better readability */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                    zIndex: 0,
                }}
            />

            {/* Glass Login Card */}
            <div
                className="glass-surface glass-surface--fallback"
                style={{
                    width: "100%",
                    maxWidth: "450px",
                    borderRadius: "24px",
                    position: "relative",
                    zIndex: 1,
                    padding: "48px 40px",
                }}
            >
                <div className="glass-surface__content">
                    <Space orientation="vertical" size="large" style={{ width: "100%", textAlign: "center" }}>
                        {/* Logo/Brand Section */}
                        <div style={{ marginBottom: "8px" }}>
                            <img
                                src="/timothy-software-solutions-high-resolution-logo-transparent.png"
                                alt="Timothy Software Solutions"
                                style={{ 
                                    width: "150px", 
                                    height: "auto", 
                                    margin: "0 auto 16px",
                                    display: "block",
                                    filter: "drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15))"
                                }}
                            />
                            <Title level={2} style={{ margin: "0 0 8px 0", color: "white" }}>
                                Welcome Back
                            </Title>
                            <Text style={{ color: "rgba(255, 255, 255, 0.85)", fontSize: "15px" }}>
                                Enter your credentials to access the CRM Dashboard
                            </Text>
                        </div>

                        {/* Error Alert */}
                        {error && (
                            <Alert
                                title={error}
                                type="error"
                                showIcon
                                closable={{ onClose: () => setError(null) }}
                            />
                        )}

                        {/* Login Form */}
                        <Form
                            name="login"
                            onFinish={handleSubmit}
                            layout="vertical"
                            requiredMark={false}
                            size="large"
                        >
                           <Form.Item
                            name="email"
                            label={<span style={{ color: "white", fontWeight: 500 }}>Email</span>}
                            rules={[
                                { required: true, message: "Please enter your email" },
                                { type: "email", message: "Please enter a valid email" },
                            ]}
                        >
                            <Input
                                prefix={<UserOutlined style={{ color: "rgba(255, 255, 255, 0.7)" }} />}
                                placeholder="Enter your email"
                                autoComplete="email"
                                style={{
                                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                                    backdropFilter: "blur(10px)",
                                    WebkitBackdropFilter: "blur(10px)",
                                    borderColor: "rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                }}
                                styles={{
                                    input: {
                                        backgroundColor: "transparent",
                                        color: "white",
                                    }
                                }}
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label={<span style={{ color: "white", fontWeight: 500 }}>Password</span>}
                            rules={[{ required: true, message: "Please enter your password" }]}
                        >
                            <Input.Password
                                prefix={<LockOutlined style={{ color: "rgba(255, 255, 255, 0.7)" }} />}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                style={{
                                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                                    backdropFilter: "blur(10px)",
                                    WebkitBackdropFilter: "blur(10px)",
                                    borderColor: "rgba(255, 255, 255, 0.3)",
                                    color: "white",
                                }}
                                styles={{
                                    input: {
                                        backgroundColor: "transparent",
                                        color: "white",
                                    }
                                }}
                            />
                        </Form.Item> 

                            <Form.Item style={{ marginBottom: 0, marginTop: "24px" }}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                block
                                size="large"
                                className="glass-surface glass-surface--fallback"
                                style={{
                                    background: "rgba(102, 126, 234, 0.3)",
                                    backdropFilter: "blur(12px) saturate(1.8) brightness(1.2)",
                                    WebkitBackdropFilter: "blur(12px) saturate(1.8) brightness(1.2)",
                                    border: "1px solid rgba(255, 255, 255, 0.4)",
                                    height: "48px",
                                    fontSize: "16px",
                                    fontWeight: 600,
                                    color: "white",
                                    boxShadow: "0 4px 20px rgba(102, 126, 234, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.3)",
                                }}
                            >
                                {loading ? "Logging in..." : "Login"}
                            </Button>

                            </Form.Item>
                        </Form>

                        {/* Footer Text */}
                        <Text style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.7)" }}>
                            © {new Date().getFullYear()} Timothy Software Solutions. All rights reserved.
                        </Text>
                    </Space>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
import { type FormEvent, useState } from "react";
import { registerUser } from "@/api/auth";
import {
  FormActions,
  SelectField,
  TextField,
} from "@/components/Form";
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/UI";

const RegisterUserPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"viewer" | "admin" | "coordinator" | "agent">(
    "viewer"
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const payload: any = {
        name,
        email,
        password,
        role,
      };

      if (phone.trim() !== "") {
        payload.phone = phone.trim();
      }
      await registerUser(payload);
      setSuccess("User created successfully.");
      setName("");
      setEmail("");
      setPassword("");
      setPhone("");
      setRole("viewer");
    } catch (err: any) {
      if (err?.response?.status === 409) {
        setError("A user with this email already exists.");
      } else if (err?.response?.status === 403) {
        setError(
          "You do not have permission to create users, please contact the admin."
        );
      } else {
        setError("Failed to create user, please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setName("");
    setEmail("");
    setPassword("");
    setPhone("");
    setRole("viewer");
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto w-full max-w-2xl">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Register New User</CardTitle>
            <CardDescription>
              Only admin users can access this page and create new accounts.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert variant="danger" className="mb-4">
                {error}
              </Alert>
            )}
            {success && (
              <Alert variant="success" className="mb-4">
                {success}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <TextField
                id="name"
                label="Full Name"
                requiredMark
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                autoComplete="name"
              />

              <TextField
                id="email"
                label="Email"
                requiredMark
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                autoComplete="email"
              />

              <TextField
                id="password"
                label="Password"
                requiredMark
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />

              <TextField
                id="phone"
                label="Phone (optional)"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 123 4567"
                autoComplete="tel"
              />

              <SelectField
                id="role"
                label="Role"
                requiredMark
                value={role}
                onChange={(e) =>
                  setRole(
                    e.target.value as "viewer" | "admin" | "coordinator" | "agent"
                  )
                }
              >
                <option value="viewer">Viewer</option>
                <option value="agent">Agent</option>
                <option value="coordinator">Coordinator</option>
                <option value="admin">Admin</option>
              </SelectField>

              <FormActions>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClear}
                  disabled={loading}
                >
                  Clear
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create User"}
                </Button>
              </FormActions>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterUserPage;

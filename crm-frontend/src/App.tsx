import LeadsList from "./pages/Leads/LeadsList";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage";
import RequireAuth from "./auth/RequireAuth";
import RequireAdmin from "./auth/RequireAdmin";
import RegisterUserPage from "./pages/Users/RegisterUser";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes */}
        <Route element={<RequireAuth />}>
          <Route
            path="/"
            element={
                <LeadsList />
            }
          />
        </Route>


        { /* admin only routes can go here */ }
        <Route element={<RequireAdmin />}>
            <Route path="/admin/users/new" element={<RegisterUserPage />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;

import LeadsList from "./pages/Leads/LeadsList";
import LeadInfo from "./pages/Leads/LeadInfo";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage";
import RequireAuth from "./auth/RequireAuth";
import RequireAdmin from "./auth/RequireAdmin";
import RegisterUserPage from "./pages/Users/RegisterUser";
import TodayTasksPage from "./pages/Tasks/TodayTasks";
import Dashboard from "./pages/Dashboard";
import AppLayout from "./layouts/AppLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes */}
        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/leads" element={<LeadsList />} />
            <Route path="/leads/:id" element={<LeadInfo />} />
            <Route path="/tasks/today" element={<TodayTasksPage />} />
          </Route>
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

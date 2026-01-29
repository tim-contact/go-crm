import { useMemo, useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  DesktopOutlined,
  FileOutlined,
  PieChartOutlined,
  TeamOutlined,
  UserOutlined,
  MenuOutlined,
  LogoutOutlined,
  MoonOutlined,
  SunOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Breadcrumb, Button, Layout, Menu, theme, Popconfirm } from "antd";
import { useTheme } from "@/theme/ThemeProvider";

const { Header, Content, Footer, Sider } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[]
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const items: MenuItem[] = [
  getItem("Overview", "/", <PieChartOutlined />),
  getItem("Leads", "/leads", <DesktopOutlined />),
  getItem("Today Tasks", "/tasks/today", <FileOutlined />),
  getItem("Team", "sub2", <TeamOutlined />, [
    getItem("Agents", "team-1"),
    getItem("Coordinators", "team-2"),
  ]),
  getItem("Users", "sub1", <UserOutlined />, [
    getItem("All Users", "users-1"),
    getItem("Invite User", "/admin/users/new"),
  ]),
];

const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggle } = useTheme();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close mobile drawer when route changes
  useEffect(() => {
    if (isMobile) {
      setMobileDrawerOpen(false);
    }
  }, [location.pathname, isMobile]);

  const selectedKeys = useMemo(() => {
    if (location.pathname.startsWith("/tasks/today")) return ["/tasks/today"];
    if (location.pathname.startsWith("/leads")) return ["/leads"];
    if (location.pathname.startsWith("/admin/users/new"))
      return ["/admin/users/new"];
    return ["/"];
  }, [location.pathname]);

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    if (e.key.startsWith("/")) {
      navigate(e.key);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Mobile Overlay */}
      {isMobile && mobileDrawerOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.45)",
            zIndex: 999,
          }}
          onClick={() => setMobileDrawerOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sider
        collapsible={!isMobile}
        collapsed={isMobile ? false : collapsed}
        onCollapse={(value) => setCollapsed(value)}
        breakpoint="md"
        style={
          isMobile
            ? {
                position: "fixed",
                left: mobileDrawerOpen ? 0 : -200,
                top: 0,
                bottom: 0,
                zIndex: 1000,
                transition: "left 0.3s ease",
              }
            : {}
        }
        width={200}
      >
        <div className="m-4 flex items-center justify-center rounded p-2">
          <img
            src="/timothy-software-solutions-high-resolution-logo-transparent.png"
            alt="Timothy Software Solutions"
            className="h-8 w-auto"
          />
        </div>
        <Menu
          theme="dark"
          selectedKeys={selectedKeys}
          mode="inline"
          items={items}
          onClick={handleMenuClick}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            padding: "0 16px",
            background: colorBgContainer,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {isMobile && (
            <Button
              type="primary"
              icon={<MenuOutlined />}
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            />
          )}
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <Button
              type="text"
              icon={mode === "dark" ? <SunOutlined /> : <MoonOutlined />}
              onClick={toggle}
            />
            <Popconfirm
              title="Log out?"
              description="Are you sure you want to log out?"
              okText="Logout"
              cancelText="Cancel"
              onConfirm={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                navigate("/login", { replace: true });
              }}
            >
              <Button icon={<LogoutOutlined />} />
            </Popconfirm>
          </div>
        </Header>
        <Content style={{ margin: "0 16px" }}>
          <Breadcrumb
            style={{ margin: "16px 0" }}
          />
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>
        <Footer style={{ textAlign: "center" }}>
          Timothy Software Solutions ©{new Date().getFullYear()}
        </Footer>
      </Layout>
    </Layout>
  );
};

export default AppLayout;

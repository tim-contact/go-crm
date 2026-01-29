import { useNavigate } from "react-router-dom";
import { Card, Row, Col, Typography, Space, Button } from "antd";

const { Title, Text } = Typography;

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <Space orientation="vertical" size="large" style={{ width: "100%" }}>
      <div>
        <Title level={3} style={{ marginBottom: 0 }}>
          CRM Landing
        </Title>
        <Text type="secondary">Quick access to today’s work.</Text>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} lg={8}>
          <Card title="Leads" bordered={false}>
            <Text type="secondary">View and manage all leads.</Text>
            <div style={{ marginTop: 16 }}>
              <Button type="primary" onClick={() => navigate("/leads")}>
                Go to Leads
              </Button>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12} lg={8}>
          <Card title="Today Tasks" bordered={false}>
            <Text type="secondary">
              Open and in-progress tasks plus follow-up calls.
            </Text>
            <div style={{ marginTop: 16 }}>
              <Button type="primary" onClick={() => navigate("/tasks/today")}>
                View Today Tasks
              </Button>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12} lg={8}>
          <Card title="More Coming" bordered={false}>
            <Text type="secondary">
              We’ll add analytics, targets, and team views here.
            </Text>
            <div style={{ marginTop: 16 }}>
              <Button disabled>Coming soon</Button>
            </div>
          </Card>
        </Col>
      </Row>
    </Space>
  );
};

export default Dashboard;

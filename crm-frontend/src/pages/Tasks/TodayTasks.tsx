import { useMemo, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  Pagination, 
  Table, 
  Tag, 
  Button as AntButton, 
  Input, 
  Space, 
  Typography,
  Card
} from "antd";
import { type TodayTasksResponse, getTodayTasks } from "@/api/todaytasks";
import { updateLeadTask } from "@/api/leadtasks";

const { Title, Text } = Typography;

const TodayTasksPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const role = localStorage.getItem("role") || "";
  const canOverride = role === "admin" || role === "coordinator";

  const assignedTo = searchParams.get("assigned_to") || "";
  const limit = Number(searchParams.get("limit") || 20);
  const offset = Number(searchParams.get("offset") || 0);

  const [assignedToInput, setAssignedToInput] = useState(assignedTo);

  useEffect(() => {
    setAssignedToInput(assignedTo);
  }, [assignedTo]);

  const page = Math.floor(offset / limit) + 1;

  const queryParams = useMemo(
    () => ({
      assigned_to: assignedTo || undefined,
      limit,
      offset,
    }),
    [assignedTo, limit, offset]
  );

  const { data, isLoading } = useQuery<TodayTasksResponse>({
    queryKey: ["todayTasks", queryParams],
    queryFn: () => getTodayTasks(queryParams),
    placeholderData: keepPreviousData,
  });

  const markDoneMutation = useMutation({
    mutationFn: ({ leadId, taskId }: { leadId: string; taskId: string }) =>
      updateLeadTask(leadId, taskId, { status: "done" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todayTasks"] });
    },
  });

  const tasks = data?.tasks || [];
  const followUps = data?.follow_up_call_tasks || [];
  const totalTasks = data?.total_tasks || 0;

  const handleApplyFilter = () => {
    const value = assignedToInput.trim();
    setSearchParams({
      ...(value ? { assigned_to: value } : {}),
      limit: String(limit),
      offset: "0",
    });
  };

  const handleClearFilter = () => {
    setAssignedToInput("");
    setSearchParams({
      limit: String(limit),
      offset: "0",
    });
  };

  const renderStatusBadge = (status?: string) => {
    switch (status) {
      case "open":
        return <Tag color="warning">Open</Tag>;
      case "in_progress":
        return <Tag color="processing">In Progress</Tag>;
      case "done":
        return <Tag color="success">Done</Tag>;
      case "cancelled":
        return <Tag color="default">Cancelled</Tag>;
      default:
        return <Tag>{status || "Unknown"}</Tag>;
    }
  };

  return (
    <div style={{ width: "100%" }}>
      <Space orientation="vertical" size="large" style={{ width: "100%" }}>
        {/* Header */}
        <div>
          <Title level={2} style={{ marginBottom: 4 }}>
            Today's Tasks
          </Title>
          <Text type="secondary">
            Open and in-progress tasks plus due follow-up calls.
          </Text>
        </div>

        {/* Filter Section */}
        {canOverride && (
          <Card size="small">
            <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
              <div>
                <Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
                  Assigned To (user id)
                </Text>
                <Space.Compact style={{ width: "100%", maxWidth: 400 }}>
                  <Input
                    value={assignedToInput}
                    onChange={(e) => setAssignedToInput(e.target.value)}
                    placeholder="Paste user id"
                    onPressEnter={handleApplyFilter}
                  />
                  <AntButton type="primary" onClick={handleApplyFilter}>
                    Apply
                  </AntButton>
                  <AntButton onClick={handleClearFilter}>
                    Clear
                  </AntButton>
                </Space.Compact>
              </div>
            </Space>
          </Card>
        )}

        {/* Tasks Table */}
        <div>
          <div style={{ marginBottom: 16 }}>
            <Title level={4} style={{ marginBottom: 4 }}>
              Tasks
            </Title>
            <Text type="secondary">
              Open/in-progress tasks ({totalTasks})
            </Text>
          </div>
          <Table
            rowKey="id"
            columns={[
              {
                title: "Title",
                dataIndex: "title",
                key: "title",
                render: (title) => (
                  <Text strong>{title}</Text>
                ),
              },
              {
                title: "Status",
                dataIndex: "status",
                key: "status",
                width: 120,
                render: (status) => renderStatusBadge(status),
              },
              {
                title: "Due Date",
                dataIndex: "due_date",
                key: "due_date",
                width: 120,
                render: (date) =>
                  date ? new Date(date).toLocaleDateString() : "—",
              },
              {
                title: "Action",
                key: "action",
                width: 150,
                render: (_, task) => (
                  <AntButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      markDoneMutation.mutate({
                        leadId: task.lead_id,
                        taskId: task.id,
                      });
                    }}
                    disabled={task.status === "done"}
                    loading={markDoneMutation.isPending}
                  >
                    Mark as done
                  </AntButton>
                ),
              },
            ]}
            dataSource={tasks}
            loading={isLoading}
            locale={{ emptyText: "No open or in-progress tasks." }}
            pagination={false}
            onRow={(record) => ({
              onClick: () => navigate(`/leads/${record.lead_id}`),
              style: { cursor: "pointer" },
            })}
          />
          <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
            <Pagination
              current={page}
              pageSize={limit}
              total={totalTasks}
              showSizeChanger
              pageSizeOptions={[10, 20, 50, 100]}
              showTotal={(total) => `Total ${total} tasks`}
              onChange={(nextPage, nextSize) => {
                const nextOffset = (nextPage - 1) * nextSize;
                setSearchParams({
                  ...(assignedTo ? { assigned_to: assignedTo } : {}),
                  limit: String(nextSize),
                  offset: String(nextOffset),
                });
              }}
            />
          </div>
        </div>

        {/* Follow-up Calls Table */}
        <div>
          <div style={{ marginBottom: 16 }}>
            <Title level={4} style={{ marginBottom: 4 }}>
              Follow-up Calls Due
            </Title>
            <Text type="secondary">
              Calls due ({followUps.length})
            </Text>
          </div>
          <Table
            rowKey="lead_id"
            columns={[
              {
                title: "Lead",
                dataIndex: "lead_name",
                key: "lead_name",
                render: (name) => (
                  <Text strong>{name}</Text>
                ),
              },
              {
                title: "Status",
                dataIndex: "lead_status",
                key: "lead_status",
                width: 120,
                render: (status) => (
                  <Tag>{status || "—"}</Tag>
                ),
              },
              {
                title: "Last Follow-up",
                dataIndex: "last_follow_up_at",
                key: "last_follow_up_at",
                width: 140,
                render: (date) =>
                  date ? new Date(date).toLocaleDateString() : "—",
              },
              {
                title: "Due",
                dataIndex: "due_at",
                key: "due_at",
                width: 120,
                render: (date) => new Date(date).toLocaleDateString(),
              },
            ]}
            dataSource={followUps}
            loading={isLoading}
            locale={{ emptyText: "No follow-up calls due." }}
            pagination={false}
            onRow={(record) => ({
              onClick: () => navigate(`/leads/${record.lead_id}`),
              style: { cursor: "pointer" },
            })}
          />
        </div>
      </Space>
    </div>
  );
};

export default TodayTasksPage;
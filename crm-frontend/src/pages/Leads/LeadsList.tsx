import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { type Lead, type LeadsListResponse, fetchLeads, type LeadFilter } from "@/api/leads";
import { useLeadActions } from "@/hooks/useLeadActions";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { LeadEditModal } from "@/components/Form/LeadModal";
import { COUNTRIES } from "@/constants/countries";
import { 
  Select, 
  DatePicker, 
  Space, 
  Table, 
  Input, 
  Button as AntButton, 
  Tag, 
  Typography,
  Card,
  Alert
} from "antd";
import { 
  CloseSquareTwoTone, 
  SearchOutlined, 
  PlusOutlined, 
  FilterOutlined,
  EditOutlined,
  DeleteOutlined 
} from "@ant-design/icons";
import { Dayjs } from "dayjs";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const statusOptions = [
  { label: "New", value: "New" },
  { label: "In Progress", value: "In Progress" },
  { label: "Closed", value: "Closed" },
];

export default function LeadsList() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Lead | null>(null);
  const [filters, setFilters] = useState<LeadFilter>({
    limit: 50,
    offset: 0,
  });
  const [showFilter, setShowFilter] = useState(false);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

  const debouncedSearch = useDebouncedValue(searchTerm, 500);

  const page = Math.floor((filters.offset || 0) / (filters.limit || 50)) + 1;
  const pageSize = filters.limit || 50;

  const effectiveFilters: LeadFilter = {
    ...filters,
    q: debouncedSearch?.trim() || undefined,
    limit: pageSize,
    offset: (page - 1) * pageSize,
  };

  const { data, isLoading } = useQuery<LeadsListResponse>({
    queryKey: ["leads", effectiveFilters],
    queryFn: () => fetchLeads(effectiveFilters),
    placeholderData: keepPreviousData,
  });

  const filteredData = data?.leads || [];
  const totalItems = data?.total || 0;

  const handleStatusFilterChange = (value: string) => {
    setFilters((prev) => ({ ...prev, status: value || undefined, offset: 0 }));
  };

  const handleCountryFilterChange = (value: string) => {
    setFilters((prev) => ({ ...prev, country: value || undefined, offset: 0 }));
  };

  const handleDateFilterChange = (values: [Dayjs | null, Dayjs | null] | null) => {
    setDateRange(values);
    if (values && values[0] && values[1]) {
      setFilters((prev) => ({
        ...prev,
        from: values[0]?.format("YYYY-MM-DD"),
        to: values[1]?.format("YYYY-MM-DD"),
        offset: 0,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        from: undefined,
        to: undefined,
        offset: 0,
      }));
    }
  };

  const handleResetFilters = () => {
    setFilters({ limit: 50, offset: 0 });
    setSearchTerm("");
    setDateRange(null);
    setShowFilter(false);
  };

  const { handleDeleteLead, deleteMutation, isDeletingLead } = useLeadActions();

  const renderStatusBadge = (status?: string) => {
    switch (status) {
      case "New":
        return <Tag color="success">New</Tag>;
      case "In Progress":
        return <Tag color="warning">In Progress</Tag>;
      case "Closed":
        return <Tag color="blue">Closed</Tag>;
      default:
        return <Tag>{status || "Unknown"}</Tag>;
    }
  };

  const openEdit = (lead: Lead) => {
    setError("");
    setEditing(lead);
    setShowNewLeadModal(true);
  };

  const closeModal = () => {
    setError("");
    setEditing(null);
    setShowNewLeadModal(false);
  };

  return (
    <div style={{ width: "100%" }}>
      <Space orientation="vertical" size="large" style={{ width: "100%" }}>
        {/* Header */}
        <div>
          <Title level={2} style={{ marginBottom: 4 }}>
            Leads Management
          </Title>
          <Text type="secondary">Manage and track all the leads here</Text>
        </div>

        {/* Section Title */}
        <div>
          <Title level={4} style={{ marginBottom: 4 }}>
            All Leads
          </Title>
          <Text type="secondary">Search, filter and manage every lead in the system.</Text>
        </div>

        {/* Search and Actions */}
        <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
          <Space wrap style={{ width: "100%", justifyContent: "space-between" }}>
            <Input
              placeholder="Search Name, WhatsApp, Inquiry Id"
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setFilters((prev) => ({ ...prev, offset: 0 }));
              }}
              style={{ width: 300 }}
              allowClear
            />
            {!showFilter && (
              <Space>
                <AntButton
                  icon={<FilterOutlined />}
                  onClick={() => setShowFilter(true)}
                >
                  Filters
                </AntButton>
                <AntButton
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditing(null);
                    setShowNewLeadModal(true);
                  }}
                >
                  New Lead
                </AntButton>
              </Space>
            )}
          </Space>

          {/* Filters Panel */}
          {showFilter && (
            <Card size="small">
              <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
                <Space>
                  <AntButton
                    type="text"
                    icon={<CloseSquareTwoTone />}
                    onClick={() => setShowFilter(false)}
                  />
                </Space>
                <Space wrap>
                  <Select
                    placeholder="Status"
                    allowClear
                    options={statusOptions}
                    value={filters.status || undefined}
                    onChange={handleStatusFilterChange}
                    style={{ width: 150 }}
                  />
                  <Select
                    showSearch
                    placeholder="Country"
                    allowClear
                    options={COUNTRIES.map((c) => ({ label: c.name, value: c.name }))}
                    value={filters.country || undefined}
                    onChange={handleCountryFilterChange}
                    style={{ width: 150 }}
                  />
                  <RangePicker
                    value={dateRange || undefined}
                    onChange={(vals) => handleDateFilterChange(vals)}
                    allowClear
                  />
                  <AntButton onClick={handleResetFilters}>Reset</AntButton>
                </Space>
              </Space>
            </Card>
          )}

          {/* Error Alert */}
          {error && (
            <Alert
              title={error}
              type="error"
              showIcon
              closable={{ onClose: () => setError("") }}
            />
          )}
        </Space>

        {/* Table */}
        <Table<Lead>
          rowKey="id"
          columns={[
            {
              title: "INQ ID",
              dataIndex: "inq_id",
              key: "inq_id",
              width: 120,
            },
            {
              title: "Name",
              dataIndex: "full_name",
              key: "full_name",
              width: 180,
            },
            {
              title: "Country",
              dataIndex: "destination_country",
              key: "destination_country",
              width: 120,
              render: (text) => text || "—",
            },
            {
              title: "Status",
              dataIndex: "status",
              key: "status",
              width: 120,
              render: (status) => renderStatusBadge(status),
            },
            {
              title: "Field of Study",
              dataIndex: "field_of_study",
              key: "field_of_study",
              width: 150,
              render: (text) => text || "—",
            },
            {
              title: "Age",
              dataIndex: "age",
              key: "age",
              width: 80,
              render: (age) => (age !== undefined ? age : "—"),
            },
            {
              title: "Visa Category",
              dataIndex: "visa_category",
              key: "visa_category",
              width: 130,
              render: (text) => text || "—",
            },
            {
              title: "Principal",
              dataIndex: "principal",
              key: "principal",
              width: 120,
              render: (text) => text || "—",
            },
            {
              title: "GPA",
              dataIndex: "gpa",
              key: "gpa",
              width: 80,
              render: (gpa) => (gpa !== undefined ? gpa : "n/a"),
            },
            {
              title: "Allocated User",
              dataIndex: "allocated_user_id",
              key: "allocated_user_id",
              width: 130,
              render: (_, lead) => lead.allocated_user_name || lead.allocated_user_id || "—",
            },
            {
              title: "Team",
              dataIndex: "team",
              key: "team",
              width: 100,
              render: (text) => text || "—",
            },
            {
              title: "WhatsApp Number",
              dataIndex: "whatsapp_no",
              key: "whatsapp_no",
              width: 140,
            },
            {
              title: "Branch",
              dataIndex: "branch_name",
              key: "branch_name",
              width: 120,
              render: (text) => text || "—",
            },
            {
              title: "Inquiry Date",
              dataIndex: "inquiry_date",
              key: "inquiry_date",
              width: 120,
              render: (date) =>
                date ? new Date(date).toLocaleDateString("en-IN") : "—",
            },
            {
              title: "Actions",
              key: "actions",
              fixed: "right",
              width: 160,
              render: (_, lead) => (
                <Space size="small">
                  <AntButton
                    type="link"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(lead);
                    }}
                  >
                    Edit
                  </AntButton>
                  <AntButton
                    type="link"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!confirm(`Delete ${lead.full_name}?`)) return;
                      if (deleteMutation.isError) {
                        setError(deleteMutation.error instanceof Error ? deleteMutation.error.message : String(deleteMutation.error));
                        return;
                      }
                      handleDeleteLead(lead.id);
                    }}
                    loading={isDeletingLead}
                  >
                    Delete
                  </AntButton>
                </Space>
              ),
            },
          ]}
          dataSource={filteredData}
          loading={isLoading}
          locale={{ emptyText: "No leads found for the current search." }}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: totalItems,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} leads`,
            onChange: (nextPage, nextPageSize) => {
              const newOffset = (nextPage - 1) * nextPageSize;
              setFilters((prev) => ({
                ...prev,
                limit: nextPageSize,
                offset: newOffset,
              }));
            },
          }}
          onRow={(record) => ({
            onClick: () => navigate(`/leads/${record.id}`),
            style: { cursor: "pointer" },
          })}
          scroll={{ x: 1800 }}
        />

        {/* Modal */}
        {showNewLeadModal && (
          <LeadEditModal lead={editing} isOpen={showNewLeadModal} onClose={closeModal} />
        )}
      </Space>
    </div>
  );
}

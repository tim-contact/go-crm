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
  Alert,
  List,
  Dropdown
} from "antd";
import { 
  CloseSquareTwoTone, 
  SearchOutlined, 
  PlusOutlined, 
  FilterOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Detect screen size changes
  useState(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });

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

  const getActionMenuItems = (lead: Lead) => [
    {
      key: 'edit',
      label: 'Edit',
      icon: <EditOutlined />,
      onClick: () => openEdit(lead),
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => {
        if (confirm(`Delete ${lead.full_name}?`)) {
          handleDeleteLead(lead.id);
        }
      },
    },
  ];

  // Mobile Card View
  const MobileLeadCard = ({ lead }: { lead: Lead }) => (
    <Card
      size="small"
      style={{ marginBottom: 8, cursor: 'pointer' }}
      onClick={() => navigate(`/leads/${lead.id}`)}
    >
      <Space orientation="vertical" size="small" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Space orientation="vertical" size={2}>
            <Text strong style={{ fontSize: '16px' }}>{lead.full_name}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {lead.inq_id}
            </Text>
          </Space>
          <div onClick={(e) => e.stopPropagation()}>
            <Dropdown
              menu={{ items: getActionMenuItems(lead) }}
              trigger={['click']}
            >
              <AntButton
                type="text"
                icon={<MoreOutlined />}
                size="small"
                onClick={(e) => e.stopPropagation()}
              />
            </Dropdown>
          </div>
        </div>
        
        <Space wrap size={[8, 4]}>
          {renderStatusBadge(lead.status)}
          {lead.destination_country && (
            <Tag>{lead.destination_country}</Tag>
          )}
        </Space>

        <Space orientation="vertical" size={2} style={{ width: '100%' }}>
          {lead.whatsapp_no && (
            <Text type="secondary" style={{ fontSize: '13px' }}>
              📱 {lead.whatsapp_no}
            </Text>
          )}
          {lead.field_of_study && (
            <Text type="secondary" style={{ fontSize: '13px' }}>
              📚 {lead.field_of_study}
            </Text>
          )}
          {lead.branch_name && (
            <Text type="secondary" style={{ fontSize: '13px' }}>
              🏢 {lead.branch_name}
            </Text>
          )}
          {lead.inquiry_date && (
            <Text type="secondary" style={{ fontSize: '13px' }}>
              📅 {new Date(lead.inquiry_date).toLocaleDateString("en-IN")}
            </Text>
          )}
        </Space>
      </Space>
    </Card>
  );

  const tableColumns = [
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
      render: (text: string) => text || "—",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => renderStatusBadge(status),
    },
    {
      title: "Field of Study",
      dataIndex: "field_of_study",
      key: "field_of_study",
      width: 150,
      render: (text: string) => text || "—",
    },
    {
      title: "Age",
      dataIndex: "age",
      key: "age",
      width: 80,
      render: (age: number) => (age !== undefined ? age : "—"),
    },
    {
      title: "Visa Category",
      dataIndex: "visa_category",
      key: "visa_category",
      width: 130,
      render: (text: string) => text || "—",
    },
    {
      title: "Principal",
      dataIndex: "principal",
      key: "principal",
      width: 120,
      render: (text: string) => text || "—",
    },
    {
      title: "GPA",
      dataIndex: "gpa",
      key: "gpa",
      width: 80,
      render: (gpa: number) => (gpa !== undefined ? gpa : "n/a"),
    },
    {
      title: "Allocated User",
      dataIndex: "allocated_user_id",
      key: "allocated_user_id",
      width: 130,
      render: (_: any, lead: Lead) => lead.allocated_user_name || lead.allocated_user_id || "—",
    },
    {
      title: "Team",
      dataIndex: "team",
      key: "team",
      width: 100,
      render: (text: string) => text || "—",
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
      render: (text: string) => text || "—",
    },
    {
      title: "Inquiry Date",
      dataIndex: "inquiry_date",
      key: "inquiry_date",
      width: 120,
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString("en-IN") : "—",
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right" as const,
      width: 160,
      render: (_: any, lead: Lead) => (
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
  ];

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
              style={{ width: isMobile ? '100%' : 300, maxWidth: '100%' }}
              allowClear
            />
            {!showFilter && (
              <Space wrap>
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
                    style={{ width: isMobile ? '100%' : 150, minWidth: 150 }}
                  />
                  <Select
                    showSearch
                    placeholder="Country"
                    allowClear
                    options={COUNTRIES.map((c) => ({ label: c.name, value: c.name }))}
                    value={filters.country || undefined}
                    onChange={handleCountryFilterChange}
                    style={{ width: isMobile ? '100%' : 150, minWidth: 150 }}
                  />
                  <RangePicker
                    value={dateRange || undefined}
                    onChange={(vals) => handleDateFilterChange(vals)}
                    allowClear
                    style={{ width: isMobile ? '100%' : 'auto' }}
                  />
                  <AntButton onClick={handleResetFilters} block={isMobile}>Reset</AntButton>
                </Space>
              </Space>
            </Card>
          )}

          {/* Error Alert */}
          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              onClose={() => setError("")}
            />
          )}
        </Space>

        {/* Table or Mobile List */}
        {isMobile ? (
          <>
            <List
              dataSource={filteredData}
              loading={isLoading}
              locale={{ emptyText: "No leads found for the current search." }}
              renderItem={(lead) => <MobileLeadCard lead={lead} />}
            />
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
              <Space orientation="vertical" align="center" style={{ width: '100%' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Total {totalItems} leads
                </Text>
                <Space>
                  <AntButton
                    disabled={page === 1}
                    onClick={() => {
                      const newOffset = (page - 2) * pageSize;
                      setFilters((prev) => ({ ...prev, offset: newOffset }));
                    }}
                  >
                    Previous
                  </AntButton>
                  <Text>Page {page} of {Math.ceil(totalItems / pageSize)}</Text>
                  <AntButton
                    disabled={page >= Math.ceil(totalItems / pageSize)}
                    onClick={() => {
                      const newOffset = page * pageSize;
                      setFilters((prev) => ({ ...prev, offset: newOffset }));
                    }}
                  >
                    Next
                  </AntButton>
                </Space>
              </Space>
            </div>
          </>
        ) : (
          <Table<Lead>
            rowKey="id"
            columns={tableColumns}
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
        )}

        {/* Modal */}
        {showNewLeadModal && (
          <LeadEditModal lead={editing} isOpen={showNewLeadModal} onClose={closeModal} />
        )}
      </Space>
    </div>
  );
}
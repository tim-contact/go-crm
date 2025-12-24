import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { type Lead, type LeadsListResponse, fetchLeads, type LeadFilter } from "@/api/leads";
import { Search, Plus, Edit2, Trash2, Filter } from "lucide-react";
import { DataTable, DataTableToolbar } from "@/components/Datatable";
import { Badge, Button, CardDescription, CardTitle } from "@/components/UI";
import { useLeadActions } from "@/hooks/useLeadActions";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { LeadEditModal } from "@/components/Form/LeadModal";
import { COUNTRIES } from "@/constants/countries";
import { Select, DatePicker, Space, Pagination } from "antd";
import { CloseSquareTwoTone } from "@ant-design/icons";
import { Dayjs } from "dayjs";

const { RangePicker } = DatePicker;

const statusOptions = [
  { label: "New", value: "New" },
  { label: "In Progress", value: "In Progress" },
  { label: "Closed", value: "Closed" },
]

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
  }
  

  const { data, isLoading } = useQuery<LeadsListResponse>({
    queryKey: ["leads", effectiveFilters],
    queryFn: () => fetchLeads(effectiveFilters), 
    placeholderData: keepPreviousData
  });

  const filteredData = data?.leads || [];

  const totalItems = data?.total || 0;
  const start = totalItems === 0 ? 0: (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems)

  const handleStatusFilterChange = (value: string) => {
    setFilters((prev) => ({...prev, status: value || undefined, offset: 0}))
  }  
  const handleCountryFilterChange = (value: string) => {
    setFilters((prev) => ({...prev, country: value || undefined, offset: 0}))
  }


  const handleDateFilterChange = (values: [Dayjs | null, Dayjs | null] | null) => {
    setDateRange(values);
    if(values && values[0] && values[1]) {
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
      }))
    }
  }

  const handleResetFilters = () => {
    setFilters({limit: 50, offset: 0});
    setSearchTerm("");
    setDateRange(null);
    setShowFilter(false);
  }

  const { handleDeleteLead, deleteMutation, isDeletingLead } = useLeadActions();

  const renderStatusBadge = (status?: string) => {
    switch (status) {
      case "New":
        return <Badge variant="success">New</Badge>;
      case "In Progress":
        return <Badge variant="warning">In Progress</Badge>;
      case "Closed":
        return <Badge variant="info">Closed</Badge>;
      default:
        return <Badge variant="neutral">{status || "Unknown"}</Badge>;
    }
  };

  const openEdit = (lead: Lead) => {
    setError("");
    setEditing(lead);
    setShowNewLeadModal(true);
  }

  const closeModal = () => {
    setError("");
    setEditing(null);
    setShowNewLeadModal(false);
  }



  return (
    <div className="w-full min-h-screen bg-gray-50">
      {isLoading && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-600 text-lg">Loading...</div>
        </div>
      )}
      {!isLoading && (
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="mb-6 space-y-1">
          <CardTitle className="text-3xl">Leads Management</CardTitle>
          <CardDescription className="text-base">
            Manage and track all the leads here
          </CardDescription>
        </div>

        <DataTable<Lead>
          title="All Leads"
          description="Search, filter and manage every lead in the system."
          columns={[
            {
              header: "INQ ID",
              render: (lead) => (
                <div className="text-sm text-gray-600">
                  {lead.inq_id}
                </div>
              ),
            },
            {
              header: "Name",
              render: (lead) => (
                <div className="text-sm font-medium text-gray-900">
                  {lead.full_name}
                </div>
              ),
            },
            {
              header: "Country",
              render: (lead) => (
                <div className="text-sm text-gray-600">
                  {lead.destination_country || "—"}
                </div>
              ),
            },
            {
              header: "Status",
              render: (lead) => renderStatusBadge(lead.status),
            },
            {
              header: "Field of Study",
              render: (lead) => (
                <div className="text-sm text-gray-600">
                  {lead.field_of_study || "—"}
                </div>
              ),
            },

            {
              header: "Age",
              render: (lead) => (
                <div className="text-sm text-gray-600">
                  {lead.age !== undefined ? lead.age : "—"}
                </div>
              ),
            },

            {
              header: "Visa Category",
              render: (lead) => (
                <div className="text-sm text-gray-600">
                  {lead.visa_category || "—"}
                </div>
              ),  
            },

            {
              header: "Principal",
              render: (lead) => (
                <div className="text-sm text-gray-600">
                  {lead.principal || "—"}
                </div>
              ),
            },

            {
              header: "GPA",
              render: (lead) => (
                <div className="text-sm text-gray-600">
                  {lead.gpa !== undefined ? lead.gpa : "n/a"}
                </div>
              )
            },

            {
              header: "Allocated User",
              render: (lead) => (
                <div className="text-sm text-gray-600">
                  {lead.allocated_user_id || "—"}
                </div>
              ),
            },
            {
              header: "Team",
              render: (lead) => (
                <div className="text-sm text-gray-600">
                  {lead.team || "—"}
                </div>
              ),
            },
            {
              header: "Whatsapp Number",
              render: (lead) => (
                <div className="text-sm text-gray-600">
                  {lead.whatsapp_no}
                  </div>
              )
            },
            {
              header: "Branch",
              render: (lead) => (
                <div className="text-sm text-gray-600">
                  {lead.branch_name || "—"}
                </div>
              ),
            },
            {
              header: "Inquiry Date",
              render: (lead) => (
                <div className="text-sm text-gray-600">
                  {lead.inquiry_date ? new Date(lead.inquiry_date).toLocaleDateString("en-IN") : "—"}
                </div>
              ),
            },
            {
              header: "Actions",
              align: "right",
              className: "w-40",
              render: (lead) => (
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Edit2 className="h-4 w-4" />}
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(lead)}}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
                    leftIcon={<Trash2 className="h-4 w-4" />}

                    onClick={(e) => {
                      e.stopPropagation();
                      if (!confirm(`Delete ${lead.full_name}?`)) return;
                      if (deleteMutation.isError) {
                        setError(`{deleteMutation.error as string}`);
                        return
                      }
                      handleDeleteLead(lead.id);
                    }}
                    disabled={isDeletingLead}
                  >
                    {isDeletingLead ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              ),
            },
          ]}
          data={filteredData}
          onRowClick={(lead) => navigate(`/leads/${lead.id}`)}
          isLoading={isLoading}
          emptyMessage="No leads found for the current search."
          getRowId={(row) => row.id}
          toolbar={
            <DataTableToolbar>
              <div className="w-full sm:w-72 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search Name, WhatsApp, Inquiry Id"
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-3">
                {!showFilter && (
                <>
                <Button variant="secondary" leftIcon={<Filter className="h-4 w-4" />} onClick={() => {setShowFilter(true)}}>
                  Filters
                </Button>
                <Button leftIcon={<Plus className="h-5 w-5" />} onClick={() => {setEditing(null);setShowNewLeadModal(true);}}>New Lead</Button>
                </>
              )}
                {showFilter && (
                  <div className="flex flex-col gap-3 bg-white p-4 rounded-lg shadow mt-2">
                  <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow">
                    <button 
                      type="button"
                      onClick={() => setShowFilter(false)}><CloseSquareTwoTone /></button>
                    </div>
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
                      options={COUNTRIES.map(c => ({ label: c.name, value: c.name }))}
                      value={filters.country || undefined}
                      onChange={handleCountryFilterChange}
                      style={{ width: 150 }}
                    />

                    <RangePicker
                      value={dateRange || undefined}
                      onChange={vals => handleDateFilterChange(vals)}
                      allowClear
                    />
                    <Button color="default" variant="secondary" onClick={handleResetFilters}>Reset</Button>
                  </Space>
                  </div>
                )}

                

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                      {error}
                    </div>)}

                {showNewLeadModal && (
                  <LeadEditModal 
                    lead={editing}
                    isOpen={showNewLeadModal}
                    onClose={closeModal}
                  />
                )}
              </div>
            </DataTableToolbar>
          }
          footer={
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>
                Showing{" "}
                <span className="font-medium text-gray-900">
                  {start}-{end}
                </span>{" "}
                of{" "}
                <span className="font-medium text-gray-900">
                  {totalItems}
                </span>{" "}
                leads
              </div>
              <div className="flex gap-2">
                <Pagination
                  current={page}
                  pageSize={pageSize}
                  total={totalItems}
                  showSizeChanger
                  onChange={(nextPage, nextPageSize) => {
                    const newOffset = (nextPage - 1) * nextPageSize; 
                    setFilters((prev) => ({
                      ...prev,
                      limit: nextPageSize,
                      offset: newOffset,
                    }))
                  }}
                />
                
              </div>
            </div>
          }
        />
      </div>
      )}
    </div>
  );
}

// src/pages/Leads/LeadsList.tsx
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Lead, listLeads } from "@/api/leads";
import { Search, Plus, Edit2, Trash2, Filter } from "lucide-react";
import { DataTable, DataTableToolbar } from "@/components/Datatable";
import { Badge, Button, CardDescription, CardTitle } from "@/components/UI";

export default function LeadsList() {

  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading } = useQuery<Lead[]>({
    queryKey: ["leads", {/* filters */}],
    queryFn: () => listLeads({ limit: 50 })
  });

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-gray-600 text-lg">Loading...</div>
    </div>
  );

  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();
    return data.filter((lead) =>
      [lead.full_name, lead.destination_country, lead.branch, lead.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [data, searchTerm]);

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

  return (
    <div className="w-full min-h-screen bg-gray-50">
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
              header: "Branch",
              render: (lead) => (
                <div className="text-sm text-gray-600">
                  {lead.branch || "—"}
                </div>
              ),
            },
            {
              header: "Actions",
              align: "right",
              className: "w-40",
              render: () => (
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Edit2 className="h-4 w-4" />}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
                    leftIcon={<Trash2 className="h-4 w-4" />}
                  >
                    Delete
                  </Button>
                </div>
              ),
            },
          ]}
          data={filteredData}
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
                  placeholder="Search name, country, branch..."
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-3">
                <Button variant="secondary" leftIcon={<Filter className="h-4 w-4" />}>
                  Filter
                </Button>
                <Button leftIcon={<Plus className="h-5 w-5" />}>New Lead</Button>
              </div>
            </DataTableToolbar>
          }
          footer={
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>
                Showing{" "}
                <span className="font-medium text-gray-900">
                  1-{filteredData.length || 0}
                </span>{" "}
                of{" "}
                <span className="font-medium text-gray-900">
                  {filteredData.length || 0}
                </span>{" "}
                leads
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="secondary" size="sm" disabled>
                  Next
                </Button>
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
}

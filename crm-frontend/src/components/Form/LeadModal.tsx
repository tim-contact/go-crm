import { useState } from "react";
import { type LeadCreate, type Lead, createLead } from "@/api/leads";
import LeadForm from "@/pages/Leads/LeadForm";
import { useLeadActions } from "@/hooks/useLeadActions";
import { useQueryClient } from "@tanstack/react-query";
import { CloseOutlined } from "@ant-design/icons/lib/icons";
import { Button } from "antd";

type LeadEditModalProps = {
    lead: Lead | null;
    isOpen: boolean;
    onClose: () => void;
};

export const LeadEditModal = ({lead, isOpen, onClose}: LeadEditModalProps) => {

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const { handleEditLead, isEditingLead } = useLeadActions();

    const queryClient = useQueryClient();

    const handleSubmit = async (data: LeadCreate) => {

        // validate whatsapp number format
        const whatsapp = data.whatsapp_no?.trim();
        if (whatsapp && !/^\d{10}$/.test(whatsapp)) { setError("Invalid WhatsApp number format."); return;
        }
        let inquiry_date: string | undefined;
        if (data.inquiry_date) {
          const d = new Date(data.inquiry_date);
          if (isNaN(d.getTime())) {
            setError("Inquiry date is invalid.");
            return;
          }
          inquiry_date = d.toISOString();
        }
        if (!data.full_name?.trim() || !data.destination_country?.trim() || !data.branch?.trim()) {
          setError("Name, destination country and branch are required.");
          return;
        }

        setSubmitting(true);
        setError(null);

        const payload: LeadCreate = {
          ...data,
          branch: data.branch.trim(),
          status: data.status || "New",
          whatsapp_no: whatsapp,
          inquiry_date,
        }
        if (!payload) return;
        setError(null);
        setSubmitting(true);
        try {
            if (lead) {
                await handleEditLead(lead.id, payload); 
                setSubmitting(false);
                onClose();
            } else {
                await createLead(payload);
            }
            queryClient.invalidateQueries({ queryKey: ["leads"]});
            onClose();
        } catch (err: any) {
            console.error(err);
            setError(err.message || "An error occurred");
        } finally {
            setSubmitting(false);
        }
    }

    const handleClose = () => {
        setError(null);
        onClose()
    };

    if (!isOpen) return null;
    const isEditMode = !!lead;

    return(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                  <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
                    <div className="flex items-center justify-between mb-4 p-4 border-b">
                    <h2 className="text-lg font-semibold">{isEditMode ? "Edit Lead" : "Add Lead"}</h2>
                    <Button 
                      type="text"
                      icon={<CloseOutlined />}
                      onClick={handleClose}
                    />
                  </div>

                  {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                      {error}
                    </div>
                  )}
                  <LeadForm 
                    initial={lead ?
                        {...lead, branch:lead.branch_name} : undefined}
                    onSubmit={handleSubmit}
                    onCancel={handleClose}
                    submitting={submitting || isEditingLead}
                    />
                  </div>
                  </div>
    )
}


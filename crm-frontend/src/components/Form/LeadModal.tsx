import { useState } from "react";
import { type LeadCreate, type Lead, createLead } from "@/api/leads";
import LeadForm from "@/pages/Leads/LeadForm";
import { useLeadActions } from "@/hooks/useLeadActions";
import { useQueryClient } from "@tanstack/react-query";
import { CloseOutlined } from "@ant-design/icons";
import { Button, Modal, Alert, Typography } from "antd";

const { Title } = Typography;

type LeadEditModalProps = {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
};

export const LeadEditModal = ({ lead, isOpen, onClose }: LeadEditModalProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { handleEditLead, isEditingLead } = useLeadActions();
  const queryClient = useQueryClient();

  const handleSubmit = async (data: LeadCreate) => {
    // validate whatsapp number format
    const whatsapp = data.whatsapp_no?.trim();
    if (whatsapp && !/^\d{10}$/.test(whatsapp)) {
      setError("Invalid WhatsApp number format.");
      return;
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

    if (
      !data.full_name?.trim() ||
      !data.destination_country?.trim() ||
      !data.branch?.trim()
    ) {
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
    };

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
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const isEditMode = !!lead;

  return (
    <Modal
      open={isOpen}
      onCancel={handleClose}
      footer={null}
      closeIcon={<CloseOutlined />}
      title={
        <Title level={4} style={{ margin: 0 }}>
          {isEditMode ? "Edit Lead" : "Add Lead"}
        </Title>
      }
      width={600}
      destroyOnClose
    >
      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: 16 }}
        />
      )}
      <LeadForm
        initial={lead ? { ...lead, branch: lead.branch_name } : undefined}
        onSubmit={handleSubmit}
        onCancel={handleClose}
        submitting={submitting || isEditingLead}
      />
    </Modal>
  );
};


import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { type LeadCreate, deleteLead, updateLead } from "@/api/leads";
import { message } from "antd";


export const useLeadActions = () => {
    
    const {id: leadId} = useParams<{id: string}>();
    const queryClient = useQueryClient();

    const updateMutation = useMutation({
        mutationFn: ({id, body}: {id: string, body: Partial<LeadCreate>}) => 
          updateLead(id, body),
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leads"]});
            queryClient.invalidateQueries({ queryKey: ["lead", leadId]})
            message.success("Lead updated successfully");
        },
        onError: () => {
            message.error("Failed to update lead");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteLead(id),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["leads"]});
            message.success("Lead deleted successfully");
        },
        onError: () => {
            message.error("Failed to delete lead");
        }
      })

      const handleEditLead = (id: string, body: Partial<LeadCreate>) => {
        updateMutation.mutateAsync({id, body});
      }

      const handleDeleteLead = (id: string) => {
        if (window.confirm("Are you sure you want to delete this lead?")){
            deleteMutation.mutate(id);
      }
    }

    return {
        updateMutation,
        deleteMutation,
        handleEditLead,
        handleDeleteLead,
        isEditingLead: updateMutation.isPending,
        isDeletingLead: deleteMutation.isPending,

    };
}

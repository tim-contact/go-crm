import { useState } from "react";
import { useParams } from "react-router-dom";
import { ActivityKind, type LeadActivity, type LeadActivityList, type LeadActivityCreate, listLeadActivities, createLeadActivity, deleteLeadActivity, type LeadActivityUpdate, updateLeadActivity } from "@/api/leadactivities";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {PhoneOutlined, MailOutlined, CalendarOutlined, PlusOutlined, WhatsAppOutlined, BookOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Spin, Card, Space, Button, Select, Input, Typography, Popconfirm, Timeline } from "antd";
import { message } from "antd";

const { Text } = Typography;

const LeadActivitiesTab = () => {
    const { id: leadId } = useParams<{ id: string }>();

    const queryClient = useQueryClient();

    const activityKindOptions = [
        { value: ActivityKind.CALL, label: "Call" },
        { value: ActivityKind.FOLLOW_UP, label: "Follow Up Call" },
        { value: ActivityKind.EMAIL, label: "Email" },
        { value: ActivityKind.MEETING, label: "Meeting" },
        { value: ActivityKind.WHATSAPP, label: "WhatsApp" },
        { value: ActivityKind.NOTE, label: "Note" }
    ]

    const[error, setError] = useState<string | null>(null);
    const [newActivityContent, setNewActivityContent] = useState<LeadActivityCreate>({
        kind: ActivityKind.CALL,
        summary: "",
    });

    const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
    const [editingActivityContent, setEditingActivityContent] = useState<string>("");

    const { data: activitiesData, isLoading: isLoadingActivities } = useQuery<LeadActivityList>({
        queryKey: ['leadActivities', leadId],
        queryFn: () => listLeadActivities(leadId!),
        enabled: !!leadId,
    })

    const isLoading = isLoadingActivities;

    const activityIconMap: Record<ActivityKind, React.ReactNode> = {
        call: <PhoneOutlined />, 
        follow_up_call: <PhoneOutlined />,
        email: <MailOutlined />,
        meeting: <CalendarOutlined />,
        whatsapp: <WhatsAppOutlined />,
        note: <BookOutlined />
    }

    const createActivityMutation = useMutation({
        mutationFn: (activityContent: LeadActivityCreate) => createLeadActivity(leadId!, activityContent), 
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leadActivities', leadId]})
            message.success("Activity created successfully");
            setNewActivityContent({
                kind: ActivityKind.NOTE,
                summary: "",
            })
            setError(null);
        },
        onError: () => {
            message.error("Failed to create activity");
            setError("Failed to create activity");
        }
    });

    const updateActivityMutation = useMutation({
        mutationFn: ({ activityId, activityContent }: {activityId: string, activityContent: LeadActivityUpdate}) => {
            return updateLeadActivity(leadId!, activityId, activityContent)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leadActivities', leadId]})
            message.success("Activity updated successfully");
            setError(null);
            setEditingActivityId(null);
            setEditingActivityContent("");
        },
        onError: () => {
            message.error("Failed to update activity");
            setError("Failed to update activity");
        }
    })

    const deleteActivityMutation = useMutation({
        mutationFn: (activityId: string) => deleteLeadActivity(leadId!, activityId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leadActivities', leadId]})
            setError(null);
            message.success("Activity deleted successfully");
        },
        onError: () => {
            message.error("Failed to delete activity");
            setError("Failed to delete activity");
        }
    })

    const handleAddActivity = async () => {
        if (!newActivityContent.kind ) {
            setError("Activity kind is required");
            message.error("Activity kind is required");
            return;
        }
        setError(null);
        createActivityMutation.mutate({ 
            kind: newActivityContent.kind,
            ...( newActivityContent.summary ? { summary: newActivityContent.summary } : {} )
         });
    }

    const handleDeleteActivity = (activityID: string) => {
        deleteActivityMutation.mutate(activityID);
    }

    const handleStartEditActivity = (activity: LeadActivity) => {
        setEditingActivityId(activity.id);
        setEditingActivityContent(activity.summary ?? "");
    }

    const handleCancelEditActivity = () => {
        setEditingActivityId(null);
        setEditingActivityContent("");
    }

    const handleSaveEditActivity = (activity: LeadActivity) => {
        const trimmed = editingActivityContent.trim();
        if (!trimmed) {
            setError("No activity selected for editing");
            message.error("No activity selected for editing");
            return;
        }
        updateActivityMutation.mutate({
            activityId: activity.id,
            activityContent: {
                summary: trimmed,
            }
        });
    }

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                <Spin size="large" />
            </div>
        )
    }

    if (!activitiesData) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
                <Card><p>Activities not found</p></Card>
            </div>
        )
    }

    return (
        <div style={{ width: '100%' }}>
            <Space orientation="vertical" style={{ width: '100%' }} size="large">
                <Card size="small" title="Log Activity">
                    {error && <Text type="danger" style={{ display: 'block', marginBottom: '8px' }}>{error}</Text>}
                    <Space orientation="vertical" style={{ width: '100%' }} size="middle">
                        <Select
                            value={newActivityContent.kind}
                            onChange={(kind) =>
                                setNewActivityContent(
                                    prev => ({...prev, kind})
                                )
                            }
                            options={activityKindOptions}
                            style={{ width: '100%' }}
                        />

                        <Input
                            value={newActivityContent.summary ?? ""}
                            onChange={(e) => setNewActivityContent((p) => ({...p, summary: e.target.value}))}
                            placeholder="Write a summary (eg. Called client regarding documents...)"
                            style={{ width: '100%' }}
                        />
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAddActivity}
                            loading={createActivityMutation.isPending}
                            block
                        >
                            Add
                        </Button>
                    </Space>
                </Card>

                <Card size="small" title={`Timeline (${activitiesData.total_count})`}>
                    {activitiesData.total_count === 0 ? (
                        <Text type="secondary">No activities logged.</Text>
                    ) : (
                        <Timeline
                            items={activitiesData.activities.map((activity) => {
                                return {
                                    dot: activityIconMap[activity.kind],
                                    color: 'blue',
                                    children: (
                                        <div style={{ marginBottom: '16px' }}>
                                            <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>
                                                {new Date(activity.occurred_at).toLocaleString()}
                                            </Text>
                                            {editingActivityId !== activity.id ? (
                                                <div>
                                                    <div style={{ marginBottom: '8px' }}>
                                                        <Text strong style={{ textTransform: 'capitalize' }}>
                                                            {activity.kind.replace("_", " ")}
                                                        </Text>
                                                    </div>
                                                    <div style={{ marginBottom: '12px' }}>
                                                        {activity.summary ? (
                                                            <Text>{activity.summary}</Text>
                                                        ) : (
                                                            <Text type="secondary" italic>No Summary</Text>
                                                        )}
                                                    </div>
                                                    <Space wrap size="small">
                                                        <Button 
                                                            type="text" 
                                                            size="small" 
                                                            icon={<EditOutlined/>} 
                                                            onClick={() => handleStartEditActivity(activity)}
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Popconfirm 
                                                            title="Delete this activity?"
                                                            description="This action cannot be undone."
                                                            okText="Delete"
                                                            okButtonProps={{ danger: true }}
                                                            cancelText="Cancel"
                                                            onConfirm={() => handleDeleteActivity(activity.id)}
                                                        >
                                                            <Button 
                                                                type="text" 
                                                                size="small" 
                                                                danger 
                                                                icon={<DeleteOutlined/>} 
                                                                loading={deleteActivityMutation.isPending}
                                                            >
                                                                Delete
                                                            </Button>
                                                        </Popconfirm>
                                                    </Space>
                                                </div>
                                            ) : (
                                                <div>
                                                    <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                                                        Edit Activity
                                                    </Text>
                                                    <Input.TextArea 
                                                        value={editingActivityContent}
                                                        onChange={(e) => setEditingActivityContent(e.target.value)}
                                                        autoSize={{ minRows: 2, maxRows: 4 }}
                                                        style={{ marginBottom: '8px' }}
                                                    />
                                                    <Space wrap size="small">
                                                        <Button 
                                                            type="primary"
                                                            size="small"
                                                            onClick={() => handleSaveEditActivity(activity)}
                                                            loading={updateActivityMutation.isPending}
                                                        >
                                                            Save
                                                        </Button>
                                                        <Button 
                                                            size="small" 
                                                            onClick={handleCancelEditActivity}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </Space>
                                                </div>
                                            )}
                                        </div>
                                    )
                                }
                            })}
                        />
                    )}
                </Card>
            </Space>
        </div>
    )
};

export default LeadActivitiesTab;
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
        return (<div>
            <Spin size="large" />
        </div>)
    }

    if (!activitiesData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card><p>Activities not found</p></Card>
            </div>
        )
    }



    return (
        <div className="w-full">
            <Space orientation="vertical" className="w-full" size="large">

                <Card size="small" title="Log Activity">
                    { error && <Text type="danger">{error}</Text> }
                    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
                        <Select
                            value={newActivityContent.kind}
                            onChange={(kind) =>
                                setNewActivityContent(
                                    prev => ({...prev, kind})
                                )
                            }
                            options={activityKindOptions}
                            className="w-full sm:w-48"
                        />

                        <Input
                            value={newActivityContent.summary ?? ""}
                            onChange={(e) => setNewActivityContent((p) => ({...p, summary: e.target.value}))}
                            placeholder="Write a summary (eg. Called client regarding documents...)"
                            className="flex-1"
                        />
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAddActivity}
                            loading={createActivityMutation.isPending}
                            className="w-full sm:w-auto"
                        >
                            Add
                        </Button>
                    </div>
                </Card>

                <Card size="small" title={`Timeline (${activitiesData.total_count})`}>
                    {activitiesData.total_count === 0 ? (<Text type="secondary">No activities logged.</Text>) :

                        (
                            <Timeline
                                items={activitiesData.activities.map((activity) => {
                                    return {
                                        icon: activityIconMap[activity.kind],
                                        title: (<Text type="secondary">
                                            {new Date(activity.occurred_at).toLocaleString()}
                                        </Text>),
                                        content: (
                                            <div>
                                               {editingActivityId !== activity.id ? (
                                                <>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                                <div style={{ flex: 1}}>
                                                <div style={{ fontWeight: 600 }}>{activity.kind.replace("_", " ")}</div>
                                                <div>{activity.summary ?? <Text type="secondary">No Summary</Text>}</div>
                                                </div>
                                                <Space size="small">
                                                    <Button type="text" size="small" icon={<EditOutlined/>} onClick={() => handleStartEditActivity(activity)}/>

                                                    <Popconfirm 
                                                        title="Delete this activity"
                                                        description="Are you sure you want to delete this activity?"
                                                        okText="Yes"

                                                        cancelText="No"
                                                        onConfirm={() => handleDeleteActivity(activity.id)}>
                                                            <Button type="text" size="small" danger icon={<DeleteOutlined/>} loading={deleteActivityMutation.isPending}/>
                                                        </Popconfirm>
                                                </Space>
                                                </div>
                                                </>
                                                ) : (
                                                    <>
                                                        <Text strong>Edit Activity</Text>

                                                        <Input.TextArea 
                                                            value={editingActivityContent}
                                                            onChange={(e) => setEditingActivityContent(e.target.value)}
                                                            autoSize={{ minRows: 2, maxRows: 4 }}
                                                            style={{ marginTop: 10 }} />

                                                        <Space style={{ marginTop: 10}}>
                                                            <Button 
                                                                type="primary"
                                                                size="small"
                                                                onClick={() => handleSaveEditActivity(activity)}
                                                                loading={updateActivityMutation.isPending}>
                                                                    Save
                                                            </Button>
                                                            <Button size="small" onClick={handleCancelEditActivity}>
                                                                Cancel
                                                            </Button>
                                                        </Space>
                                                    </>
                                                )} 
                                                
                                            </div>
                                        )
                                    }
                                })}
                            >

                            </Timeline>
                        )
                    }

                </Card>
            </Space>


        </div>
    )

    

};

export default LeadActivitiesTab;

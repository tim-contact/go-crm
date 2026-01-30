import {useState} from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, Card, Descriptions, Input, Button, Space, Spin, message, Flex, Typography } from 'antd';
import { UserOutlined, PhoneOutlined, PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { type LeadNote, type LeadNoteCreate, listLeadNotes, createLeadNote, updateLeadNote, deleteLeadNote, type LeadNoteUpdate} from '@/api/leadnotes';
import { type Lead, getLead} from '@/api/leads';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import {Badge} from '@/components/UI';
import { useLeadActions } from "@/hooks/useLeadActions";
import { LeadEditModal } from '@/components/Form/LeadModal';
import  LeadActivitiesTab  from '@/components/Lead/LeadActivitiesTab';
import  LeadTasksTab  from '@/components/Lead/LeadTasksTab';

const { TextArea } = Input;
const { Text } = Typography;

const LeadDetailPage = () => { 

    const {id: leadId} = useParams<{id: string}>();

    const queryClient = useQueryClient();

    const [newNoteContent, setNewNoteContent] = useState('');
    const [error, setError] = useState<string|null>(null);
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [editingNoteContent, setEditingNoteContent] = useState<string>('');
    const { handleDeleteLead} = useLeadActions();
    const [showEditModal, setShowEditModal] = useState(false);


    const { data: leadData, isLoading: isLoadingLead } = useQuery<Lead>({
        queryKey: ['lead', leadId],
        queryFn: () => getLead(leadId!), enabled: !!leadId
    });

    const { data:  notes = [], isLoading: isLoadingNotes } = useQuery<LeadNote[]>({
        queryKey: ['notes', leadId],
        queryFn: () => listLeadNotes(leadId!).then(data => data.notes), enabled: !!leadId
    });

    const isLoading = isLoadingNotes || isLoadingLead;

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

    const createNoteMutation = useMutation({
        mutationFn: (noteContent: LeadNoteCreate) => createLeadNote(leadId!, noteContent),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notes", leadId] });
            message.success("Note added successfully");
            setNewNoteContent('');
            setError(null);
        },
        onError: () => {
            message.error("Failed to add note");
            setError("Failed to add note");
        }
    })

    const deleteNoteMutation = useMutation({
        mutationFn: (noteId: string) => deleteLeadNote(leadId!, noteId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notes", leadId]})
            setError(null);
            message.success("Note deleted successfully");
        },
        onError: () => {
            message.error("Failed to delete note");
            setError("Failed to delete note");
        }

    })

    const updateNoteMutation = useMutation({
        mutationFn: ({ noteId, body }: { noteId: string; body: LeadNoteUpdate }) => updateLeadNote(leadId!, noteId, body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notes", leadId]})
            message.success("Note updated successfully");
            setError(null);
            setEditingNoteId(null);
            setEditingNoteContent('');
        },
        onError: () => {
            message.error("Failed to update note");
            setError("Failed to update note");
        }
    })


    const handleAddNote = async () => {
        if (!newNoteContent.trim()) {
            setError("Note content cannot be empty");
            return;
        }

        setError(null);
        createNoteMutation.mutate({ body: newNoteContent });
    };

    const handleDeleteNote = (noteId: string) => {
        deleteNoteMutation.mutate(noteId);
    }

    
    const handleStartEditNote = (note: LeadNote) => {
        setEditingNoteId(note.id);
        setEditingNoteContent(note.body);
    }

    const handleCancelEditNote = () => {
        setEditingNoteId(null);
        setEditingNoteContent('');
    }

    const handleSaveEditNote = async (noteId: string) => {
        if (!editingNoteContent.trim()) {
            setError("Note content cannot be empty");
            message.error("Note content cannot be empty");
        }

        updateNoteMutation.mutate({ noteId, body: {body: editingNoteContent } });
    }

    if (isLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <Spin size="large" />
            </div>
        )
    }

    if (!leadData) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <Card><p>Lead Not Found</p></Card>
            </div>
        );
    }

    return(
        <div style={{ width: '100%', minHeight: '100vh', padding: '16px' }}>
            {!isLoading && (
                <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                    <Button
                        icon={<ArrowLeftOutlined/>}
                        onClick={() => window.history.back()}
                        style={{ marginBottom: '16px' }}
                    >
                        Back to Leads
                    </Button>

                   <Card
    title={
        <div style={{ paddingBottom: '16px' }}>
            <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
                <Space wrap align="center" size="middle">
                    <Text strong style={{ fontSize: '20px', margin: 0 }}>
                        {leadData?.full_name}
                    </Text>
                    {renderStatusBadge(leadData?.status)}
                </Space>
                <Space wrap style={{ width: '100%' }}>
                    <Button type="primary" onClick={() => setShowEditModal(true)}>
                        Edit Lead
                    </Button>
                    <Button danger onClick={() => handleDeleteLead(leadData?.id)}>
                        Delete
                    </Button>
                </Space>
            </Space>
        </div>
    }
    style={{ marginBottom: '16px' }}
> 
                        <Tabs 
                            defaultActiveKey="1" 
                            size="large"
                            items={[
                                {
                                    key: "1",
                                    label: "Information",
                                    children: (
                                        <Descriptions
                                            bordered
                                            size="small"
                                            column={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 2, xxl: 2 }}
                                            labelStyle={{ fontWeight: 500 }}
                                        >
                                            <Descriptions.Item label={<><UserOutlined /> Inquire ID</>}>
                                                {leadData?.inq_id}
                                            </Descriptions.Item>
                                            <Descriptions.Item label={<><UserOutlined /> Name</>}>
                                                {leadData?.full_name}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Country">
                                                {leadData?.destination_country}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Field of Study">
                                                {leadData?.field_of_study}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Age">
                                                {leadData?.age}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Visa Category">
                                                {leadData?.visa_category}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Principal">
                                                {leadData?.principal}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="GPA">
                                                {leadData?.gpa}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Allocated User">
                                                {leadData?.allocated_user_name || leadData?.allocated_user_id || "-"}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Team">
                                                {leadData?.team}
                                            </Descriptions.Item>
                                            <Descriptions.Item label={<><PhoneOutlined /> WhatsApp</>}>
                                                {leadData?.whatsapp_no}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Branch">
                                                {leadData?.branch_name}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Inquiry Date">
                                                {leadData?.inquiry_date
                                                    ? new Date(leadData.inquiry_date).toISOString().slice(0, 10)
                                                    : "-"}
                                            </Descriptions.Item>
                                        </Descriptions>
                                    )
                                },
                                {
                                    key: "2",
                                    label: "Notes",
                                    children: (
                                        <Space orientation="vertical" style={{ width: '100%' }} size="large">
                                            <Card size="small" title="Add New Note">
                                                {error && <Text type="danger" style={{ marginBottom: '8px', display: 'block' }}>{error}</Text>}
                                                <Space orientation="vertical" style={{ width: '100%' }}>
                                                    <TextArea
                                                        value={newNoteContent}
                                                        onChange={(e) => setNewNoteContent(e.target.value)}
                                                        placeholder='Write a note here...'
                                                        autoSize={{ minRows: 2, maxRows: 4 }}
                                                        maxLength={500}
                                                    />
                                                    <Button
                                                        type="primary"
                                                        icon={<PlusOutlined />}
                                                        onClick={handleAddNote}
                                                        loading={createNoteMutation.isPending}
                                                        block
                                                    >
                                                        Add Note
                                                    </Button>
                                                </Space>
                                            </Card>

                                            <Flex vertical gap="small">
                                                {notes.length === 0 && (
                                                    <Card size="small">
                                                        <Text type="secondary">No notes yet. Add the first note above</Text>
                                                    </Card>
                                                )}
                                                {notes.map((note) => (
                                                    <Card key={note.id} size="small">
                                                        {editingNoteId === note.id ? (
                                                            <Space orientation="vertical" style={{ width: '100%' }}>
                                                                <TextArea 
                                                                    value={editingNoteContent}
                                                                    onChange={(e) => setEditingNoteContent(e.target.value)}
                                                                    autoSize={{ minRows: 2, maxRows: 4 }}
                                                                />
                                                                <Space wrap>
                                                                    <Button
                                                                        type='primary'
                                                                        size='small'
                                                                        onClick={() => handleSaveEditNote(note.id)}
                                                                        loading={updateNoteMutation.isPending}
                                                                    >
                                                                        Save
                                                                    </Button>
                                                                    <Button 
                                                                        size='small'
                                                                        onClick={handleCancelEditNote}
                                                                    >
                                                                        Cancel
                                                                    </Button>
                                                                </Space>
                                                            </Space>
                                                        ) : (
                                                            <>
                                                                <Text style={{ display: 'block', marginBottom: '8px' }}>
                                                                    {note.body}
                                                                </Text>
                                                                <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>
                                                                    {new Date(note.created_at).toLocaleString()} • {note.created_by}
                                                                </Text>
                                                                <Space wrap size="small">
                                                                    <Button 
                                                                        size="small"
                                                                        onClick={() => handleStartEditNote(note)}
                                                                    >
                                                                        Edit
                                                                    </Button>
                                                                    <Button 
                                                                        danger
                                                                        size="small"
                                                                        onClick={() => handleDeleteNote(note.id)}
                                                                    >
                                                                        Delete
                                                                    </Button>
                                                                </Space>
                                                            </>
                                                        )}
                                                    </Card>
                                                ))}
                                            </Flex>
                                        </Space>
                                    )
                                },
                                {
                                    key: "3",
                                    label: "Activities",
                                    children: <LeadActivitiesTab />
                                },
                                {
                                    key: "4",
                                    label: "Tasks",
                                    children: <LeadTasksTab />
                                }
                            ]}
                        />
                    </Card> 
                    {leadData && (
                        <LeadEditModal
                            lead={leadData}
                            isOpen={showEditModal}
                            onClose={() => setShowEditModal(false)}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

export default LeadDetailPage;
import {useState} from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, Card, Descriptions, Input, Button,  Space, Spin, message, Flex, Typography } from 'antd';
import { UserOutlined, PhoneOutlined, PlusOutlined,  ArrowLeftOutlined } from '@ant-design/icons';
import { type LeadNote, type LeadNoteCreate, listLeadNotes, getLeadNote, createLeadNote, updateLeadNote, deleteLeadNote, type LeadNoteUpdate} from '@/api/leadnotes';
import { type Lead, getLead} from '@/api/leads';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import {Badge} from '@/components/UI';

const { TextArea } = Input;
const { Text } = Typography;

const LeadDetailPage = () => { 

    const {id: leadId} = useParams<{id: string}>();

    const queryClient = useQueryClient();

    const [newNoteContent, setNewNoteContent] = useState('');
    const [error, setError] = useState<string|null>(null);

    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [editingNoteContent, setEditingNoteContent] = useState<string>('');

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
                <div className='flex items-center justify-center min-h-screen'>
                    <Spin size="large" />
                </div>
        )
    }

    if (!leadData) {
        return (
            <div className='flex items-center justify-center min-h-screen'>
                <Card><p>Lead Not Found</p></Card>
            </div>
        );
    }

    return(
        <div className='w-full min-h bg-gray-50 p-6'>
            {!isLoading && (
                <div className='max-w-7xl mx-auto'>
                    <Button
                    icon={<ArrowLeftOutlined/>}
                    onClick={() => window.history.back()}
                    className='mb-4'
                    >
                        Back to Leads
                    </Button>

                    <Card className='m-4 p-4' 
                    title={
                        <div className='flex items-center gap-4'>
                            <h2 className='text-2xl font-bold m-0'>{leadData?.full_name}</h2>
                            {renderStatusBadge(leadData?.status)}
                        </div>
                    }
                    extra={
                      <Space>
                      <Button type="primary"> Edit Lead</Button>
                      <Button danger>Delete</Button>
                      </Space>  
                    } 
                    >
                        <Tabs defaultActiveKey="1" size='large'>
                            <Tabs.TabPane tab="Lead Information" key="1">
                                <Descriptions bordered column={2}>
                                    <Descriptions.Item label={<><UserOutlined/>Inquire ID</>}>{leadData?.inq_id}</Descriptions.Item>
                                    <Descriptions.Item label={<><UserOutlined/> Name</>}>{leadData?.full_name}</Descriptions.Item>
                                    <Descriptions.Item label="Country">{leadData?.destination_country}</Descriptions.Item>
                                    <Descriptions.Item label="Field of Study">{leadData?.field_of_study}</Descriptions.Item>
                                    <Descriptions.Item label="Age">{leadData?.age}</Descriptions.Item>
                                    <Descriptions.Item label="Visa Category">{leadData?.visa_category}</Descriptions.Item>
                                    <Descriptions.Item label="Principal">{leadData?.principal}</Descriptions.Item>
                                    <Descriptions.Item label="GPA">{leadData?.gpa}</Descriptions.Item>
                                    <Descriptions.Item label="Allocated User">{leadData?.allocated_user_id}</Descriptions.Item>
                                    <Descriptions.Item label="Team">{leadData?.team}</Descriptions.Item>
                                    <Descriptions.Item label={<><PhoneOutlined/>Whatsapp Number</>}>{leadData?.whatsapp_no}</Descriptions.Item>
                                    <Descriptions.Item label="Branch">{leadData?.branch_name}</Descriptions.Item>
                                    <Descriptions.Item label="Inquiry Date">{leadData?.inquiry_date}</Descriptions.Item>
                                    
                                </Descriptions>
                            </Tabs.TabPane>
                            <Tabs.TabPane tab="Notes" key="2">
                                <Space orientation='vertical' className='w-full' size="large">
                                    <Card size="small" title="Add New Note">
                                        {error && <Text type="danger" className='mb-2 block'>{error}</Text>}
                                        <Space.Compact className='w-full'>
                                            <TextArea
                                                value={newNoteContent}
                                                onChange={(e) => setNewNoteContent(e.target.value)}
                                                placeholder='Write a note here...'
                                                autoSize={{ minRows: 2, maxRows: 4 }}
                                                maxLength={100}
                                                style={{ width: 'calc(100% - 100px)' }}
                                            />
                                            <Button
                                                type="primary"
                                                icon={<PlusOutlined />}
                                                onClick={handleAddNote}
                                                loading={createNoteMutation.isPending}
                                                style={{ height: 'auto'}}
                                            > Add </Button>
                                        </Space.Compact>
                                    </Card>

                                    <Flex 
                                        vertical gap="small"
                                    >
                                        {notes.length === 0 && (
                                            <Card size="small">
                                                <Text type="secondary">No notes yet. Add the first note above</Text>
                                            </Card>
                                        )}
                                        {notes.map((note) => (
                                            <Card key={note.id} size="small">
                                                {editingNoteId === note.id && (
                                                    <Space orientation='vertical' className='w-full'>
                                                        <TextArea 
                                                            value={editingNoteContent}
                                                            onChange={(e) => setEditingNoteContent(e.target.value)}
                                                            autoSize={{ minRows: 2, maxRows: 4 }}
                                                        />
                                                        <Space>
                                                            <Button
                                                                type='primary'
                                                                size='small'
                                                                onClick = {() => handleSaveEditNote(note.id)}
                                                                loading={updateNoteMutation.isPending}
                                                            > Save </Button>
                                                            <Button 
                                                                size='small'
                                                                onClick={handleCancelEditNote}
                                                            > Cancel </Button>
                                                        </Space>
                                                    </Space>
                                                )}
                                                <Text className='block mb-2'>
                                                    {note.body}
                                                </Text>
                                                <Text type="secondary" className='text-sm'>
                                                    {new Date(note.created_at).toLocaleString()} created by {note.created_by}
                                                </Text>
                                                <div style={{ textAlign: 'right', marginTop: '8px' }}>
                                                    <Space size="small">
                                                        <Button color='primary' variant='outlined' onClick={() => handleStartEditNote(note)}>Edit</Button>
                                                        <Button danger
                                                            onClick={handleDeleteNote.bind(null, note.id)}
                                                        >delete</Button>
                                                    </Space>
                                                </div>
                                            </Card>
                                        ))}
                                    </Flex>
                                </Space>
                            </Tabs.TabPane>
                        </Tabs>
                    </Card>
                </div>
            )}
        </div>
    );
}

export default LeadDetailPage;
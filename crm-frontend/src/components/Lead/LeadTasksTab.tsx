import { useState } from 'react';
import {
    List,
    Typography,
    message, 
    Space, 
    Button, 
    Tag, 
    Dropdown,
    theme
} from 'antd';
import { PlusOutlined, MoreOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { type LeadTaskCreate, type LeadTaskList, listLeadTasks, createLeadTask, TaskStatus, updateLeadTask } from '@/api/leadtasks';
import dayjs from 'dayjs';
import { TaskCreateModal } from '../Form/TaskModal';

const { Text } = Typography;

const LeadTasksTab = () => {
    const { id: leadId } = useParams<{ id: string }>();
    const { token } = theme.useToken();
    const queryClient = useQueryClient();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const { data: taskData, isLoading: isLoadingTasks } = useQuery<LeadTaskList>({
        queryKey: ['leadTasks', leadId],
        queryFn: () => listLeadTasks(leadId!),
        enabled: !!leadId
    });

    const isLoading = isLoadingTasks;

    const createTaskMutation = useMutation({
        mutationFn: (newTask: LeadTaskCreate) => createLeadTask(leadId!, newTask),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leadTasks', leadId] });
            message.success('Task created successfully');
            setIsModalOpen(false); 
        },
        onError: () => {
            message.error('Failed to create task');
        }
    });

    const updateTaskMutation = useMutation({
        mutationFn: ({ taskId, status }: { taskId: string, status: TaskStatus }) => {
            return updateLeadTask(leadId!, taskId, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leadTasks', leadId] });
            message.success('Task updated successfully');           
        },
        onError: () => {
            message.error('Failed to update task');
        }
    });

    const handleModalSubmit = (task: LeadTaskCreate) => {
        createTaskMutation.mutate(task);
    };

    const getStatusTag = (status: TaskStatus) => {
        switch (status) {
            case TaskStatus.OPEN:
                return <Tag color="blue">Open</Tag>;
            case TaskStatus.IN_PROGRESS:
                return <Tag color="orange">In Progress</Tag>;
            case TaskStatus.DONE:
                return <Tag color="green">Done</Tag>;
            case TaskStatus.CANCELLED:
                return <Tag color="red">Cancelled</Tag>;
            default:
                return <Tag>{status}</Tag>;
        }
    };

    const getStatusMenuItems = (taskId: string, currentStatus: TaskStatus) => [
        {
            key: TaskStatus.OPEN,
            label: 'Open',
            disabled: currentStatus === TaskStatus.OPEN,
            onClick: () => updateTaskMutation.mutate({ taskId, status: TaskStatus.OPEN as TaskStatus })
        },
        {
            key: TaskStatus.IN_PROGRESS,
            label: 'In Progress',
            disabled: currentStatus === TaskStatus.IN_PROGRESS,
            onClick: () => updateTaskMutation.mutate({ taskId, status: TaskStatus.IN_PROGRESS as TaskStatus })
        },
        {
            key: TaskStatus.DONE,
            label: 'Done',
            disabled: currentStatus === TaskStatus.DONE,
            onClick: () => updateTaskMutation.mutate({ taskId, status: TaskStatus.DONE as TaskStatus })
        },
        {
            key: TaskStatus.CANCELLED,
            label: 'Cancelled',
            disabled: currentStatus === TaskStatus.CANCELLED,
            onClick: () => updateTaskMutation.mutate({ taskId, status: TaskStatus.CANCELLED as TaskStatus })
        }
    ];

    return (
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsModalOpen(true)}
                style={{ marginBottom: 16 }}
            >
                Add Task
            </Button> 
            
            <TaskCreateModal 
                isOpen={isModalOpen}
                onSubmit={handleModalSubmit}
                onCancel={() => setIsModalOpen(false)}
            />

            <List
                bordered
                dataSource={taskData?.tasks || []}
                locale={{ emptyText: isLoading ? 'Loading tasks...' : 'No tasks found' }}
                renderItem={item => (
                    <List.Item>
                        <div style={{ width: '100%' }}>
                            <Space orientation="vertical" size="small" style={{ width: '100%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text strong>{item.title}</Text>
                                    <Dropdown 
                                        menu={{ items: getStatusMenuItems(item.id, item.status) }}
                                        trigger={['click']}
                                    >
                                        <Button 
                                            type="text" 
                                            icon={<MoreOutlined />} 
                                            size="small"
                                        />
                                    </Dropdown>
                                </div>
                                <div>
                                    <Text type="secondary">
                                        Due: {item.due_date ? dayjs(item.due_date).format('YYYY-MM-DD HH:mm') : 'N/A'}
                                    </Text>
                                </div>
                                <div>
                                    {getStatusTag(item.status)}
                                </div>
                                <div>
                                    <Text type="secondary">
                                        Assigned To: {item.assigned_to || 'Unassigned'}
                                    </Text>
                                </div>
                            </Space>
                        </div>
                    </List.Item>
                )}
            />
        </div>
    );
};

export default LeadTasksTab;
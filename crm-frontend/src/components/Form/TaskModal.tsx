import { Modal, Form, Input, Select, DatePicker } from "antd";
import { type LeadTaskCreate, TaskStatus } from "@/api/leadtasks";
import dayjs, {type Dayjs} from "dayjs";
import { useEffect } from "react";

type TaskCreateModalProps = {
    initial?: Partial<LeadTaskCreate>;
    isOpen: boolean;
    onSubmit: (task: LeadTaskCreate) => void;
    onCancel: () => void;
};

type TaskFormValues = {
  title: string;
  due_date: Dayjs | null;
  status: TaskStatus;
  assigned_to: string;
};

export const TaskCreateModal = ({
    initial,
    isOpen,
    onSubmit,
    onCancel
}: TaskCreateModalProps) => {

    const [form] = Form.useForm<TaskFormValues>();

    const getCurrentTime = () => {
        if (initial?.due_date) {
            return dayjs(initial.due_date);
        }

        return dayjs().add(3, 'day').hour(10).minute(0).second(0);
    } 

    useEffect (() => {
        form.setFieldsValue({
            title: initial?.title || "",
            due_date: getCurrentTime(),
            status: initial?.status || TaskStatus.OPEN,
            assigned_to: initial?.assigned_to || '',
        });
    }, [initial, form]);

    const handleSubmit = () => {
        const values = form.getFieldsValue();
        const submitData = {
            ...values,
            assigned_to: values.assigned_to?.trim() || null,
            due_date: values.due_date ? values.due_date.toISOString() : new Date().toISOString(),
        };
        console.log("Form values:", submitData);
        onSubmit(submitData);
        form.resetFields();
    };


  return (
    <Modal
      open={isOpen}
      title="Create Task"
      okText="Create"
      onOk={handleSubmit}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          title: "follow up call",
          status: TaskStatus.OPEN,
          due_date: getCurrentTime(),

        }}
      >
        <Form.Item
          name="title"
          label="Task Title"
          rules={[{ required: true, message: "Title is required" }]}
        >
          <Input placeholder="Call the lead" />
        </Form.Item>

        <Form.Item name="status" label="Status" rules={[{ required: true, message: "Status is required" }]}>
          <Select
            options={[
              { label: "Open", value: TaskStatus.OPEN },
              { label: "In Progress", value: TaskStatus.IN_PROGRESS },
              { label: "Done", value: TaskStatus.DONE },
              { label: "Cancelled", value: TaskStatus.CANCELLED },
            ]}
          />
        </Form.Item>

        
        <Form.Item name="assigned_to" label="Assigned To">
          <Input placeholder="User ID / Email / Name" />
        </Form.Item>

        <Form.Item name="due_date" label="Due Date">
          <DatePicker 
          needConfirm
          showTime
          placeholder="Select due date and time"
          value={form.getFieldValue("due_date") ? dayjs(form.getFieldValue("due_date")): null}
          style={{ width: "100%" }} />
        </Form.Item>
      </Form>
    </Modal>
  );
}

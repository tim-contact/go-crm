import { useEffect } from "react";
import { type LeadCreate } from "@/api/leads";
import { listUsers, type UserListItem } from "@/api/users";
import { Form, Input, InputNumber, DatePicker, Select, Button } from "antd"
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";

type props = {

    initial?: Partial<LeadCreate>;
    onSubmit: (values: LeadCreate) => void;
    onCancel: () => void;
    submitting?: boolean;

};

export default function LeadForm({ initial, onSubmit, onCancel, submitting }: props) {

    const [form] = Form.useForm();
    const { data: usersData, isLoading: isLoadingUsers } = useQuery<{ users: UserListItem[] }>({
        queryKey: ["users"],
        queryFn: () => listUsers(),
    });
    const userOptions = (usersData?.users || []).map(u => ({
        label: u.name,
        value: u.id,
    }));

    const getCurrentTime = () => {
        if (initial?.inquiry_date) {
            return dayjs(initial.inquiry_date);
        }

        return dayjs();
    }

    useEffect(() => {
        form.setFieldsValue({
            inq_id: initial?.inq_id || "",
            full_name: initial?.full_name || "",
            destination_country: initial?.destination_country || "",
            status: initial?.status || "New",
            field_of_study: initial?.field_of_study || "",
            age: initial?.age || undefined,
            visa_category: initial?.visa_category || "",
            principal: initial?.principal || "",
            gpa: initial?.gpa || undefined,
            allocated_user_id: initial?.allocated_user_id || "",
            team: initial?.team || "",
            branch: initial?.branch || "",
            whatsapp_no: initial?.whatsapp_no || "",
            inquiry_date: getCurrentTime(),
        });
    }, [initial, form]);

    const handleSubmit = (values: any) => {
        const submitData = {
            ...values,
            inquiry_date: values.inquiry_date ? values.inquiry_date.toISOString() : new Date().toISOString()
        };
        console.log("Form values:", submitData);
        onSubmit(submitData);
    } 

    return(
        <div className="flex flex-col h-full max-h-[80vh]">

            <div className="flex-1 overflow-y-auto p-4">
        <Form 
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
                status: "New",
                gpa: undefined,
                age: undefined,
                inquiry_date: getCurrentTime(),
            }}
    >
        <Form.Item label="Inquiry ID" name="inq_id" rules={[{ required: true, message: "Please enter Inquiry ID" }]}>
            <Input />
        </Form.Item>

        <Form.Item label="Full Name" name="full_name" rules={[{ required: true, message: "Please enter Full Name" }]}>
            <Input />
        </Form.Item>

        <Form.Item label="Destination Country" name="destination_country" rules={[{ required: true, message: "Please enter Destination Country" }]}>
            <Input />
        </Form.Item>

        <Form.Item label="Status" name="status" rules={[{ required: true, message: "Please enter Status" }]}>
            <Select options={[{label: "New", value: "New"}, {label: "In Progress", value: "In Progress"}, {label: "Closed", value: "Closed"}]}></Select>
        </Form.Item>

        <Form.Item label="Field of Study" name="field_of_study">
            <Input />
        </Form.Item>

        <Form.Item label="Age" name="age">
            <InputNumber min={0} max={100} />
        </Form.Item>

        <Form.Item label="Visa Category" name="visa_category">
            <Select options={[{label: "Student", value: "Student"}, {label: "Tourist", value: "Tourist"}, {label: "Work", value: "Work"}]}></Select>
        </Form.Item>

        <Form.Item label="Principal" name="principal">
            <Input />
        </Form.Item>

        <Form.Item label="GPA" name="gpa">
            <InputNumber min={0} max={4} step={0.01} />
        </Form.Item>

        <Form.Item label="Allocated User" name="allocated_user_id">
            <Select
                placeholder="Select a user"
                options={userOptions}
                showSearch={{
                    filterOption: (input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase()),
                }}
                allowClear
                loading={isLoadingUsers}
                notFoundContent={isLoadingUsers ? "Loading users..." : "No users available"}
            />
        </Form.Item>

        <Form.Item label="Team" name="team">
            <Input />
        </Form.Item>

        <Form.Item label="WhatsApp No" name="whatsapp_no" rules={[{ required: true, message: "Please enter the WhatsApp Number"}, {pattern: /^[0-9]{10}$/, message: "Please enter a valid 10-digit number"}]}>
            <Input placeholder="0712345678"/>
        </Form.Item>

        <Form.Item label="Branch" name="branch" rules={[{ required: true, message: "Please enter Branch" }]}>
            <Input />
        </Form.Item>

        <Form.Item label="Inquiry Date" name="inquiry_date" rules={[{ required: true, message: "Please select Inquiry Date" }]}>
            <DatePicker showTime />
        </Form.Item>


        <Form.Item>
            <Button htmlType="button" onClick={onCancel} disabled={submitting}>
                Cancel
            </Button>
            <Button htmlType="submit" disabled={submitting} className="ml-2">
                {submitting ? "Saving..." : "Save"}
            </Button>
        </Form.Item>
    </Form>
    </div>
    </div>
    )
     

}

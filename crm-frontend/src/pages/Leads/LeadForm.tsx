import { useState } from "react";
import { Button } from "@/components/UI";
import { type LeadCreate } from "@/api/leads";

type props = {

    initial?: Partial<LeadCreate>;
    onSubmit: (values: LeadCreate) => void;
    onCancel: () => void;
    submitting?: boolean;

};

export default function LeadForm({ initial, onSubmit, onCancel, submitting }: props) {

    const getCurrentTime = () => {
        if (initial?.inquiry_date) {
            return new Date(initial.inquiry_date).toISOString().slice(0,16);
        }

        return new Date().toISOString().slice(0,16);
    }

    const [values, setValues] = useState<LeadCreate>({
        inq_id: initial?.inq_id || "",
        full_name: initial?.full_name || "",
        destination_country: initial?.destination_country || "",
        status: initial?.status || "New",
        field_of_study: initial?.field_of_study || "",
        age: initial?.age ?? undefined,
        visa_category: initial?.visa_category || "",
        principal: initial?.principal || "",
        gpa: initial?.gpa || 0.00,
        allocated_user_id: initial?.allocated_user_id || "",
        team: initial?.team || "",
        branch: initial?.branch || "",
        whatsapp_no: initial?.whatsapp_no || "",
        inquiry_date: getCurrentTime(), 
    })

    const handleChange = (key: keyof LeadCreate) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.type === "number" ? (e.target.value === "" ? undefined : Number(e.target.value)) : e.target.value;
        setValues(prev => ({...prev, [key]: value }));
        
    }

    return(
        <form 
        onSubmit={(e) => {
            e.preventDefault();
            console.log("Form values:", values); 
            onSubmit(values);
        }}>
            <div>
                <label className="block text-sm font-medium text-gray-700">Inquiry ID</label>
                <input className="w-full border rounded px-3 py-2" value={values.inq_id} onChange={handleChange("inq_id")} required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input className="w-full border rounded px-3 py-2" value={values.full_name} onChange={handleChange("full_name")} required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Destination Country</label>
                <input className="w-full border rounded px-3 py-2" value={values.destination_country} onChange={handleChange("destination_country")}  />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <input className="w-full border rounded px-3 py-2" value={values.status} onChange={handleChange("status")} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Field of Study</label>
                <input className="w-full border rounded px-3 py-2" value={values.field_of_study} onChange={handleChange("field_of_study")} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Age</label>
                <input className="w-full border rounded px-3 py-2" type="number" min="0" max="100" value={values.age ?? ""} onChange={handleChange("age")} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Visa Category</label>
                <input className="w-full border rounded px-3 py-2" value={values.visa_category} onChange={handleChange("visa_category")} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Principal</label>
                <input className="w-full border rounded px-3 py-2" value={values.principal} onChange={handleChange("principal")} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">GPA</label>
                <input className="w-full border rounded px-3 py-2" type="number" min="0" max="4" step="0.01" value={values.gpa} onChange={handleChange("gpa")} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Allocated User</label>
                <input className="w-full border rounded px-3 py-2" value={values.allocated_user_id} onChange={handleChange("allocated_user_id")} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Team</label>
                <input className="w-full border rounded px-3 py-2" value={values.team} onChange={handleChange("team")} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Whatsapp Contact</label>
                <input className="w-full border rounded px-3 py-2" type="tel" name="whatsapp_no" placeholder="0712345678" value={values.whatsapp_no} pattern="[0-9]{10}" onChange={handleChange("whatsapp_no")} required/>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Branch</label>
                <input className="w-full border rounded px-3 py-2" value={values.branch} onChange={handleChange("branch")} required/>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Inquiry Date</label>
                <input className="w-full border rounded px-3 py-2" type="datetime-local" value={values.inquiry_date} onChange={handleChange("inquiry_date")} />
            </div>


            <div>
                <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                <Button type="submit" disabled={submitting} className="ml-2"> {submitting ? "Saving..." : "Save"}</Button>
            </div>
        </form>
    );

}
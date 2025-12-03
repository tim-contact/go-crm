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
        branch: initial?.branch || "",
        whatsapp_no: initial?.whatsapp_no || "",
        inquiry_date: getCurrentTime(), 
    })

    const handleChange = (key: keyof LeadCreate) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setValues(prev => ({...prev, [key]: e.target.value }));
        
    }

    return(
        <form 
        onSubmit={(e) => {
            e.preventDefault();
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
                <input className="w-full border rounded px-3 py-2" value={values.destination_country} onChange={handleChange("destination_country")} required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <input className="w-full border rounded px-3 py-2" value={values.status} onChange={handleChange("status")} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Branch</label>
                <input className="w-full border rounded px-3 py-2" value={values.branch} onChange={handleChange("branch")} required/>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Whatsapp Contact</label>
                <input className="w-full border rounded px-3 py-2" type="tel" name="whatsapp_no" placeholder="0712345678" value={values.whatsapp_no} pattern="[0-9]{10}" onChange={handleChange("whatsapp_no")} required/>
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
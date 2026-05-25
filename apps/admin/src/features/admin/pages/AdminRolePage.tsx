import { Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

const surface = "rounded-[28px] border border-black/8 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.04)]";

export default function AdminRolePage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-black/45">About section</p>
        <h1 className="mt-2 text-[2.2rem] font-semibold tracking-[-0.05em] text-black">Admin profile</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
        <div className="space-y-6">
          <section className={surface}>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-black text-4xl font-semibold text-white">A</div>
              <h2 className="mt-6 text-[2rem] font-semibold tracking-[-0.05em] text-black">System Admin</h2>
              <p className="mt-2 text-sm text-black/45">admin@cybershop.com</p>
            </div>

            <div className="mt-8 grid gap-3">
              <InfoRow icon={<Mail className="h-4 w-4" />} text="admin@cybershop.com" />
              <InfoRow icon={<Phone className="h-4 w-4" />} text="(406) 555-0120" />
              <InfoRow icon={<MapPin className="h-4 w-4" />} text="2972 Westheimer Rd. Santa Ana, Illinois 85486" />
              <InfoRow icon={<ShieldCheck className="h-4 w-4" />} text="Super admin access" />
            </div>
          </section>

          <section className={surface}>
            <p className="text-sm font-medium text-black/45">Change password</p>
            <h2 className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] text-black">Security</h2>
            <div className="mt-6 space-y-4">
              <Field label="Current password" placeholder="Enter password" />
              <Field label="New password" placeholder="Enter password" />
              <Field label="Re-enter password" placeholder="Enter password" />
              <button type="button" className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-black text-sm font-semibold text-white transition hover:bg-[#1f1f1f]">Save Change</button>
            </div>
          </section>
        </div>

        <section className={surface}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-black/45">Profile update</p>
              <h2 className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] text-black">Editable details</h2>
            </div>
            <button type="button" className="inline-flex h-11 items-center justify-center rounded-full border border-black/10 px-5 text-sm font-semibold text-black transition hover:bg-black hover:text-white">Edit</button>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <Field label="First Name" value="System" />
            <Field label="Last Name" value="Admin" />
            <Field label="Password" value="**********" />
            <Field label="Phone Number" value="(406) 555-0120" />
            <Field label="E-mail" value="admin@cybershop.com" />
            <Field label="Date of Birth" value="12-January-1999" />
            <Field label="Location" value="2972 Westheimer Rd. Santa Ana, Illinois 85486" className="md:col-span-2" />
            <Field label="Credit Card" value="843-4359-4444" className="md:col-span-2" />
            <label className="block space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-black/58">Biography</span>
              <textarea defaultValue="Enter a biography about you" className="min-h-36 w-full rounded-2xl border border-black/10 bg-[#f5f5f5] px-4 py-3 text-sm outline-none" />
            </label>
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({ label, value, placeholder, className = "" }: { label: string; value?: string; placeholder?: string; className?: string }) {
  return (
    <label className={["block space-y-2", className].join(" ")}>
      <span className="text-sm font-medium text-black/58">{label}</span>
      <input defaultValue={value} placeholder={placeholder} className="h-12 w-full rounded-2xl border border-black/10 bg-[#f5f5f5] px-4 text-sm outline-none" />
    </label>
  );
}

function InfoRow({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-black/8 bg-[#f7f7f8] px-4 py-3 text-sm text-black/72">
      <span className="text-black/45">{icon}</span>
      <span>{text}</span>
    </div>
  );
}


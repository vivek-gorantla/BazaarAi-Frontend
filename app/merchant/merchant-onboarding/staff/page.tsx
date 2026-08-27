"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Trash2, CheckCircle2, UserCircle, Rocket } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../../contexts/LanguageContext";
import { AgentInput } from "../../../../agent/components/AgentInput";
import { AgentSelect } from "../../../../agent/components/AgentSelect";
import { AgentUIRegistry } from "../../../../agent/registry";

type Staff = {
  id: string;
  name: string;
  phone: string;
  role: string;
  status: string;
};

export default function StaffPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [storeId, setStoreId] = useState<string | null>(null);

  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    role: "cashier",
  });

  useEffect(() => {
    const id = localStorage.getItem("merchant_store_id");
    if (id) {
      setStoreId(id);
      fetchStaff(id);
    } else {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    AgentUIRegistry.registerPage("staff", "Staff Setup");
  }, []);

  const fetchStaff = async (id: string) => {
    try {
      const res = await fetch(`/api/merchant/stores/${id}/staff`, {
        headers: {
          "x-user-id": localStorage.getItem("merchant_token") || "",
          "Authorization": `Bearer ${localStorage.getItem("merchant_token")}`
        }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setStaff(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/merchant/stores/${storeId}/staff`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": localStorage.getItem("merchant_token") || "",
          "Authorization": `Bearer ${localStorage.getItem("merchant_token")}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        // Add to top of list
        setStaff([data.data, ...staff]);
        // Reset form
        setFormData({ name: "", phone: "", role: "cashier" });
      } else {
        alert(data.error?.message || "Failed to invite staff");
      }
    } catch (err) {
      console.error(err);
      alert("Error inviting staff");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (staffId: string) => {
    if (!confirm(t('merchant_onboarding.staff.delete_confirm'))) return;

    try {
      const res = await fetch(`/api/merchant/stores/${storeId}/staff/${staffId}`, {
        method: "DELETE",
        headers: {
          "x-user-id": localStorage.getItem("merchant_token") || "",
          "Authorization": `Bearer ${localStorage.getItem("merchant_token")}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setStaff(staff.filter(s => s.id !== staffId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const steps = [
    { name: t('merchant_onboarding.steps.business_details'), active: false },
    { name: t('merchant_onboarding.steps.store_identity'), active: false },
    { name: t('merchant_onboarding.steps.location'), active: false },
    { name: t('merchant_onboarding.steps.catalog'), active: false },
    { name: t('merchant_onboarding.steps.payments'), active: false },
    { name: t('merchant_onboarding.steps.staff'), active: true },
  ];

  return (
    <div className="min-h-screen bg-[#F2F7F2] font-sans pb-20">
      {/* Top Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 bg-transparent">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black flex items-center justify-center rounded-sm">
            <div className="w-4 h-0.5 bg-white" />
          </div>
          <span className="text-[10px] font-bold tracking-widest uppercase text-gray-800">
            {t('merchant_onboarding.title')}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium text-gray-600">
          <span>{t('merchant_onboarding.help')}</span>
          <div className="w-8 h-8 rounded-full bg-[#496246] flex items-center justify-center text-white text-xs">
            A
          </div>
        </div>
      </nav>

      {/* Stepper */}
      <div className="max-w-6xl mx-auto px-6 mt-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[11px] sm:text-xs font-bold uppercase tracking-widest text-gray-400">
          {steps.map((step, index) => (
            <div key={step.name} className="flex items-center gap-2 sm:gap-4">
              <span className={step.active ? "text-[#496246]" : ""}>
                {step.name}
              </span>
              {index < steps.length - 1 && (
                <span className="text-gray-300">&gt;</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12 relative">
        {/* Left Column: Form */}
        <div className="flex-1 max-w-lg">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">{t('merchant_onboarding.staff.title')}</h1>
            <p className="text-gray-600 mb-10 leading-relaxed max-w-sm">
              {t('merchant_onboarding.staff.subtitle')}
            </p>
          </motion.div>

          <form onSubmit={handleInvite} className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 mb-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-full bg-[#EAF3EA] flex items-center justify-center text-[#496246]">
                <UserPlus size={20} />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">{t('merchant_onboarding.staff.invite_title')}</h3>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">{t('merchant_onboarding.staff.name')}</label>
                <AgentInput
                  agentId="name"
                  agentLabel="Staff Name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder={t('merchant_onboarding.staff.name_ph')}
                  className="w-full px-4 py-3 bg-[#F2F7F2]/50 rounded-xl border border-transparent focus:border-[#496246]/30 focus:outline-none focus:ring-2 focus:ring-[#496246]/10 text-sm font-medium transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">{t('merchant_onboarding.staff.phone')}</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-sm font-bold text-gray-400">+91</span>
                    <AgentInput
                      agentId="phone"
                      agentLabel="Phone Number"
                      agentType="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="9876543210"
                      className="w-full pl-12 pr-4 py-3 bg-[#F2F7F2]/50 rounded-xl border border-transparent focus:border-[#496246]/30 focus:outline-none focus:ring-2 focus:ring-[#496246]/10 text-sm font-medium transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">{t('merchant_onboarding.staff.role')}</label>
                  <AgentSelect
                    agentId="role"
                    agentLabel="Role"
                    value={formData.role}
                    onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                    className="w-full px-4 py-3 bg-[#F2F7F2]/50 rounded-xl border border-transparent focus:border-[#496246]/30 focus:outline-none focus:ring-2 focus:ring-[#496246]/10 text-sm font-medium transition-all appearance-none"
                  >
                    <option value="manager">{t('merchant_onboarding.staff.role_manager')}</option>
                    <option value="cashier">{t('merchant_onboarding.staff.role_cashier')}</option>
                    <option value="inventory">{t('merchant_onboarding.staff.role_inventory')}</option>
                    <option value="delivery">{t('merchant_onboarding.staff.role_delivery')}</option>
                  </AgentSelect>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-2 bg-[#496246] hover:bg-[#3A4E38] text-white rounded-xl font-bold text-sm tracking-wide transition-all shadow-md disabled:opacity-50"
              >
                {loading ? t('merchant_onboarding.staff.inviting') : t('merchant_onboarding.staff.send_btn')}
              </button>
            </div>
          </form>

          {/* Final Finish Button */}
          <div className="flex flex-col items-center justify-center mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row w-full gap-4">
              <button
                onClick={() => router.push("/merchant/dashboard")}
                className="flex-1 py-5 bg-white text-[#496246] border border-[#496246] rounded-2xl font-black text-lg tracking-wide flex items-center justify-center gap-3 transition-all hover:bg-[#496246]/5 w-full"
              >
                SKIP FOR NOW
              </button>
              <button
                onClick={() => router.push("/merchant/dashboard")}
                className="flex-1 py-5 bg-gradient-to-r from-[#2D3A2C] to-[#1A231A] text-white rounded-2xl font-black text-lg tracking-wide flex items-center justify-center gap-3 transition-all shadow-2xl transform hover:-translate-y-1 hover:shadow-[#496246]/30 w-full"
              >
                {t('merchant_onboarding.staff.finish')}
                <Rocket size={20} className="text-[#D68C5E]" />
              </button>
            </div>
            <button
              onClick={() => router.back()}
              className="mt-6 flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors uppercase tracking-widest"
            >
              {t('merchant_onboarding.staff.back')}
            </button>
          </div>
        </div>

        {/* Right Column: Team Roster */}
        <div className="flex-1 w-full lg:max-w-md h-[700px] bg-white rounded-[40px] shadow-sm border border-gray-100 flex flex-col overflow-hidden relative">
          <div className="p-8 pb-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
            <div>
              <h3 className="font-black text-gray-900 text-xl">{t('merchant_onboarding.staff.roster_title')}</h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">{staff.length} {t('merchant_onboarding.staff.roster_status')}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <UserCircle size={20} className="text-blue-600" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-[#fafbfa]">
            {fetching ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <div className="w-8 h-8 border-4 border-[#DCE8DC] border-t-[#496246] rounded-full animate-spin mb-4"></div>
                <p className="text-sm font-bold">{t('merchant_onboarding.staff.loading')}</p>
              </div>
            ) : staff.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-8 opacity-50">
                <UserPlus size={48} className="text-gray-300 mb-4" />
                <h4 className="font-bold text-gray-600 mb-2">{t('merchant_onboarding.staff.empty_title')}</h4>
                <p className="text-sm text-gray-500">{t('merchant_onboarding.staff.empty_desc')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {staff.map((member) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 group"
                    >
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-200">
                        <UserCircle size={24} className="text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900 truncate">{member.name}</h4>
                          {member.status === 'pending' ? (
                            <span className="text-[9px] font-black uppercase tracking-widest text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full">{t('merchant_onboarding.staff.pending')}</span>
                          ) : (
                            <CheckCircle2 size={14} className="text-green-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs font-bold text-gray-500 capitalize">{member.role}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs font-mono text-gray-400">+91 {member.phone}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(member.id)}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Remove staff"
                      >
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

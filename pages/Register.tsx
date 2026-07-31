import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { BadgeCheck, FileUp, ShieldCheck, Stethoscope, UserRound } from 'lucide-react';
import { authService } from '../services/clientAuthService';
import type { VerificationDocument } from '../services/clientDatabaseService';

type AccountType = 'patient' | 'doctor';
const toDocument = async (file: File | null, type: string, number?: string): Promise<VerificationDocument> => {
  if (!file) throw new Error('Please attach the required document.');
  if (file.size > 5 * 1024 * 1024) throw new Error('Documents must be 5 MB or smaller.');
  const dataUrl = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file); });
  return { type, number, fileName: file.name, dataUrl, submittedAt: new Date().toISOString() };
};

const Register: React.FC = () => {
  const [type, setType] = useState<AccountType>('patient');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setLoading(true);
    try {
      const form = new FormData(event.currentTarget);
      const password = String(form.get('password') || '');
      if (password.length < 8) throw new Error('Use at least 8 characters for your password.');
      if (password !== form.get('confirmPassword')) throw new Error('Passwords do not match.');
      const identityDocument = await toDocument(form.get('identityFile') as File, String(form.get('identityType')), String(form.get('identityNumber')));
      let result;
      if (type === 'doctor') {
        const qualificationDocument = await toDocument(form.get('qualificationFile') as File, 'Medical qualification or registration certificate');
        result = await authService.registerDoctor({
          name: String(form.get('name')), email: String(form.get('email')), phone: String(form.get('phone')),
          specialization: String(form.get('specialization')), yearsOfExperience: Number(form.get('yearsOfExperience')), qualification: String(form.get('qualification')),
          licenseNumber: String(form.get('licenseNumber')), professionalRegistrationNumber: String(form.get('professionalRegistrationNumber')),
          hospitalAffiliation: String(form.get('hospitalAffiliation')), consultationFee: Number(form.get('consultationFee') || 0), bio: String(form.get('bio')),
          identityDocument, qualificationDocument
        }, password);
      } else {
        result = await authService.registerUser({ name: String(form.get('name')), email: String(form.get('email')), phone: String(form.get('phone')), dateOfBirth: String(form.get('dateOfBirth')), gender: String(form.get('gender')), address: String(form.get('address')), identityDocument }, password);
      }
      if (!result.success) throw new Error(result.message || 'Unable to submit your verification.');
      toast.success('Submitted for administrator review. You can sign in after approval.');
      navigate('/login');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Unable to submit your verification.'); }
    finally { setLoading(false); }
  };
  const field = (label: string, name: string, inputType = 'text', required = true, placeholder?: string) => <label className="block"><span className="text-sm text-slate-200">{label}</span><input name={name} required={required} type={inputType} placeholder={placeholder} className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 text-white placeholder:text-slate-500 focus:border-cyan-300 focus:outline-none" /></label>;
  return <main className="min-h-screen pt-24 pb-12 px-4"><div className="max-w-3xl mx-auto"><header className="text-center mb-7"><p className="eyebrow">Verified care network</p><h1 className="text-3xl sm:text-4xl font-semibold">Create a verified account</h1><p className="text-slate-300 mt-2">Every account is reviewed by an administrator before access is enabled.</p></header>
    <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl panel mb-6"><button type="button" onClick={() => setType('patient')} className={`rounded-xl px-4 py-3 text-sm font-medium ${type === 'patient' ? 'bg-cyan-300 text-slate-950' : 'text-slate-300'}`}><UserRound className="inline mr-2" size={17}/>Patient</button><button type="button" onClick={() => setType('doctor')} className={`rounded-xl px-4 py-3 text-sm font-medium ${type === 'doctor' ? 'bg-cyan-300 text-slate-950' : 'text-slate-300'}`}><Stethoscope className="inline mr-2" size={17}/>Doctor</button></div>
    <form onSubmit={submit} className="panel p-5 sm:p-7 space-y-6"><section><h2 className="font-semibold text-white">Account details</h2><div className="grid sm:grid-cols-2 gap-4 mt-4">{field('Full name', 'name')}{field('Email address', 'email', 'email')}{field('Phone number', 'phone', 'tel')}{field('Password', 'password', 'password', true, 'At least 8 characters')}{field('Confirm password', 'confirmPassword', 'password')}</div></section>
      {type === 'patient' ? <section className="space-y-4"><h2 className="font-semibold text-white">Patient identity</h2><p className="text-sm text-slate-300">Submit a government-issued citizenship, national ID, passport, or other approved identity document.</p><div className="grid sm:grid-cols-2 gap-4">{field('Date of birth', 'dateOfBirth', 'date')}{field('Gender', 'gender')} {field('Home address', 'address')}</div></section> : <section className="space-y-4"><h2 className="font-semibold text-white">Professional credentials</h2><p className="text-sm text-slate-300">Doctors must provide a licence, professional registration, workplace, proof of qualification, and government ID.</p><div className="grid sm:grid-cols-2 gap-4">{field('Specialization', 'specialization')}{field('Years of experience', 'yearsOfExperience', 'number')}{field('Qualification', 'qualification', 'text', true, 'e.g. MBBS, MD')}{field('Medical licence number', 'licenseNumber')}{field('Professional registration number', 'professionalRegistrationNumber')}{field('Hospital or clinic affiliation', 'hospitalAffiliation')}{field('Consultation fee', 'consultationFee', 'number', false)}<label className="block sm:col-span-2"><span className="text-sm text-slate-200">Professional bio</span><textarea name="bio" required rows={3} className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 text-white focus:border-cyan-300 focus:outline-none" /></label></div><DocumentField name="qualificationFile" label="Qualification or registration certificate" /></section>}
      <section className="rounded-2xl border border-cyan-300/20 bg-cyan-300/5 p-4"><div className="flex gap-3"><ShieldCheck className="text-cyan-300 shrink-0"/><div><h2 className="font-semibold text-white">Identity verification</h2><p className="text-sm text-slate-300 mt-1">Files are visible only to platform administrators in this demo. Production deployments must use encrypted document storage with a retention policy.</p></div></div><div className="grid sm:grid-cols-2 gap-4 mt-4"><label><span className="text-sm text-slate-200">Document type</span><select name="identityType" required className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 text-white"><option>Citizenship certificate</option><option>National ID</option><option>Passport</option><option>Driver licence</option></select></label>{field('Document number', 'identityNumber')}</div><div className="mt-4"><DocumentField name="identityFile" label="Government-issued ID document" /></div></section>
      <button disabled={loading} className="w-full rounded-xl bg-cyan-300 px-4 py-3 font-semibold text-slate-950 hover:bg-cyan-200 disabled:opacity-60">{loading ? 'Submitting verification…' : 'Submit for administrator approval'}</button><p className="text-center text-sm text-slate-300">Already approved? <Link className="text-cyan-300" to="/login">Sign in</Link></p></form>
  </div></main>;
};
const DocumentField = ({ name, label }: { name: string; label: string }) => <label className="block"><span className="text-sm text-slate-200">{label}</span><span className="mt-1.5 flex items-center gap-2 rounded-xl border border-dashed border-white/20 bg-slate-950/40 px-3 py-3 text-sm text-slate-300"><FileUp size={17}/><input name={name} required type="file" accept="image/png,image/jpeg,application/pdf" className="w-full text-xs" /></span><span className="text-xs text-slate-400">PDF, PNG, or JPEG; maximum 5 MB.</span></label>;
export default Register;

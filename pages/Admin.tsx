import React, { useMemo, useState } from 'react';
import { Check, CalendarDays, ShieldCheck, UserRound, UsersRound, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { Appointment, Doctor, User } from '../services/clientDatabaseService';

type Tab = 'overview' | 'clinicians' | 'appointments' | 'patients';
const read = <T,>(key: string): T[] => JSON.parse(localStorage.getItem(key) || '[]') as T[];
const write = <T,>(key: string, items: T[]) => localStorage.setItem(key, JSON.stringify(items));

const Admin: React.FC = () => {
  const { isAdmin } = useAuth();
  const [tab, setTab] = useState<Tab>('overview');
  const [revision, setRevision] = useState(0);
  const data = useMemo(() => ({
    patients: read<User>('goodhealth_users'),
    doctors: read<Doctor>('goodhealth_doctors'),
    appointments: read<Appointment>('goodhealth_appointments'),
  }), [revision]);
  const pending = data.doctors.filter(doctor => !doctor.isVerified);
  const activeAppointments = data.appointments.filter(item => !['cancelled', 'completed'].includes(item.status));
  const refresh = () => setRevision(value => value + 1);
  const setDoctorStatus = (id: string, isVerified: boolean) => {
    write('goodhealth_doctors', data.doctors.map(doctor => doctor.id === id ? { ...doctor, isVerified, isAvailable: isVerified, updatedAt: new Date().toISOString() } : doctor));
    refresh();
  };
  const setPatientStatus = (id: string, isActive: boolean) => {
    write('goodhealth_users', data.patients.map(patient => patient.id === id ? { ...patient, isActive, updatedAt: new Date().toISOString() } : patient));
    refresh();
  };

  if (!isAdmin) return <main className="min-h-screen pt-28 px-4 grid place-items-center text-center"><div className="panel p-8 max-w-md"><ShieldCheck className="mx-auto text-cyan-300 mb-4" size={36}/><h1 className="text-2xl font-semibold">Administrator access required</h1><p className="text-slate-300 mt-2">Sign in with an administrator account to manage platform operations.</p></div></main>;

  const nav: { id: Tab; label: string }[] = [{ id: 'overview', label: 'Overview' }, { id: 'clinicians', label: 'Clinicians' }, { id: 'appointments', label: 'Appointments' }, { id: 'patients', label: 'Patients' }];
  return <main className="min-h-screen pt-24 pb-12 px-4 sm:px-6"><div className="max-w-7xl mx-auto">
    <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="eyebrow">Platform operations</p><h1 className="text-3xl sm:text-4xl font-semibold text-white">Care command center</h1><p className="text-slate-300 mt-2">Review access, clinician verification, and appointment flow.</p></div><p className="text-sm text-slate-400">Local demo data • updates save immediately</p></header>
    <nav className="flex gap-2 overflow-x-auto pb-2 mb-7">{nav.map(item => <button key={item.id} onClick={() => setTab(item.id)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${tab === item.id ? 'bg-cyan-300 text-slate-950' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}>{item.label}</button>)}</nav>
    {tab === 'overview' && <><section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">{([{ Icon: UsersRound, label: 'Patients', value: data.patients.length }, { Icon: UserRound, label: 'Verified clinicians', value: data.doctors.filter(d => d.isVerified).length }, { Icon: CalendarDays, label: 'Open appointments', value: activeAppointments.length }, { Icon: ShieldCheck, label: 'Needs review', value: pending.length }] as Array<{ Icon: React.ElementType; label: string; value: number }>).map(({ Icon, label, value }) => <div key={label} className="panel p-5"><Icon className="text-cyan-300 mb-4" size={22}/><p className="text-3xl font-semibold text-white">{value}</p><p className="text-sm text-slate-300">{label}</p></div>)}</section><section className="panel p-6"><div className="flex justify-between items-center"><div><h2 className="font-semibold text-white">Verification queue</h2><p className="text-sm text-slate-300">Approve clinicians before they appear in search.</p></div><button onClick={() => setTab('clinicians')} className="text-cyan-300 text-sm">Review all</button></div><div className="mt-5 space-y-3">{pending.length ? pending.slice(0, 4).map(doctor => <ClinicianRow key={doctor.id} doctor={doctor} onApprove={() => setDoctorStatus(doctor.id, true)} onReject={() => setDoctorStatus(doctor.id, false)}/>) : <Empty label="No clinician reviews are waiting."/>}</div></section></>}
    {tab === 'clinicians' && <section className="panel overflow-hidden"><TableHead labels={['Clinician', 'Specialty', 'Experience', 'Access']}/>{data.doctors.map(doctor => <ClinicianRow key={doctor.id} doctor={doctor} onApprove={() => setDoctorStatus(doctor.id, true)} onReject={() => setDoctorStatus(doctor.id, false)}/>) || <Empty label="No clinicians found."/>}</section>}
    {tab === 'appointments' && <section className="panel overflow-hidden"><TableHead labels={['Patient', 'Date & time', 'Type', 'Status']}/>{data.appointments.length ? data.appointments.map(item => <div key={item.id} className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 border-t border-white/10 text-sm"><span className="text-white">{item.patientName || item.patientId}</span><span>{item.date} · {item.time}</span><span className="capitalize">{item.type}</span><span className="capitalize"><Status status={item.status}/></span></div>) : <Empty label="Appointments will appear here once patients book."/>}</section>}
    {tab === 'patients' && <section className="panel overflow-hidden"><TableHead labels={['Patient', 'Email', 'Joined', 'Access']}/>{data.patients.length ? data.patients.map(patient => <div key={patient.id} className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 border-t border-white/10 text-sm items-center"><span className="text-white">{patient.name}</span><span className="truncate">{patient.email}</span><span>{new Date(patient.createdAt).toLocaleDateString()}</span><button onClick={() => setPatientStatus(patient.id, !patient.isActive)} className="justify-self-start text-xs px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20">{patient.isActive ? 'Suspend' : 'Restore'}</button></div>) : <Empty label="No patient records found."/>}</section>}
  </div></main>;
};

const TableHead = ({ labels }: { labels: string[] }) => <div className="hidden md:grid grid-cols-4 gap-3 px-4 py-3 text-xs uppercase tracking-wider text-slate-400">{labels.map(label => <span key={label}>{label}</span>)}</div>;
const Empty = ({ label }: { label: string }) => <p className="p-6 text-sm text-slate-300">{label}</p>;
const Status = ({ status }: { status: string }) => <span className="inline-flex rounded-full px-2.5 py-1 bg-white/10 text-slate-200">{status}</span>;
const ClinicianRow = ({ doctor, onApprove, onReject }: { doctor: Doctor; onApprove: () => void; onReject: () => void }) => <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 border-t border-white/10 text-sm items-center"><div><p className="text-white">{doctor.name}</p><p className="text-slate-400 text-xs truncate">{doctor.email}</p></div><span>{doctor.specialization}</span><span>{doctor.yearsOfExperience} years</span><div className="flex gap-2"><button onClick={onApprove} aria-label={`Approve ${doctor.name}`} className="p-2 rounded-lg bg-emerald-400/15 text-emerald-300 hover:bg-emerald-400/25"><Check size={16}/></button><button onClick={onReject} aria-label={`Reject ${doctor.name}`} className="p-2 rounded-lg bg-rose-400/15 text-rose-300 hover:bg-rose-400/25"><X size={16}/></button><Status status={doctor.isVerified ? 'Verified' : 'Pending'}/></div></div>;
export default Admin;

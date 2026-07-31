import React, { useEffect, useMemo, useState } from 'react';
import { CalendarCheck, CalendarPlus, ClipboardList, MessageCircle, Stethoscope } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services/clientAuthService';
import { bookingService } from '../services/clientBookingService';
import type { Appointment, Doctor } from '../services/clientDatabaseService';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const current = authService.getCurrentUser();
  const isDoctor = authService.isDoctor();
  const load = async () => {
    if (!current) return;
    const [items, people] = await Promise.all([isDoctor ? bookingService.getDoctorAppointments(current.id) : bookingService.getPatientAppointments(current.id), bookingService.getAllDoctors()]);
    setAppointments(items.sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)));
    setDoctors(people);
  };
  useEffect(() => { if (!authService.isAuthenticated()) navigate('/login'); else void load(); }, []);
  const upcoming = useMemo(() => appointments.filter(item => !['cancelled', 'completed'].includes(item.status)), [appointments]);
  const update = async (id: string, status: 'confirmed' | 'completed' | 'cancelled') => {
    const ok = await bookingService.updateAppointmentStatus(id, status);
    ok ? (toast.success(`Appointment ${status}.`), load()) : toast.error('Unable to update this appointment.');
  };
  if (!current) return null;
  return <main className="min-h-screen pt-24 pb-12 px-4 sm:px-6"><div className="max-w-7xl mx-auto">
    <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-8"><div><p className="eyebrow">{isDoctor ? 'Clinician workspace' : 'Patient workspace'}</p><h1 className="text-3xl sm:text-4xl font-semibold text-white">Good to see you, {current.name.split(' ')[0]}.</h1><p className="text-slate-300 mt-2">{isDoctor ? 'Review your schedule and keep consultations moving.' : 'Your appointments and care tools, in one calm place.'}</p></div><Link to={isDoctor ? '/messages' : '/booking'} className="inline-flex items-center gap-2 justify-center rounded-xl bg-cyan-300 text-slate-950 px-4 py-3 font-medium hover:bg-cyan-200">{isDoctor ? <MessageCircle size={18}/> : <CalendarPlus size={18}/>} {isDoctor ? 'Open messages' : 'Book care'}</Link></header>
    <section className="grid sm:grid-cols-3 gap-4 mb-7">{([{ Icon: CalendarCheck, label: 'Upcoming', value: upcoming.length }, { Icon: ClipboardList, label: isDoctor ? 'All consultations' : 'Care history', value: appointments.length }, { Icon: Stethoscope, label: isDoctor ? 'Patients scheduled' : 'Available specialists', value: isDoctor ? new Set(appointments.map(item => item.patientId)).size : doctors.length }] as Array<{ Icon: React.ElementType; label: string; value: number }>).map(({ Icon, label, value }) => <div className="panel p-5" key={label}><Icon className="text-cyan-300 mb-4" size={22}/><p className="text-3xl font-semibold text-white">{value}</p><p className="text-sm text-slate-300">{label}</p></div>)}</section>
    <section className="panel overflow-hidden"><div className="p-6 flex items-center justify-between"><div><h2 className="text-lg font-semibold text-white">{isDoctor ? 'Consultation queue' : 'Your appointments'}</h2><p className="text-sm text-slate-300">{isDoctor ? 'Confirm, complete, or cancel appointments.' : 'Keep track of upcoming and past visits.'}</p></div>{!isDoctor && <Link to="/booking" className="text-sm text-cyan-300">Find a doctor</Link>}</div>
      {appointments.length ? <div>{appointments.map(item => { const doctor = doctors.find(person => person.id === item.doctorId); return <article key={item.id} className="p-5 border-t border-white/10 flex flex-col lg:flex-row lg:items-center gap-4 justify-between"><div><p className="font-medium text-white">{isDoctor ? item.patientName || 'Patient consultation' : doctor?.name || 'Care appointment'}</p><p className="text-sm text-slate-300">{item.date} at {item.time} · <span className="capitalize">{item.type}</span></p>{item.symptoms && <p className="text-sm text-slate-400 mt-1">Reason: {item.symptoms}</p>}</div><div className="flex flex-wrap gap-2 items-center"><span className="px-3 py-1.5 rounded-full text-xs bg-white/10 capitalize">{item.status}</span>{isDoctor && item.status === 'scheduled' && <button onClick={() => update(item.id, 'confirmed')} className="action-secondary">Confirm</button>}{isDoctor && item.status === 'confirmed' && <button onClick={() => update(item.id, 'completed')} className="action-secondary">Complete</button>}{!['completed', 'cancelled'].includes(item.status) && <button onClick={() => update(item.id, 'cancelled')} className="action-danger">Cancel</button>}</div></article>})}</div> : <div className="p-10 text-center"><CalendarPlus className="mx-auto text-cyan-300 mb-3"/><p className="text-white font-medium">{isDoctor ? 'No consultations scheduled yet.' : 'No appointments yet.'}</p><p className="text-slate-300 text-sm mt-1">{isDoctor ? 'New patient requests will appear here.' : 'Choose a specialist when you are ready.'}</p>{!isDoctor && <Link to="/booking" className="inline-block mt-5 text-cyan-300">Browse specialists</Link>}</div>}</section>
  </div></main>;
};
export default Dashboard;

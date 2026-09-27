import React, { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import api from "./api";

function Layout({ user, setUser, children }) {
  const nav = useNavigate();
  function logout(){ localStorage.removeItem("token"); setUser(null); nav("/login"); }
  return <div><header><b>CareHub</b><nav><Link to="/">Dashboard</Link>{user?.role==="patient"&&<Link to="/book">Book Appointment</Link>}{user?.role==="patient"&&<Link to="/reports">Reports</Link>}<button onClick={logout}>Logout</button></nav></header><main>{children}</main></div>
}

function Login({setUser}) {
  const nav=useNavigate(); const [form,setForm]=useState({email:"",password:""}); const [error,setError]=useState("");
  async function submit(e){e.preventDefault();try{const {data}=await api.post("/auth/login",form);localStorage.setItem("token",data.token);setUser(data.user);nav("/")}catch(e){setError(e.response?.data?.message||"Login failed")}}
  return <section className="card auth"><h1>Welcome back</h1><form onSubmit={submit}><input placeholder="Email" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/><input placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/><button>Login</button></form>{error&&<p className="error">{error}</p>}<p>Need an account? <Link to="/register">Register</Link></p></section>
}

function Register({setUser}) {
  const nav=useNavigate(); const [form,setForm]=useState({name:"",email:"",password:"",role:"patient",specialization:""});
  async function submit(e){e.preventDefault();try{const {data}=await api.post("/auth/register",form);localStorage.setItem("token",data.token);setUser(data.user);nav("/")}catch(e){alert(e.response?.data?.message||"Registration failed")}}
  return <section className="card auth"><h1>Create account</h1><form onSubmit={submit}><input placeholder="Full name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/><input placeholder="Email" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/><input placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/><select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}><option value="patient">Patient</option><option value="doctor">Doctor</option></select>{form.role==="doctor"&&<input placeholder="Specialization" value={form.specialization} onChange={e=>setForm({...form,specialization:e.target.value})}/>}<button>Create account</button></form><p><Link to="/login">Back to login</Link></p></section>
}

function Dashboard({user}) {
 const [items,setItems]=useState([]); 
 useEffect(()=>{api.get("/appointments/mine").then(r=>setItems(r.data)).catch(()=>{})},[]);
 async function video(id){const r=await api.post(`/appointments/${id}/video`);window.open(r.data.meetingUrl,"_blank","noopener,noreferrer")}
 return <><div className="hero"><h1>Hello, {user.name}</h1><p>{user.role.toUpperCase()} dashboard</p></div><section><h2>Appointments</h2>{items.length===0?<div className="card">No appointments yet.</div>:items.map(a=><div className="card row" key={a.id}><div><b>{a.Doctor?.User?.name||a.Patient?.User?.name||"Appointment"}</b><p>{a.appointmentDate} at {a.appointmentTime} · {a.status}</p><small>{a.reason}</small></div>{a.meetingUrl&&<button onClick={()=>window.open(a.meetingUrl,"_blank")}>Join video</button>}{!a.meetingUrl&&<button onClick={()=>video(a.id)}>Create video room</button>}</div>)}</section></>
}

function Book() {
 const [doctors,setDoctors]=useState([]); const [form,setForm]=useState({doctorId:"",appointmentDate:"",appointmentTime:"",reason:""}); const [msg,setMsg]=useState("");
 useEffect(()=>{api.get("/appointments/doctors").then(r=>setDoctors(r.data))},[]);
 async function submit(e){e.preventDefault();try{await api.post("/appointments",form);setMsg("Appointment booked successfully.");}catch(e){setMsg(e.response?.data?.message||"Booking failed")}}
 return <section className="card"><h1>Book appointment</h1><form onSubmit={submit}><select value={form.doctorId} onChange={e=>setForm({...form,doctorId:e.target.value})}><option value="">Select doctor</option>{doctors.map(d=><option key={d.id} value={d.id}>{d.User?.name} — {d.specialization}</option>)}</select><input type="date" value={form.appointmentDate} onChange={e=>setForm({...form,appointmentDate:e.target.value})}/><input type="time" value={form.appointmentTime} onChange={e=>setForm({...form,appointmentTime:e.target.value})}/><textarea placeholder="Reason for visit" value={form.reason} onChange={e=>setForm({...form,reason:e.target.value})}/><button>Book</button></form>{msg&&<p>{msg}</p>}</section>
}

function Reports() {
 const [reports,setReports]=useState([]);
 useEffect(()=>{api.get("/reports/mine").then(r=>setReports(r.data))},[]);
 return <><h1>Medical Reports</h1>{reports.length===0?<div className="card">No reports available.</div>:reports.map(r=><div className="card row" key={r.id}><div><h3>{r.title}</h3><p>{r.diagnosis}</p><small>Doctor: {r.Doctor?.User?.name||"—"}</small></div>{r.qrCodeData&&<img className="qr" src={r.qrCodeData} alt="Report QR code"/>}</div>)}</>
}

function App(){
 const [user,setUser]=useState(null); const [loading,setLoading]=useState(true);
 useEffect(()=>{if(localStorage.getItem("token"))api.get("/auth/me").then(r=>setUser(r.data)).catch(()=>localStorage.removeItem("token")).finally(()=>setLoading(false));else setLoading(false)},[]);
 if(loading)return <div className="center">Loading...</div>;
 return user?<Layout user={user} setUser={setUser}><Routes><Route path="/" element={<Dashboard user={user}/>}/><Route path="/book" element={<Book/>}/><Route path="/reports" element={<Reports/>}/><Route path="*" element={<Navigate to="/"/>}/></Routes></Layout>:<Routes><Route path="/login" element={<Login setUser={setUser}/>}/><Route path="/register" element={<Register setUser={setUser}/>}/><Route path="*" element={<Navigate to="/login"/>}/></Routes>
}
export default App;

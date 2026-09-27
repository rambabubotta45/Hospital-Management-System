import { Router } from "express";
import { Appointment, Doctor, Patient, User, VideoConsultation } from "../models/index.js";
import { auth, allow } from "../middleware/auth.js";
import crypto from "crypto";

const router = Router();

router.get("/doctors", auth, async (req, res) => {
  const doctors = await Doctor.findAll({ include: [{ model: User, attributes: ["id", "name", "email"] }] });
  res.json(doctors);
});

router.post("/", auth, allow("patient"), async (req, res) => {
  try {
    const patient = await Patient.findOne({ where: { userId: req.user.id } });
    if (!patient) return res.status(404).json({ message: "Patient profile not found" });
    const { doctorId, appointmentDate, appointmentTime, reason } = req.body;
    const conflict = await Appointment.findOne({ where: { doctorId, appointmentDate, appointmentTime, status: ["scheduled", "confirmed"] } });
    if (conflict) return res.status(409).json({ message: "Doctor is already booked for this slot" });

    const appointment = await Appointment.create({ patientId: patient.id, doctorId, appointmentDate, appointmentTime, reason });
    res.status(201).json(appointment);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get("/mine", auth, async (req, res) => {
  const include = [
    { model: Patient, include: [{ model: User, attributes: ["name", "email"] }] },
    { model: Doctor, include: [{ model: User, attributes: ["name", "email"] }] },
    { model: VideoConsultation }
  ];
  let where = {};
  if (req.user.role === "patient") {
    const p = await Patient.findOne({ where: { userId: req.user.id } }); where.patientId = p?.id || -1;
  } else if (req.user.role === "doctor") {
    const d = await Doctor.findOne({ where: { userId: req.user.id } }); where.doctorId = d?.id || -1;
  }
  res.json(await Appointment.findAll({ where, include, order: [["appointmentDate", "ASC"], ["appointmentTime", "ASC"]] }));
});

router.patch("/:id", auth, allow("doctor", "patient", "admin"), async (req, res) => {
  const appointment = await Appointment.findByPk(req.params.id);
  if (!appointment) return res.status(404).json({ message: "Appointment not found" });
  const allowed = ["appointmentDate", "appointmentTime", "status", "reason"];
  for (const key of allowed) if (req.body[key] !== undefined) appointment[key] = req.body[key];
  await appointment.save();
  res.json(appointment);
});

router.post("/:id/video", auth, async (req, res) => {
  const appointment = await Appointment.findByPk(req.params.id);
  if (!appointment) return res.status(404).json({ message: "Appointment not found" });
  let room = await VideoConsultation.findOne({ where: { appointmentId: appointment.id } });
  if (!room) {
    const roomName = `hospital-${appointment.id}-${crypto.randomBytes(5).toString("hex")}`;
    room = await VideoConsultation.create({ appointmentId: appointment.id, roomName });
    appointment.meetingUrl = `https://meet.jit.si/${roomName}`;
    await appointment.save();
  }
  res.json({ meetingUrl: appointment.meetingUrl, room });
});

export default router;

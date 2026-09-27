import { Router } from "express";
import QRCode from "qrcode";
import crypto from "crypto";
import { MedicalReport, Patient, Doctor, User } from "../models/index.js";
import { auth, allow } from "../middleware/auth.js";

const router = Router();

router.post("/", auth, allow("doctor"), async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
    if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });
    const { patientId, title, diagnosis, reportUrl } = req.body;
    const report = await MedicalReport.create({ patientId, doctorId: doctor.id, title, diagnosis, reportUrl });
    const token = crypto.randomBytes(24).toString("hex");
    const payload = JSON.stringify({ reportId: report.id, accessToken: token });
    report.qrCodeData = await QRCode.toDataURL(payload);
    await report.save();
    res.status(201).json(report);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get("/mine", auth, async (req, res) => {
  let patientId = null;
  if (req.user.role === "patient") {
    const patient = await Patient.findOne({ where: { userId: req.user.id } });
    patientId = patient?.id;
  } else return res.status(403).json({ message: "Only patients can view this list" });

  const reports = await MedicalReport.findAll({
    where: { patientId },
    include: [{ model: Doctor, include: [{ model: User, attributes: ["name"] }] }],
    order: [["createdAt", "DESC"]]
  });
  res.json(reports);
});

router.get("/:id", auth, async (req, res) => {
  const report = await MedicalReport.findByPk(req.params.id, {
    include: [{ model: Patient, include: [{ model: User, attributes: ["name"] }] }]
  });
  if (!report) return res.status(404).json({ message: "Report not found" });
  res.json(report);
});

export default router;

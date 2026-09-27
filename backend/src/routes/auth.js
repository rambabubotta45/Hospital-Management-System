import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, Doctor, Patient } from "../models/index.js";
import { auth } from "../middleware/auth.js";
import dotenv from "dotenv";
dotenv.config();

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role = "patient", specialization, dateOfBirth, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Name, email and password are required" });
    if (!["patient", "doctor"].includes(role)) return res.status(400).json({ message: "Public registration supports patient/doctor roles" });

    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ message: "Email already registered" });

    const user = await User.create({
      name, email, role,
      password: await bcrypt.hash(password, 12)
    });

    if (role === "doctor") await Doctor.create({ userId: user.id, specialization: specialization || "General Medicine" });
    else await Patient.create({ userId: user.id, dateOfBirth, phone });

    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: "Invalid credentials" });
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get("/me", auth, async (req, res) => {
  const user = await User.findByPk(req.user.id, { attributes: { exclude: ["password"] } });
  res.json(user);
});

export default router;

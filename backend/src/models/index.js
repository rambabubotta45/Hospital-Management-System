import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const User = sequelize.define("User", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(120), allowNull: false },
  email: { type: DataTypes.STRING(160), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  role: { type: DataTypes.ENUM("admin", "doctor", "patient"), allowNull: false, defaultValue: "patient" }
});

export const Doctor = sequelize.define("Doctor", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  specialization: { type: DataTypes.STRING(120), allowNull: false },
  availability: { type: DataTypes.TEXT, allowNull: true }
});

export const Patient = sequelize.define("Patient", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  dateOfBirth: { type: DataTypes.DATEONLY, allowNull: true },
  phone: { type: DataTypes.STRING(30), allowNull: true }
});

export const Appointment = sequelize.define("Appointment", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  appointmentDate: { type: DataTypes.DATEONLY, allowNull: false },
  appointmentTime: { type: DataTypes.TIME, allowNull: false },
  reason: { type: DataTypes.TEXT, allowNull: true },
  status: {
    type: DataTypes.ENUM("scheduled", "confirmed", "completed", "cancelled"),
    defaultValue: "scheduled"
  },
  meetingUrl: { type: DataTypes.STRING(500), allowNull: true }
});

export const MedicalReport = sequelize.define("MedicalReport", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING(180), allowNull: false },
  diagnosis: { type: DataTypes.TEXT, allowNull: true },
  reportUrl: { type: DataTypes.STRING(500), allowNull: true },
  qrCodeData: { type: DataTypes.TEXT, allowNull: true }
});

export const VideoConsultation = sequelize.define("VideoConsultation", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  roomName: { type: DataTypes.STRING(180), unique: true, allowNull: false },
  status: { type: DataTypes.ENUM("scheduled", "active", "ended"), defaultValue: "scheduled" }
});

User.hasOne(Doctor, { foreignKey: "userId", onDelete: "CASCADE" });
Doctor.belongsTo(User, { foreignKey: "userId" });
User.hasOne(Patient, { foreignKey: "userId", onDelete: "CASCADE" });
Patient.belongsTo(User, { foreignKey: "userId" });

Patient.hasMany(Appointment, { foreignKey: "patientId" });
Appointment.belongsTo(Patient, { foreignKey: "patientId" });
Doctor.hasMany(Appointment, { foreignKey: "doctorId" });
Appointment.belongsTo(Doctor, { foreignKey: "doctorId" });

Patient.hasMany(MedicalReport, { foreignKey: "patientId" });
MedicalReport.belongsTo(Patient, { foreignKey: "patientId" });
Doctor.hasMany(MedicalReport, { foreignKey: "doctorId" });
MedicalReport.belongsTo(Doctor, { foreignKey: "doctorId" });

Appointment.hasOne(VideoConsultation, { foreignKey: "appointmentId", onDelete: "CASCADE" });
VideoConsultation.belongsTo(Appointment, { foreignKey: "appointmentId" });

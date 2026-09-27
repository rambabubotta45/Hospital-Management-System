import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import {
  sequelize,
  User,
  Doctor,
  Patient,
  MedicalReport
} from "./models/index.js";

dotenv.config();

async function seed() {
  try {
    await sequelize.authenticate();

    console.log("Database connected successfully.");

    const password = await bcrypt.hash("123456", 10);

    // Check if patient already exists
    let patientUser = await User.findOne({
      where: { email: "ravi@gmail.com" }
    });

    if (!patientUser) {
      patientUser = await User.create({
        name: "Ravi Kumar",
        email: "ravi@gmail.com",
        password,
        role: "patient"
      });

      await Patient.create({
        userId: patientUser.id
      });

      console.log("Patient created.");
    } else {
      console.log("Patient already exists.");
    }

    // Check if doctor already exists
    let doctorUser = await User.findOne({
      where: { email: "priya@gmail.com" }
    });

    if (!doctorUser) {
      doctorUser = await User.create({
        name: "Dr. Priya Sharma",
        email: "priya@gmail.com",
        password,
        role: "doctor"
      });

      await Doctor.create({
        userId: doctorUser.id,
        specialization: "General Medicine"
      });

      console.log("Doctor created.");
    } else {
      console.log("Doctor already exists.");
    }

    // Get profiles
    const patient = await Patient.findOne({
      where: { userId: patientUser.id }
    });

    const doctor = await Doctor.findOne({
      where: { userId: doctorUser.id }
    });

    // Create dummy report only if it doesn't already exist
    const existingReport = await MedicalReport.findOne({
      where: {
        patientId: patient.id,
        title: "Blood Test Report"
      }
    });

    if (!existingReport) {
      await MedicalReport.create({
        patientId: patient.id,
        doctorId: doctor.id,
        title: "Blood Test Report",
        diagnosis: "Normal blood parameters",
        reportUrl: null
      });

      console.log("Dummy medical report created.");
    } else {
      console.log("Dummy report already exists.");
    }

    console.log("\n=================================");
    console.log("SEED COMPLETED SUCCESSFULLY");
    console.log("=================================");
    console.log("Patient : Ravi Kumar");
    console.log("Email   : ravi@gmail.com");
    console.log("Password: 123456");
    console.log("---------------------------------");
    console.log("Doctor  : Dr. Priya Sharma");
    console.log("Email   : priya@gmail.com");
    console.log("Password: 123456");
    console.log("=================================");

    await sequelize.close();
  } catch (error) {
    console.error("Seed failed:", error);
    await sequelize.close();
    process.exit(1);
  }
}

seed();
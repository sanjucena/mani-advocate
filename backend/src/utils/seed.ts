// ============================================================
// 📁 utils/seed.ts — Database Seeder
// ============================================================
// Run this to populate your database with sample data:
//   npm run seed
//
// This is helpful for:
//   1. Testing your API without manually creating data
//   2. Demoing the app to your advocate friend
//   3. Frontend development (you need data to display!)
//
// INTERVIEW TIP: "Seed scripts are common in development. They
// create predictable test data so the team doesn't start with
// an empty database every time."
// ============================================================

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Client from '../models/Client';
import Case from '../models/Case';
import Hearing from '../models/Hearing';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Client.deleteMany({}),
      Case.deleteMany({}),
      Hearing.deleteMany({}),
    ]);
    console.log('Cleared existing data.');

    // ── Create Users ──────────────────────────────
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@maniadvocate.com',
      password: 'admin123',
      role: 'admin',
      phone: '9876543210',
    });

    const advocate = await User.create({
      name: 'Mani',
      email: 'mani@advocate.com',
      password: 'mani1234',
      role: 'advocate',
      phone: '9876543211',
    });

    console.log('✅ Users created');

    // ── Create Clients ────────────────────────────
    const clients = await Client.insertMany([
      {
        name: 'Rajesh Kumar',
        email: 'rajesh@example.com',
        phone: '9876500001',
        address: '12, Anna Nagar East',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600040',
        notes: 'Property dispute case - referred by Kumar advocate',
        createdBy: advocate._id,
      },
      {
        name: 'Priya Sharma',
        email: 'priya@example.com',
        phone: '9876500002',
        address: '45, T. Nagar',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600017',
        notes: 'Family matter - divorce proceedings',
        createdBy: advocate._id,
      },
      {
        name: 'Mohammed Farooq',
        email: 'farooq@example.com',
        phone: '9876500003',
        address: '78, Royapettah',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600014',
        notes: 'Consumer complaint against builder',
        createdBy: advocate._id,
      },
      {
        name: 'Lakshmi Narayanan',
        phone: '9876500004',
        address: '23, Mylapore',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600004',
        notes: 'Criminal case - wrongful accusation',
        createdBy: advocate._id,
      },
      {
        name: 'Anitha Devi',
        email: 'anitha@example.com',
        phone: '9876500005',
        address: '56, Adyar',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600020',
        notes: 'Labour dispute with former employer',
        createdBy: advocate._id,
      },
    ]);

    console.log('✅ Clients created');

    // ── Create Cases ──────────────────────────────
    const cases = await Case.insertMany([
      {
        caseNumber: 'CIV/2025/1001',
        title: 'Kumar vs State Housing Board',
        description: 'Property ownership dispute over ancestral land in Tambaram',
        client: clients[0]._id,
        caseType: 'property',
        court: 'Madras High Court',
        judge: 'Justice Venkataraman',
        opposingCounsel: 'Adv. Suresh Babu',
        opposingParty: 'State Housing Board',
        status: 'active',
        priority: 'high',
        filingDate: new Date('2025-03-15'),
        notes: [
          { content: 'Initial documents filed. Awaiting court response.', date: new Date('2025-03-15') },
          { content: 'Received acknowledgment from court registry.', date: new Date('2025-03-20') },
        ],
        createdBy: advocate._id,
      },
      {
        caseNumber: 'FAM/2025/2001',
        title: 'Sharma vs Sharma - Divorce',
        description: 'Mutual consent divorce proceedings',
        client: clients[1]._id,
        caseType: 'family',
        court: 'Family Court, Chennai',
        judge: 'Judge Padmini',
        opposingCounsel: 'Adv. Ramesh',
        opposingParty: 'Vikram Sharma',
        status: 'active',
        priority: 'medium',
        filingDate: new Date('2025-04-01'),
        notes: [
          { content: 'First motion petition filed.', date: new Date('2025-04-01') },
        ],
        createdBy: advocate._id,
      },
      {
        caseNumber: 'CON/2025/3001',
        title: 'Farooq vs Sunrise Builders',
        description: 'Consumer complaint for delayed flat possession and deficiency in service',
        client: clients[2]._id,
        caseType: 'consumer',
        court: 'District Consumer Forum, Chennai',
        opposingCounsel: 'Adv. Meena',
        opposingParty: 'Sunrise Builders Pvt Ltd',
        status: 'pending',
        priority: 'medium',
        filingDate: new Date('2025-02-10'),
        notes: [
          { content: 'Filed complaint with supporting documents.', date: new Date('2025-02-10') },
          { content: 'Opposite party filed reply.', date: new Date('2025-03-05') },
        ],
        createdBy: advocate._id,
      },
      {
        caseNumber: 'CRL/2025/4001',
        title: 'State vs Lakshmi Narayanan',
        description: 'Criminal case - alleged fraud charges. Client maintains innocence.',
        client: clients[3]._id,
        caseType: 'criminal',
        court: 'Sessions Court, Chennai',
        judge: 'Judge Krishnamoorthy',
        opposingCounsel: 'Public Prosecutor',
        opposingParty: 'State of Tamil Nadu',
        status: 'active',
        priority: 'urgent',
        filingDate: new Date('2025-01-20'),
        notes: [
          { content: 'Bail granted. Next hearing for charge framing.', date: new Date('2025-01-25') },
          { content: 'Collected evidence from witnesses.', date: new Date('2025-02-15') },
          { content: 'Filed discharge petition.', date: new Date('2025-03-10') },
        ],
        createdBy: advocate._id,
      },
      {
        caseNumber: 'LAB/2025/5001',
        title: 'Anitha vs TechSoft Solutions',
        description: 'Wrongful termination and unpaid dues',
        client: clients[4]._id,
        caseType: 'labour',
        court: 'Labour Court, Chennai',
        opposingCounsel: 'Adv. Gopal',
        opposingParty: 'TechSoft Solutions Pvt Ltd',
        status: 'active',
        priority: 'high',
        filingDate: new Date('2025-03-01'),
        createdBy: advocate._id,
      },
    ]);

    console.log('✅ Cases created');

    // ── Create Hearings ───────────────────────────
    const today = new Date();
    await Hearing.insertMany([
      {
        case: cases[0]._id,
        date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        time: '10:30 AM',
        court: 'Madras High Court',
        courtRoom: 'Room 5',
        purpose: 'Arguments on property ownership documents',
        status: 'scheduled',
        createdBy: advocate._id,
      },
      {
        case: cases[0]._id,
        date: new Date('2025-04-01'),
        time: '11:00 AM',
        court: 'Madras High Court',
        courtRoom: 'Room 5',
        purpose: 'Initial hearing',
        status: 'completed',
        outcome: 'Next date given for document submission',
        createdBy: advocate._id,
      },
      {
        case: cases[1]._id,
        date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        time: '02:00 PM',
        court: 'Family Court, Chennai',
        purpose: 'Second motion hearing',
        status: 'scheduled',
        createdBy: advocate._id,
      },
      {
        case: cases[2]._id,
        date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        time: '11:30 AM',
        court: 'District Consumer Forum',
        purpose: 'Evidence submission',
        status: 'scheduled',
        createdBy: advocate._id,
      },
      {
        case: cases[3]._id,
        date: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
        time: '10:00 AM',
        court: 'Sessions Court, Chennai',
        courtRoom: 'Room 12',
        purpose: 'Hearing on discharge petition',
        status: 'scheduled',
        createdBy: advocate._id,
      },
      {
        case: cases[4]._id,
        date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        time: '03:00 PM',
        court: 'Labour Court, Chennai',
        purpose: 'First hearing - evidence submission',
        status: 'scheduled',
        createdBy: advocate._id,
      },
    ]);

    console.log('✅ Hearings created');

    // Summary
    console.log(`
  ╔══════════════════════════════════════════════╗
  ║   🌱 Database Seeded Successfully!           ║
  ╠══════════════════════════════════════════════╣
  ║   Users:    2 (admin + advocate)             ║
  ║   Clients:  ${clients.length}                                ║
  ║   Cases:    ${cases.length}                                ║
  ║   Hearings: 6                                ║
  ╠══════════════════════════════════════════════╣
  ║   Login Credentials:                         ║
  ║   Admin:    admin@maniadvocate.com / admin123║
  ║   Advocate: mani@advocate.com / mani1234     ║
  ╚══════════════════════════════════════════════╝
    `);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedData();

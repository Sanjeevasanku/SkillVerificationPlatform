const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Admin = require('../models/Admin');
const HR = require('../models/HR');
const Student = require('../models/Student');
const Repository = require('../models/Repository');
const Skill = require('../models/Skill');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected for seeding...');

        // 1. Clear existing sample data (optional, but good for a clean start)
        // Note: In production you might want to be more careful.
        await Admin.deleteMany({ email: 'admin@platform.com' });
        await HR.deleteMany({ email: 'hr@company.com' });
        await Student.deleteMany({ email: 'student@college.edu' });

        console.log('Cleaned up previous sample users.');

        // 2. Create Admin
        const admin = await Admin.create({
            fullName: 'Platform Admin',
            email: 'admin@platform.com',
            password: 'admin123',
            role: 'admin'
        });
        console.log('Admin created: admin@platform.com / admin123');

        // 3. Create HR
        const hr = await HR.create({
            fullName: 'Recruiter Jane',
            email: 'hr@company.com',
            password: 'hr123',
            companyName: 'TechCorp Solutions',
            role: 'hr'
        });
        console.log('HR created: hr@company.com / hr123');

        // 4. Create Student
        const student = await Student.create({
            fullName: 'Alex Coder',
            email: 'student@college.edu',
            password: 'student123',
            college: 'State Technical University',
            branch: 'Computer Science',
            graduationYear: 2025,
            githubUsername: 'alexcoder-sample'
        });
        console.log('Student created: student@college.edu / student123');

        // 5. Create Skills for Student
        const skill1 = await Skill.create({
            student: student._id,
            name: 'React',
            category: 'Frontend Framework',
            confidenceScore: 0.95,
            evidence: ['Used hooks in 10 components', 'Custom context provider for auth', 'React Router implementation']
        });

        const skill2 = await Skill.create({
            student: student._id,
            name: 'Node.js',
            category: 'Backend Framework',
            confidenceScore: 0.85,
            evidence: ['Express.js REST API', 'JWT authentication middleware', 'Mongoose schemas']
        });
        console.log('Skills created for student.');

        // 6. Create Repository for Student
        await Repository.create({
            student: student._id,
            title: 'E-commerce Platform',
            description: 'A full-stack MERN e-commerce application with real-time updates.',
            githubLink: 'https://github.com/alexcoder-sample/mern-shop',
            repoId: 12345678,
            repoName: 'mern-shop',
            repoOwner: 'alexcoder-sample',
            repoOwnerType: 'User',
            isFork: false,
            primaryLanguage: 'JavaScript',
            stars: 12,
            forks: 5,
            totalCommitCount: 45,
            commitCountByStudent: 42,
            contributionPercentage: 93,
            skills: [skill1._id, skill2._id],
            verificationStatus: 'verified',
            authorshipScore: 0.92,
            riskBand: 'green',
            commitConsistencyScore: 0.88,
            activeWeeks: 6
        });
        console.log('Sample repository created.');

        console.log('\n--- SEEDING COMPLETE ---');
        console.log('Admin: admin@platform.com / admin123');
        console.log('HR:    hr@company.com / hr123');
        console.log('Student: student@college.edu / student123');

        process.exit(0);
    } catch (err) {
        console.error('Error seeding data:', err);
        process.exit(1);
    }
};

seedData();

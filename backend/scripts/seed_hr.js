const mongoose = require('mongoose');
const dotenv = require('dotenv');
const HR = require('../models/HR');

// Load env vars
dotenv.config({ path: __dirname + '/../.env' });

const seedHR = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB connected...');

        const hrEmail = 'hr@company.com';
        const password = 'password123';

        // Check if HR already exists
        const existingHR = await HR.findOne({ email: hrEmail });
        if (existingHR) {
            console.log('HR user already exists. Email:', hrEmail);
            process.exit(0);
        }

        const newHR = await HR.create({
            fullName: 'Admin HR',
            email: hrEmail,
            companyName: 'Tech Innovators Inc.',
            password: password,
            role: 'hr'
        });

        console.log('Successfully created HR user!');
        console.log('Email:', newHR.email);
        console.log('Password:', password);
        process.exit(0);
    } catch (err) {
        console.error('Error seeding HR user:', err);
        process.exit(1);
    }
};

seedHR();

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { generateStudentSkillProfile } = require('../services/studentSkillService');
const Student = require('../models/Student');
const Skill = require('../models/Skill');
const Repository = require('../models/Repository');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const verify = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const student = await Student.findOne();
        if (!student) {
            console.log('No student found in DB');
            process.exit(0);
        }

        console.log(`Testing with student: ${student.fullName} (${student._id})`);

        const profile = await generateStudentSkillProfile(student._id);

        console.log('Profile keys:', Object.keys(profile));

        if (profile.projects) {
            console.log(`Found ${profile.projects.length} projects`);
            if (profile.projects.length > 0) {
                console.log('First project sample:', JSON.stringify(profile.projects[0], null, 2));

                // Check for required fields
                const requiredFields = ['title', 'description', 'githubLink', 'contributionPercentage', 'skills'];
                const missing = requiredFields.filter(f => !profile.projects[0].hasOwnProperty(f));

                if (missing.length === 0) {
                    console.log('SUCCESS: All required fields found in project objects');
                } else {
                    console.log('FAILURE: Missing fields:', missing);
                }
            } else {
                console.log('Note: Student has no verified projects, please ensure some exist for a full test.');
            }
        } else {
            console.log('FAILURE: projects field missing from profile');
        }

        await mongoose.connection.close();
    } catch (err) {
        console.error('Error during verification:', err);
        process.exit(1);
    }
};

verify();

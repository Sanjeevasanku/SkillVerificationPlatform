const http = require('http');

// Configuration
const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

// Helper to make requests
function request(method, path, body = null, token = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: PORT,
            path: `/api${path}`,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const parsed = data ? JSON.parse(data) : {};
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, data });
                }
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function runTests() {
    console.log('--- Starting Project Module Verification ---');

    // 1. Register a new user
    const uniqueId = Date.now();
    const user = {
        name: `TestUser_${uniqueId}`,
        email: `test${uniqueId}@example.com`,
        password: 'password123',
        role: 'student'
    };

    console.log(`\n1. Registering user: ${user.email}...`);
    try {
        const registerRes = await request('POST', '/auth/register', user);
        if (registerRes.status !== 200) {
            console.error('Registration failed:', registerRes.data);
            process.exit(1);
        }
        const token = registerRes.data.token;
        console.log('✅ Registration successful. Token received.');

        // 2. Create Project
        const projectData = {
            title: "Sign Language Translator",
            description: "Built using React, Node, ML and TensorFlow",
            techStack: ["React", "Node", "MongoDB", "TensorFlow"],
            githubLink: "https://github.com/student/sign-language-translator"
        };

        console.log('\n2. Creating a project...');
        const createRes = await request('POST', '/projects', projectData, token);

        if (createRes.status === 201) {
            console.log('✅ Project created successfully:');
            console.log(`   ID: ${createRes.data._id}`);
            console.log(`   Title: ${createRes.data.title}`);
            console.log(`   GitHub: ${createRes.data.githubLink}`);
        } else {
            console.error('❌ Project creation failed:', createRes.data);
        }

        // 3. Get My Projects
        console.log('\n3. Fetching my projects...');
        const getRes = await request('GET', '/projects/my', null, token);

        if (getRes.status === 200 && Array.isArray(getRes.data)) {
            console.log(`✅ Fetched ${getRes.data.length} projects.`);
            if (getRes.data.length > 0 && getRes.data[0].githubLink === projectData.githubLink) {
                console.log('✅ Verification confirmed: Project data matches.');
            } else {
                console.warn('⚠️  Project data verification mismatch or empty list.');
            }
        } else {
            console.error('❌ Fetching projects failed:', getRes.data);
        }

    } catch (err) {
        console.error('Test script error:', err);
    }
}

runTests();

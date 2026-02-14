const axios = require('axios');

// Skill Mappings (Dependency -> Skill Name)
const SKILL_MAP = {
    // JavaScript / Node
    'react': 'React.js',
    'react-dom': 'React.js',
    'vue': 'Vue.js',
    'angular': 'Angular',
    'express': 'Express.js',
    'mongoose': 'MongoDB',
    'mongodb': 'MongoDB',
    'pg': 'PostgreSQL',
    'sequelize': 'Sequelize',
    'redux': 'Redux',
    'socket.io': 'WebSockets',
    'jsonwebtoken': 'JWT Auth',
    'bcryptjs': 'Security/Encryption',

    // Python
    'flask': 'Flask',
    'django': 'Django',
    'fastapi': 'FastAPI',
    'pandas': 'Data Analysis (Pandas)',
    'numpy': 'Data Science (NumPy)',
    'tensorflow': 'Machine Learning (TensorFlow)',
    'pytorch': 'Machine Learning (PyTorch)',
    'scikit-learn': 'Machine Learning',

    // Java
    'spring-boot-starter-web': 'Spring Boot',
    'spring-data-jpa': 'JPA / Hibernate',
    'postgresql': 'PostgreSQL',
    'mysql-connector-java': 'MySQL'
};

// File -> Tech Mapping
const FILE_MAP = {
    'package.json': 'Node.js',
    'requirements.txt': 'Python',
    'pom.xml': 'Java',
    'Dockerfile': 'Docker',
    'docker-compose.yml': 'Docker Compose'
};

const extractSkills = async (githubLink) => {
    console.log(`🔍 Scanning GitHub Repo: ${githubLink}`);

    // 1. Parse Owner/Repo
    const regex = /github\.com\/([^\/]+)\/([^\/]+)/;
    const match = githubLink.match(regex);

    if (!match) {
        console.error('❌ Invalid GitHub URL');
        return { extractedSkills: [], readinessScore: 0 };
    }

    const owner = match[1];
    const repo = match[2].replace('.git', '');
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents`;

    let extractedSkills = new Set();
    let score = 0;

    try {
        // 2. Fetch Repo Contents
        const { data: files } = await axios.get(apiUrl);

        // 3. File Identification & Scoring
        for (const file of files) {
            if (FILE_MAP[file.name]) {
                extractedSkills.add(FILE_MAP[file.name]);
                score += 10; // +10 for identifying project type

                // 4. Dependency Parsing
                if (file.name === 'package.json') {
                    // Fetch package.json content
                    const { data: pkg } = await axios.get(file.download_url);
                    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

                    Object.keys(deps).forEach(dep => {
                        if (SKILL_MAP[dep]) {
                            extractedSkills.add(SKILL_MAP[dep]);
                            score += 5; // +5 per skill recognized
                        }
                    });
                }

                else if (file.name === 'requirements.txt') {
                    const { data: txt } = await axios.get(file.download_url);
                    const lines = txt.split('\n');
                    lines.forEach(line => {
                        const dep = line.split('==')[0].trim();
                        if (SKILL_MAP[dep]) {
                            extractedSkills.add(SKILL_MAP[dep]);
                            score += 5;
                        }
                    });
                }
            }
        }

        // Cap score at 100
        score = Math.min(score, 100);

        console.log('✅ Extraction Complete:', Array.from(extractedSkills));
        return {
            extractedSkills: Array.from(extractedSkills),
            readinessScore: score
        };

    } catch (error) {
        console.error('⚠️ GitHub Scanner Error:', error.message);
        // Fallback: Return empty but don't crash
        return { extractedSkills: [], readinessScore: 0 };
    }
};

module.exports = { extractSkills };

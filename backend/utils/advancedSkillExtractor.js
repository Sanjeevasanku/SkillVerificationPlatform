const axios = require('axios');
require('dotenv').config();

// --- 1. SETUP AXIOS INSTANCE ---
const githubAPI = axios.create({
    baseURL: 'https://api.github.com',
    headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json'
    }
});

// --- 2. CONFIG: TECHNOLOGY CATEGORIES & SIGNATURES ---
const TECH_CATEGORIES = {
    languages: new Set(),
    frontend: new Set(),
    backend: new Set(),
    database: new Set(),
    devops: new Set(),
    testing: new Set(),
    ml: new Set(),
    tools: new Set()
};

const FILE_SIGNATURES = {
    'package.json': { tech: 'Node.js', category: 'backend' },
    'requirements.txt': { tech: 'Python', category: 'languages' },
    'pom.xml': { tech: 'Java', category: 'languages' },
    'build.gradle': { tech: 'Java', category: 'languages' },
    'Dockerfile': { tech: 'Docker', category: 'devops' },
    'docker-compose.yml': { tech: 'Docker Compose', category: 'devops' },
    'main.tf': { tech: 'Terraform', category: 'devops' },
    'k8s.yaml': { tech: 'Kubernetes', category: 'devops' },
    'kubernetes.yaml': { tech: 'Kubernetes', category: 'devops' },
    '.github/workflows': { tech: 'GitHub Actions', category: 'devops' },
    'firebase.json': { tech: 'Firebase', category: 'backend' },
    'supabase.js': { tech: 'Supabase', category: 'backend' },
    'tailwind.config.js': { tech: 'Tailwind CSS', category: 'frontend' },
    'tsconfig.json': { tech: 'TypeScript', category: 'languages' },
    'vite.config.js': { tech: 'Vite', category: 'tools' },
    'next.config.js': { tech: 'Next.js', category: 'frontend' },
    'nuxt.config.js': { tech: 'Nuxt.js', category: 'frontend' },
    'angular.json': { tech: 'Angular', category: 'frontend' },
    'gemfile': { tech: 'Ruby', category: 'languages' },
    'composer.json': { tech: 'PHP', category: 'languages' },
    'go.mod': { tech: 'Go', category: 'languages' },
    'cargo.toml': { tech: 'Rust', category: 'languages' },
    'eslintrc.json': { tech: 'ESLint', category: 'tools' },
    'prettierrc': { tech: 'Prettier', category: 'tools' },
    'babel.config.js': { tech: 'Babel', category: 'tools' },
    'webpack.config.js': { tech: 'Webpack', category: 'tools' }
};

const DEPENDENCY_MAP = {
    // Frontend
    'react': { name: 'React', category: 'frontend' },
    'react-dom': { name: 'React', category: 'frontend' },
    'vue': { name: 'Vue.js', category: 'frontend' },
    '@angular/core': { name: 'Angular', category: 'frontend' },
    'svelte': { name: 'Svelte', category: 'frontend' },
    'next': { name: 'Next.js', category: 'frontend' },
    'nuxt': { name: 'Nuxt.js', category: 'frontend' },
    'tailwindcss': { name: 'Tailwind CSS', category: 'frontend' },
    'bootstrap': { name: 'Bootstrap', category: 'frontend' },
    '@mui/material': { name: 'Material UI', category: 'frontend' },
    'framer-motion': { name: 'Framer Motion', category: 'frontend' },
    'redux': { name: 'Redux', category: 'frontend' },
    'recoil': { name: 'Recoil', category: 'frontend' },
    'zustand': { name: 'Zustand', category: 'frontend' },
    'axios': { name: 'Axios', category: 'tools' },

    // Backend
    'express': { name: 'Express.js', category: 'backend' },
    'nestjs': { name: 'NestJS', category: 'backend' },
    'fastify': { name: 'Fastify', category: 'backend' },
    'socket.io': { name: 'Socket.io', category: 'backend' },
    'cors': { name: 'CORS', category: 'backend' },
    'cookie-parser': { name: 'Cookie Parser', category: 'backend' },
    'jsonwebtoken': { name: 'JWT', category: 'backend' },
    'bcryptjs': { name: 'Bcrypt', category: 'backend' },
    'graphql': { name: 'GraphQL', category: 'backend' },
    'apollo-server': { name: 'Apollo Server', category: 'backend' },
    'mongoose': { name: 'MongoDB', category: 'database' },
    'sequelize': { name: 'Sequelize', category: 'backend' },
    'typeorm': { name: 'TypeORM', category: 'backend' },
    'prisma': { name: 'Prisma', category: 'backend' },
    'pg': { name: 'PostgreSQL', category: 'database' },
    'mysql2': { name: 'MySQL', category: 'database' },
    'redis': { name: 'Redis', category: 'database' },
    'kafkajs': { name: 'Kafka', category: 'backend' },
    'firebase-admin': { name: 'Firebase', category: 'backend' },
    '@supabase/supabase-js': { name: 'Supabase', category: 'backend' },

    // Python
    'django': { name: 'Django', category: 'backend' },
    'flask': { name: 'Flask', category: 'backend' },
    'fastapi': { name: 'FastAPI', category: 'backend' },
    'sqlalchemy': { name: 'SQLAlchemy', category: 'backend' },
    'pandas': { name: 'Pandas', category: 'ml' },
    'numpy': { name: 'NumPy', category: 'ml' },
    'scikit-learn': { name: 'Scikit-learn', category: 'ml' },
    'tensorflow': { name: 'TensorFlow', category: 'ml' },
    'keras': { name: 'Keras', category: 'ml' },
    'torch': { name: 'PyTorch', category: 'ml' },
    'matplotlib': { name: 'Matplotlib', category: 'ml' },
    'seaborn': { name: 'Seaborn', category: 'ml' },
    'opencv-python': { name: 'OpenCV', category: 'ml' },
    'celery': { name: 'Celery', category: 'backend' },
    'redis-py': { name: 'Redis', category: 'database' },
    'pymongo': { name: 'MongoDB', category: 'database' },
    'psycopg2': { name: 'PostgreSQL', category: 'database' },
    'boto3': { name: 'AWS SDK', category: 'devops' },

    // Java
    'spring-boot-starter-web': { name: 'Spring Boot', category: 'backend' },
    'spring-boot-starter-data-jpa': { name: 'Spring Data JPA', category: 'backend' },
    'spring-boot-starter-security': { name: 'Spring Security', category: 'backend' },
    'hibernate-core': { name: 'Hibernate', category: 'backend' },
    'postgresql': { name: 'PostgreSQL', category: 'database' },
    'mysql-connector-java': { name: 'MySQL', category: 'database' },
    'mongodb-driver-sync': { name: 'MongoDB', category: 'database' },
    'lombok': { name: 'Lombok', category: 'tools' },
    'junit': { name: 'JUnit', category: 'testing' },
    'mockito-core': { name: 'Mockito', category: 'testing' },

    // Testing
    'jest': { name: 'Jest', category: 'testing' },
    'mocha': { name: 'Mocha', category: 'testing' },
    'chai': { name: 'Chai', category: 'testing' },
    'cypress': { name: 'Cypress', category: 'testing' },
    'selenium-webdriver': { name: 'Selenium', category: 'testing' },
    'puppeteer': { name: 'Puppeteer', category: 'testing' },
    'playwright': { name: 'Playwright', category: 'testing' },
    'pytest': { name: 'PyTest', category: 'testing' }
};

// --- 3. HELPER FUNCTIONS ---

const parseRepoUrl = (url) => {
    try {
        const clean = url.replace('https://github.com/', '').replace('.git', '');
        const [owner, repo] = clean.split('/');
        return { owner, repo };
    } catch (e) {
        return null;
    }
};

const getFileContent = async (owner, repo, path) => {
    try {
        const { data } = await githubAPI.get(`/repos/${owner}/${repo}/contents/${path}`);
        if (data.encoding === 'base64') {
            return Buffer.from(data.content, 'base64').toString('utf-8');
        }
        return data;
    } catch (error) {
        // 404 is expected for missing files
        return null;
    }
};

// --- 4. CORE LOGIC ---

const extractSkills = async (githubLink) => {
    console.log(`🚀 Starting Recruiter-Level Extraction for: ${githubLink}`);

    // Reset Categories
    const tech = {
        languages: new Set(),
        frontend: new Set(),
        backend: new Set(),
        database: new Set(),
        devops: new Set(),
        testing: new Set(),
        ml: new Set(),
        tools: new Set()
    };

    let readinessScore = 0;

    const repoDetails = parseRepoUrl(githubLink);
    if (!repoDetails || !repoDetails.owner || !repoDetails.repo) {
        console.error('❌ Invalid GitHub URL');
        return { extractedSkills: [], readinessScore: 0 };
    }
    const { owner, repo } = repoDetails;

    try {
        // --- STEP A: Fetch Meta, Languages, Tree ---

        // 1. Repo Metadata
        const { data: repoInfo } = await githubAPI.get(`/repos/${owner}/${repo}`);
        const defaultBranch = repoInfo.default_branch;

        // 2. Languages API (Best source for languages)
        const { data: languages } = await githubAPI.get(`/repos/${owner}/${repo}/languages`);
        Object.keys(languages).forEach(lang => {
            tech.languages.add(lang);
            readinessScore += 2; // Point per language
        });

        // 3. Full File Tree
        const { data: treeData } = await githubAPI.get(`/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`);
        const files = treeData.tree.map(item => item.path);

        // --- STEP B: Detect from File Structure ---

        files.forEach(path => {
            const fileName = path.split('/').pop();

            // Check File Signatures
            if (FILE_SIGNATURES[fileName]) {
                const { tech: t, category: c } = FILE_SIGNATURES[fileName];
                tech[c].add(t);
                readinessScore += 5;
            }

            // Special checks for folders
            if (path.includes('.github/workflows')) {
                tech.devops.add('GitHub Actions');
                readinessScore += 5;
            }
        });

        // --- STEP C: Deep Dependency Parsing ---

        // Iterate over ALL files to find configs at any depth
        for (const path of files) {
            const fileName = path.split('/').pop();

            // 1. package.json (Node/JS)
            if (fileName === 'package.json') {
                const content = await getFileContent(owner, repo, path);
                if (content) {
                    try {
                        const pkg = JSON.parse(content);
                        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
                        Object.keys(deps).forEach(dep => {
                            if (DEPENDENCY_MAP[dep]) {
                                const { name, category } = DEPENDENCY_MAP[dep];
                                tech[category].add(name);
                                readinessScore += 3;
                            }
                        });
                    } catch (e) { console.warn(`Parsed ${path} failed`); }
                }
            }

            // 2. requirements.txt (Python)
            if (fileName === 'requirements.txt' || fileName === 'req.txt') {
                const content = await getFileContent(owner, repo, path);
                if (content) {
                    const lines = content.split('\n');
                    lines.forEach(line => {
                        const dep = line.split(/[=<>\s]/)[0].trim().toLowerCase();
                        if (dep && DEPENDENCY_MAP[dep]) {
                            const { name, category } = DEPENDENCY_MAP[dep];
                            tech[category].add(name);
                            readinessScore += 3;
                        }
                    });
                }
            }

            // 3. pom.xml (Java Maven)
            if (fileName === 'pom.xml') {
                const content = await getFileContent(owner, repo, path);
                if (content) {
                    Object.keys(DEPENDENCY_MAP).forEach(key => {
                        if (content.includes(key)) {
                            const { name, category } = DEPENDENCY_MAP[key];
                            tech[category].add(name);
                            readinessScore += 3;
                        }
                    });
                }
            }
        }

        // --- STEP D: Final Polish ---

        // Convert Sets to Arrays
        const result = {
            languages: [...tech.languages],
            frontend: [...tech.frontend],
            backend: [...tech.backend],
            database: [...tech.database],
            devops: [...tech.devops],
            testing: [...tech.testing],
            ml: [...tech.ml],
            tools: [...tech.tools]
        };

        // Flatten for DB compatibility (Legacy support)
        const flatSkills = [
            ...result.languages,
            ...result.frontend,
            ...result.backend,
            ...result.database,
            ...result.devops,
            ...result.testing,
            ...result.ml,
            ...result.tools
        ];

        // Cap score
        readinessScore = Math.min(readinessScore, 100);
        if (flatSkills.length > 0 && readinessScore < 30) readinessScore = 40; // Integrity bump

        console.log('✅ Extraction Success:', flatSkills);

        return {
            extractedSkills: flatSkills,
            readinessScore,
            structuredSkills: result // Return structured too if controller wants it later
        };

    } catch (error) {
        console.error('⚠️ Extraction Failed:', error.message);
        return { extractedSkills: [], readinessScore: 0 };
    }
};

module.exports = { extractSkills };

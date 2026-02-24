/**
 * dependencyParser.js
 * Identifies dependencies and configuration files from a list of files.
 */

const parseDependencies = (files) => {
    const dependencyList = [];
    const detectedFiles = [];

    // Helper to add if file exists
    const checkFile = (fileName) => {
        const found = files.find(f => f.path.endsWith(fileName));
        if (found) detectedFiles.push(fileName);
        return found;
    };

    // 1. package.json (Node.js)
    const pkg = checkFile('package.json');
    if (pkg && pkg.content) {
        try {
            const data = JSON.parse(pkg.content);
            const deps = { ...data.dependencies, ...data.devDependencies };
            dependencyList.push(...Object.keys(deps).map(d => d.toLowerCase()));
        } catch (e) {
            console.error('Error parsing package.json:', e.message);
        }
    }

    // 2. requirements.txt (Python)
    const reqs = checkFile('requirements.txt');
    if (reqs && reqs.content) {
        const lines = reqs.content.split('\n');
        lines.forEach(line => {
            // Clean versions and comments: "flask==2.0.1 # comment" -> "flask"
            const dep = line.split(/[=<>\s#]/)[0].trim().toLowerCase();
            if (dep) dependencyList.push(dep);
        });
    }

    // 3. Other signatures (Indicators only for now)
    checkFile('pom.xml');
    checkFile('go.mod');
    checkFile('Dockerfile');
    checkFile('docker-compose.yml');
    checkFile('tailwind.config.js');
    checkFile('tsconfig.json');

    return {
        dependencyList,
        detectedFiles
    };
};

module.exports = { parseDependencies };

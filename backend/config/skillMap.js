/**
 * skillMap.js
 * Defines detection rules for the Rule-Based Skill Extraction Engine.
 */

module.exports = {
    react: {
        name: "React",
        category: "Frontend Framework",
        dependencyNames: ["react", "react-dom", "react-scripts"],
        importPatterns: ["from 'react'", "from \"react\"", "import react", "import React"],
        usagePatterns: ["useState(", "useEffect(", "useContext(", "useMemo(", "useCallback(", "ReactDOM.render", "jsx(", "<div", "<span", "className="],
        fileIndicators: [".jsx", ".tsx"]
    },

    express: {
        name: "Express.js",
        category: "Backend Framework",
        dependencyNames: ["express"],
        importPatterns: ["require('express')", "from 'express'", "from \"express\""],
        usagePatterns: ["app.listen(", "app.use(", "express()", "router.get(", "router.post(", "app.get(", "app.post(", "app.put(", "app.delete("]
    },

    mongoose: {
        name: "MongoDB",
        category: "Database",
        dependencyNames: ["mongoose"],
        importPatterns: ["require('mongoose')", "from 'mongoose'", "mongoose"],
        usagePatterns: ["mongoose.connect(", "new mongoose.Schema(", "mongoose.model("]
    },

    nodejs: {
        name: "Node.js",
        category: "Runtime",
        dependencyNames: [],
        importPatterns: ["require("],
        usagePatterns: ["process.env", "fs.readFile", "path.join"],
        fileIndicators: ["package.json"]
    },

    docker: {
        name: "Docker",
        category: "DevOps",
        dependencyNames: [],
        importPatterns: [],
        usagePatterns: ["FROM ", "RUN ", "EXPOSE "],
        fileIndicators: ["Dockerfile", "docker-compose.yml"]
    },

    tailwind: {
        name: "Tailwind CSS",
        category: "CSS Framework",
        dependencyNames: ["tailwindcss"],
        importPatterns: ["from 'tailwindcss'"],
        usagePatterns: ["@tailwind base", "@tailwind components"],
        fileIndicators: ["tailwind.config.js"]
    },

    typescript: {
        name: "TypeScript",
        category: "Language",
        dependencyNames: ["typescript"],
        importPatterns: [],
        usagePatterns: ["interface ", "type ", "@types/"],
        fileIndicators: [".ts", ".tsx", "tsconfig.json"]
    },

    python: {
        name: "Python",
        category: "Language",
        dependencyNames: [],
        importPatterns: ["import ", "from "],
        usagePatterns: ["def ", "class ", "print("],
        fileIndicators: [".py", "requirements.txt", "Pipfile"]
    },

    tensorflow: {
        name: "TensorFlow",
        category: "Machine Learning",
        dependencyNames: ["tensorflow", "@tensorflow/tfjs"],
        importPatterns: ["import tensorflow", "from 'tensorflow'"],
        usagePatterns: ["tf.model", "tf.layers", "tf.predict"],
        fileIndicators: [".ipynb"]
    }
};

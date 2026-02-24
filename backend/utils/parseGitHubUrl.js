/**
 * Parses a GitHub URL and extracts the owner and repository name.
 * 
 * @param {string} url - The GitHub repository URL.
 * @returns {object|null} - { owner, repo } if valid, otherwise null.
 */
const parseGitHubUrl = (url) => {
    if (!url || typeof url !== 'string') return null;

    try {
        const parsedUrl = new URL(url.trim());

        // Ensure it's a GitHub URL
        if (parsedUrl.hostname !== 'github.com') return null;

        // Pathname should be /owner/repo
        // Split and filter out empty strings
        const pathParts = parsedUrl.pathname.split('/').filter(part => part.length > 0);

        if (pathParts.length < 2) return null;

        const owner = pathParts[0];
        // Remove .git if present and ignore extra paths like /tree/main
        const repo = pathParts[1].replace(/\.git$/, '');

        return { owner, repo };
    } catch (error) {
        return null; // Invalid URL
    }
};

module.exports = parseGitHubUrl;

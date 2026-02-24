const axios = require('axios');

/**
 * Exchange OAuth code for access token
 * @param {string} code Authorization code from GitHub
 * @returns {Promise<string>} Access token
 */
const exchangeCodeForToken = async (code) => {
    try {
        const response = await axios({
            method: 'post',
            url: 'https://github.com/login/oauth/access_token',
            data: {
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code: code
            },
            headers: {
                accept: 'application/json'
            }
        });

        if (response.data.error) {
            throw new Error(response.data.error_description || response.data.error);
        }

        return response.data.access_token;
    } catch (err) {
        console.error('Error exchanging code for token:', err.response?.data || err.message);
        throw new Error('Failed to exchange code for GitHub access token');
    }
};

/**
 * Fetch GitHub user profile and verified primary email
 * @param {string} accessToken GitHub access token
 * @returns {Promise<object>} User profile data
 */
const getUserData = async (accessToken) => {
    try {
        // Fetch profile
        const userResponse = await axios.get('https://api.github.com/user', {
            headers: {
                Authorization: `token ${accessToken}`
            }
        });

        // Fetch emails
        const emailsResponse = await axios.get('https://api.github.com/user/emails', {
            headers: {
                Authorization: `token ${accessToken}`
            }
        });

        const primaryEmail = emailsResponse.data.find(email => email.primary && email.verified);

        if (!primaryEmail) {
            throw new Error('No verified primary email found on GitHub account');
        }

        return {
            githubId: userResponse.data.id.toString(),
            githubUsername: userResponse.data.login,
            githubEmail: primaryEmail.email,
            githubAvatar: userResponse.data.avatar_url
        };
    } catch (err) {
        console.error('Error fetching GitHub user data:', err.response?.data || err.message);
        throw new Error('Failed to fetch user data from GitHub');
    }
};

/**
 * Fetch detailed repository metadata
 * @param {string} owner Repository owner
 * @param {string} repo Repository name
 * @returns {Promise<object>} Repository data
 */
const fetchRepository = async (owner, repo) => {
    try {
        const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
            headers: {
                Authorization: `token ${process.env.GITHUB_TOKEN}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });
        return response.data;
    } catch (err) {
        if (err.response?.status === 404) throw new Error('Repository not found on GitHub');
        if (err.response?.status === 403) throw new Error('GitHub API rate limit exceeded');
        throw new Error('Failed to fetch repository data');
    }
};

/**
 * Fetch repository languages
 * @param {string} owner Repository owner
 * @param {string} repo Repository name
 * @returns {Promise<object>} Languages object
 */
const fetchLanguages = async (owner, repo) => {
    try {
        const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/languages`, {
            headers: {
                Authorization: `token ${process.env.GITHUB_TOKEN}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });
        return response.data;
    } catch (err) {
        throw new Error('Failed to fetch repository languages');
    }
};

/**
 * Fetch commit count for a specific author
 * @param {string} owner Repository owner
 * @param {string} repo Repository name
 * @param {string} username GitHub username
 * @returns {Promise<number>} Commit count
 */
const fetchCommitsByAuthor = async (owner, repo, username) => {
    try {
        // Basic version: per_page=1 and check total count in header or length
        // For simplicity in Phase 1, we'll check the length of the result
        const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits`, {
            params: { author: username, per_page: 100 },
            headers: {
                Authorization: `token ${process.env.GITHUB_TOKEN}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });
        return response.data.length;
    } catch (err) {
        return 0;
    }
};

/**
 * Fetch total commit count for a repository
 * @param {string} owner Repository owner
 * @param {string} repo Repository name
 * @returns {Promise<number>} Total commit count
 */
const fetchTotalCommitCount = async (owner, repo) => {
    try {
        const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits`, {
            params: { per_page: 100 },
            headers: {
                Authorization: `token ${process.env.GITHUB_TOKEN}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });
        return response.data.length;
    } catch (err) {
        return 0;
    }
};

module.exports = {
    exchangeCodeForToken,
    getUserData,
    fetchRepository,
    fetchLanguages,
    fetchCommitsByAuthor,
    fetchTotalCommitCount
};

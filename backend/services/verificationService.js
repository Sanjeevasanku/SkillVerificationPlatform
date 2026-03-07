const githubService = require('./githubService');

/**
 * Verifies a repository based on student data and GitHub metadata
 * 
 * @param {object} student - The student document from DB
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<object>} - Structured verification result
 */
const verifyRepository = async (student, owner, repo) => {
    // 1. Fetch Repository Metadata
    const repoData = await githubService.fetchRepository(owner, repo);

    // Rejection Criteria
    if (repoData.private) throw new Error('Private repositories are not supported');
    if (repoData.disabled) throw new Error('Repository is disabled');

    // 2. Fetch Languages
    const languages = await githubService.fetchLanguages(owner, repo);
    if (!languages || Object.keys(languages).length === 0) {
        throw new Error('Repository has no detectable programming languages');
    }

    // 3. Ownership / Contribution Validation
    let commitCountByStudent = 0;
    let totalCommitCount = 0;

    const isOrganization = repoData.owner.type === 'Organization';
    const isFork = repoData.fork;
    const isPersonal = repoData.owner.type === 'User';

    if (isPersonal) {
        // CASE A: Personal Repo - Must be owned by the student
        if (repoData.owner.id.toString() !== student.githubId) {
            // If not owned, check if there are contributions (fallback for shared personal repos)
            commitCountByStudent = await githubService.fetchCommitsByAuthor(owner, repo, student.githubUsername);
            if (commitCountByStudent === 0) {
                throw new Error('You are not the owner of this personal repository and have no recorded commits');
            }
        } else {
            // Is owner, fetch counts for stats
            commitCountByStudent = await githubService.fetchCommitsByAuthor(owner, repo, student.githubUsername);
        }
    } else if (isOrganization) {
        // CASE B: Organization Repo - Must have commits
        commitCountByStudent = await githubService.fetchCommitsByAuthor(owner, repo, student.githubUsername);
        if (commitCountByStudent === 0) {
            throw new Error('No commits found by you in this organization repository');
        }
    }

    // CASE C: Forked Repo - Must have commits regardless of owner type
    if (isFork) {
        if (commitCountByStudent === 0) {
            // Might not have fetched if it was a personal repo owned by student but no commits (rare but possible)
            commitCountByStudent = await githubService.fetchCommitsByAuthor(owner, repo, student.githubUsername);
            if (commitCountByStudent === 0) {
                throw new Error('No commits found by you in this forked repository');
            }
        }
    }

    // 4. Commit Analysis
    totalCommitCount = await githubService.fetchTotalCommitCount(owner, repo);

    // Ensure totalCommitCount is at least commitCountByStudent
    if (totalCommitCount < commitCountByStudent) totalCommitCount = commitCountByStudent;

    const contributionPercentage = totalCommitCount > 0
        ? Math.round((commitCountByStudent / totalCommitCount) * 100)
        : 0;

    // 5. Structure Result
    return {
        repoMetadata: {
            repoId: repoData.id,
            repoName: repoData.name,
            repoOwner: repoData.owner.login,
            repoOwnerId: repoData.owner.id,
            repoOwnerType: repoData.owner.type,
            isFork: repoData.fork,
            isArchived: repoData.archived,
            primaryLanguage: repoData.language,
            stars: repoData.stargazers_count,
            forks: repoData.forks_count,
            githubLink: repoData.html_url,
            size: repoData.size
        },
        totalCommitCount,
        commitCountByStudent,
        contributionPercentage
    };
};

module.exports = {
    verifyRepository
};

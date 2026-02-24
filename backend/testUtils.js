const parseGitHubUrl = require('./utils/parseGitHubUrl');
// Add other logic here if needed, but for now let's just test the URL parser
const urls = [
    "https://github.com/user/repo",
    "https://github.com/user/repo.git",
    "https://github.com/user/repo/",
    "https://github.com/user/repo/tree/main",
    "https://github.com/user/repo?query=1",
    "not a url",
    "https://gitlab.com/user/repo"
];

console.log("--- Testing parseGitHubUrl ---");
urls.forEach(url => {
    const result = parseGitHubUrl(url);
    console.log(`URL: ${url} => Result:`, result);
});

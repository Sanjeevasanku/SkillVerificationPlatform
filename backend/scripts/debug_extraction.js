const { extractSkills } = require('../utils/advancedSkillExtractor');

const run = async () => {
    const link = 'https://github.com/Sanjeevasanku/saanjh.git';
    console.log(`Debugging extraction for: ${link}`);

    try {
        const result = await extractSkills(link);
        console.log('\n--- FINAL RESULT ---');
        console.log(JSON.stringify(result, null, 2));
    } catch (err) {
        console.error('Fatal Error:', err);
    }
};

run();

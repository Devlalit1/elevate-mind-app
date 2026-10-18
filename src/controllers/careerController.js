const { asyncHandler } = require('../middleware/errorHandler');

/** Career category recommendations */
const RECOMMENDATIONS = {
  tech: {
    title: 'Technology & Engineering',
    emoji: '💻',
    roles: ['Software Engineer', 'Data Scientist', 'AI/ML Specialist', 'Cybersecurity Analyst', 'Cloud Architect'],
    advice:
      'Build a strong portfolio of projects on GitHub, practice data structures & algorithms daily, and dive into cloud platforms (AWS/GCP) and AI technologies.',
    resources: [
      { name: 'freeCodeCamp', url: 'https://freecodecamp.org' },
      { name: 'LeetCode', url: 'https://leetcode.com' },
      { name: 'AWS Free Tier', url: 'https://aws.amazon.com/free' },
    ],
  },
  creative: {
    title: 'Design & Creative Media',
    emoji: '🎨',
    roles: ['UI/UX Designer', 'Product Designer', 'Motion Designer', 'Content Strategist', 'Creative Director'],
    advice:
      'Build a stunning portfolio on Behance or Dribbble, study human-centered design principles, and learn tools like Figma, Adobe XD, and After Effects.',
    resources: [
      { name: 'Figma Community', url: 'https://figma.com/community' },
      { name: 'Behance', url: 'https://behance.net' },
      { name: 'Interaction Design Foundation', url: 'https://interaction-design.org' },
    ],
  },
  people: {
    title: 'Healthcare, Counseling & Education',
    emoji: '🤝',
    roles: ['Clinical Psychologist', 'Career Counselor', 'HR Specialist', 'Corporate Trainer', 'Social Worker'],
    advice:
      'Develop active listening and empathy skills through volunteering, pursue relevant certifications (SHRM, counseling licenses), and build mentoring relationships.',
    resources: [
      { name: 'Coursera Psychology', url: 'https://coursera.org/browse/health/psychology' },
      { name: 'SHRM Certification', url: 'https://shrm.org/credentials' },
      { name: 'Mind Tools', url: 'https://mindtools.com' },
    ],
  },
  business: {
    title: 'Business, Finance & Strategy',
    emoji: '📈',
    roles: ['Product Manager', 'Management Consultant', 'Financial Analyst', 'Marketing Manager', 'Entrepreneur'],
    advice:
      'Hone analytical, leadership, and communication skills via case study practice, pursue an MBA or CFA, and build your network through LinkedIn and industry events.',
    resources: [
      { name: 'Case Interview Prep', url: 'https://caseinterview.com' },
      { name: 'CFA Institute', url: 'https://cfainstitute.org' },
      { name: 'Harvard Business Review', url: 'https://hbr.org' },
    ],
  },
};

/**
 * POST /api/career-assessment
 * Receives an array of answers (category strings) and returns the top recommendation.
 */
const submitAssessment = asyncHandler(async (req, res) => {
  const { answers } = req.body;

  // Tally votes per category
  const counts = { tech: 0, creative: 0, people: 0, business: 0 };
  answers.forEach((ans) => {
    if (counts[ans] !== undefined) counts[ans]++;
  });

  const topCategory = Object.keys(counts).reduce((a, b) => (counts[a] >= counts[b] ? a : b));

  res.json({
    success: true,
    data: {
      ...RECOMMENDATIONS[topCategory],
      category: topCategory,
      scores: counts,
    },
  });
});

module.exports = { submitAssessment };

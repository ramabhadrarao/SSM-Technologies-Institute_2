// server/scripts/seedSkills.js
require('dotenv').config();
const mongoose = require('mongoose');
const Skill = require('../models/Skill');

const skills = [
  // Programming Skills
  { name: 'JavaScript', category: 'programming', level: 'beginner', description: 'Modern JavaScript programming' },
  { name: 'Python', category: 'programming', level: 'beginner', description: 'Python programming fundamentals' },
  { name: 'Java', category: 'programming', level: 'intermediate', description: 'Java application development' },
  { name: 'C++', category: 'programming', level: 'intermediate', description: 'C++ programming' },
  { name: 'React', category: 'programming', level: 'intermediate', description: 'React.js frontend development' },
  { name: 'Node.js', category: 'programming', level: 'intermediate', description: 'Node.js backend development' },
  { name: 'Angular', category: 'programming', level: 'intermediate', description: 'Angular framework' },
  { name: 'Vue.js', category: 'programming', level: 'intermediate', description: 'Vue.js framework' },
  { name: 'Django', category: 'programming', level: 'advanced', description: 'Django web framework' },
  { name: 'Flask', category: 'programming', level: 'intermediate', description: 'Flask micro-framework' },
  { name: 'Spring Boot', category: 'programming', level: 'advanced', description: 'Spring Boot framework' },
  { name: 'Express.js', category: 'programming', level: 'intermediate', description: 'Express.js for Node.js' },
  { name: 'TypeScript', category: 'programming', level: 'intermediate', description: 'TypeScript programming' },
  { name: 'PHP', category: 'programming', level: 'beginner', description: 'PHP web development' },
  { name: 'Ruby', category: 'programming', level: 'intermediate', description: 'Ruby programming' },
  { name: 'Go', category: 'programming', level: 'advanced', description: 'Go programming language' },
  { name: 'Rust', category: 'programming', level: 'advanced', description: 'Rust systems programming' },
  { name: 'Swift', category: 'programming', level: 'intermediate', description: 'Swift for iOS development' },
  { name: 'Kotlin', category: 'programming', level: 'intermediate', description: 'Kotlin for Android' },
  
  // Data Science Skills
  { name: 'Machine Learning', category: 'data-science', level: 'advanced', description: 'ML algorithms and models' },
  { name: 'Deep Learning', category: 'data-science', level: 'advanced', description: 'Neural networks and deep learning' },
  { name: 'Data Analysis', category: 'data-science', level: 'intermediate', description: 'Data analysis techniques' },
  { name: 'TensorFlow', category: 'data-science', level: 'advanced', description: 'TensorFlow framework' },
  { name: 'PyTorch', category: 'data-science', level: 'advanced', description: 'PyTorch deep learning' },
  { name: 'Pandas', category: 'data-science', level: 'intermediate', description: 'Data manipulation with Pandas' },
  { name: 'NumPy', category: 'data-science', level: 'intermediate', description: 'Numerical computing' },
  { name: 'SQL', category: 'data-science', level: 'beginner', description: 'SQL database queries' },
  { name: 'Data Visualization', category: 'data-science', level: 'intermediate', description: 'Data visualization techniques' },
  { name: 'Statistics', category: 'data-science', level: 'advanced', description: 'Statistical analysis' },
  { name: 'Big Data', category: 'data-science', level: 'advanced', description: 'Big data technologies' },
  { name: 'Hadoop', category: 'data-science', level: 'advanced', description: 'Hadoop ecosystem' },
  { name: 'Spark', category: 'data-science', level: 'advanced', description: 'Apache Spark' },
  
  // Design Skills
  { name: 'UI/UX Design', category: 'design', level: 'intermediate', description: 'User interface and experience design' },
  { name: 'Graphic Design', category: 'design', level: 'intermediate', description: 'Graphic design principles' },
  { name: 'Adobe Photoshop', category: 'design', level: 'intermediate', description: 'Photo editing and design' },
  { name: 'Adobe Illustrator', category: 'design', level: 'intermediate', description: 'Vector graphics design' },
  { name: 'Figma', category: 'design', level: 'intermediate', description: 'UI design with Figma' },
  { name: 'Sketch', category: 'design', level: 'intermediate', description: 'UI design with Sketch' },
  { name: 'Adobe XD', category: 'design', level: 'intermediate', description: 'Adobe XD prototyping' },
  { name: 'Web Design', category: 'design', level: 'beginner', description: 'Website design principles' },
  { name: 'Mobile Design', category: 'design', level: 'intermediate', description: 'Mobile app design' },
  { name: 'Responsive Design', category: 'design', level: 'intermediate', description: 'Responsive web design' },
  { name: 'Animation', category: 'design', level: 'advanced', description: 'UI animation and motion design' },
  
  // Marketing Skills
  { name: 'Digital Marketing', category: 'marketing', level: 'beginner', description: 'Digital marketing strategies' },
  { name: 'SEO', category: 'marketing', level: 'intermediate', description: 'Search engine optimization' },
  { name: 'Content Marketing', category: 'marketing', level: 'intermediate', description: 'Content marketing strategies' },
  { name: 'Social Media Marketing', category: 'marketing', level: 'beginner', description: 'Social media strategies' },
  { name: 'Email Marketing', category: 'marketing', level: 'beginner', description: 'Email campaign management' },
  { name: 'Google Analytics', category: 'marketing', level: 'intermediate', description: 'Web analytics with Google' },
  { name: 'PPC Advertising', category: 'marketing', level: 'intermediate', description: 'Pay-per-click advertising' },
  { name: 'Copywriting', category: 'marketing', level: 'intermediate', description: 'Marketing copywriting' },
  { name: 'Brand Strategy', category: 'marketing', level: 'advanced', description: 'Brand development and strategy' },
  
  // Business Skills
  { name: 'Project Management', category: 'business', level: 'intermediate', description: 'Project management principles' },
  { name: 'Agile Methodologies', category: 'business', level: 'intermediate', description: 'Agile and Scrum' },
  { name: 'Business Analysis', category: 'business', level: 'intermediate', description: 'Business analysis techniques' },
  { name: 'Financial Analysis', category: 'business', level: 'advanced', description: 'Financial modeling and analysis' },
  { name: 'Leadership', category: 'business', level: 'advanced', description: 'Leadership and management' },
  { name: 'Communication', category: 'business', level: 'beginner', description: 'Professional communication' },
  { name: 'Strategic Planning', category: 'business', level: 'advanced', description: 'Strategic business planning' },
  { name: 'Sales', category: 'business', level: 'intermediate', description: 'Sales techniques and strategies' },
  { name: 'Entrepreneurship', category: 'business', level: 'advanced', description: 'Starting and running businesses' },
  
  // Other Skills
  { name: 'Cloud Computing', category: 'other', level: 'intermediate', description: 'Cloud platforms and services' },
  { name: 'AWS', category: 'other', level: 'advanced', description: 'Amazon Web Services' },
  { name: 'Azure', category: 'other', level: 'advanced', description: 'Microsoft Azure' },
  { name: 'Docker', category: 'other', level: 'intermediate', description: 'Container orchestration' },
  { name: 'Kubernetes', category: 'other', level: 'advanced', description: 'Container orchestration' },
  { name: 'DevOps', category: 'other', level: 'advanced', description: 'DevOps practices' },
  { name: 'CI/CD', category: 'other', level: 'intermediate', description: 'Continuous integration and deployment' },
  { name: 'Git', category: 'other', level: 'beginner', description: 'Version control with Git' },
  { name: 'Linux', category: 'other', level: 'intermediate', description: 'Linux system administration' },
  { name: 'Cybersecurity', category: 'other', level: 'advanced', description: 'Security principles and practices' },
  { name: 'Blockchain', category: 'other', level: 'advanced', description: 'Blockchain technology' },
  { name: 'IoT', category: 'other', level: 'advanced', description: 'Internet of Things' },
  { name: 'API Development', category: 'other', level: 'intermediate', description: 'RESTful API design' },
  { name: 'Microservices', category: 'other', level: 'advanced', description: 'Microservices architecture' },
  { name: 'Testing', category: 'other', level: 'intermediate', description: 'Software testing methodologies' }
];

async function seedSkills() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ssm_technologies_latest');
    console.log('✅ Connected to MongoDB');

    // Clear existing skills
    await Skill.deleteMany({});
    console.log('🗑️  Cleared existing skills');

    // Insert new skills
    const insertedSkills = await Skill.insertMany(skills);
    console.log(`✅ Inserted ${insertedSkills.length} skills`);

    // Display summary by category
    const categories = [...new Set(skills.map(s => s.category))];
    console.log('\n📊 Skills by Category:');
    for (const category of categories) {
      const count = skills.filter(s => s.category === category).length;
      console.log(`   ${category}: ${count} skills`);
    }

    console.log('\n✅ Skills seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding skills:', error);
    process.exit(1);
  }
}

// Run the seed function
seedSkills();

// Add to package.json scripts:
// "seed:skills": "node server/scripts/seedSkills.js"
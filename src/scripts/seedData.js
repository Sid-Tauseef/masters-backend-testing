const mongoose = require('mongoose');
require('dotenv').config();

const Admin = require('../models/Admin');
const Course = require('../models/Course');
const Topper = require('../models/Topper');
const Achievement = require('../models/Achievement');
const Home = require('../models/Home');
const Gallery = require('../models/Gallery');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected for seeding');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const seedAdmin = async () => {
  try {
    const adminExists = await Admin.findOne({ email: 'admin@radianceacademy.com' });
    
    if (!adminExists) {
      await Admin.create({
        name: 'Admin',
        email: 'admin@radianceacademy.com',
        password: 'admin123',
        role: 'super-admin',
        permissions: ['courses', 'toppers', 'achievements', 'gallery', 'contacts', 'home', 'users']
      });
      console.log('✅ Admin user created');
    } else {
      console.log('ℹ️ Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
  }
};

const seedHomeData = async () => {
  try {
    const homeSections = [
      {
        section: 'hero',
        title: 'Welcome to Masters Academy',
        subtitle: 'Illuminating Minds, Shaping Futures',
        content: 'At Masters Academy, we are committed to providing quality education that empowers students to achieve their dreams and excel in their chosen fields.',
        image: 'https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg',
        buttonText: 'Explore Courses',
        buttonLink: '/courses',
        isActive: true,
        order: 1
      },
      {
        section: 'about',
        title: 'About Masters Academy',
        content: 'Masters Academy has been a beacon of educational excellence for over a decade. We specialize in competitive exam preparation, academic support, and skill development programs that prepare students for success in their academic and professional journeys.',
        image: 'https://images.pexels.com/photos/5212700/pexels-photo-5212700.jpeg',
        isActive: true,
        order: 2
      },
      {
        section: 'vision',
        title: 'Our Vision',
        content: 'To be the leading educational institution that transforms lives through innovative teaching methodologies, personalized attention, and comprehensive development programs.',
        isActive: true,
        order: 3
      },
      {
        section: 'mission',
        title: 'Our Mission',
        content: 'To provide world-class education that nurtures intellectual curiosity, develops critical thinking skills, and prepares students to become responsible global citizens and future leaders.',
        isActive: true,
        order: 4
      },
      {
        section: 'stats',
        title: 'Our Achievements',
        content: 'Numbers that speak for our excellence',
        stats: [
          { label: 'Students Enrolled', value: '5000+', icon: 'users' },
          { label: 'Success Rate', value: '95%', icon: 'trophy' },
          { label: 'Expert Faculty', value: '50+', icon: 'user-check' },
          { label: 'Years of Excellence', value: '15+', icon: 'calendar' }
        ],
        isActive: true,
        order: 5
      }
    ];

    for (const section of homeSections) {
      const exists = await Home.findOne({ section: section.section });
      if (!exists) {
        await Home.create(section);
        console.log(`✅ Created home section: ${section.section}`);
      }
    }
  } catch (error) {
    console.error('❌ Error seeding home data:', error);
  }
};

const seedCourses = async () => {
  try {
    const courses = [
      {
        title: 'JEE Main & Advanced Preparation',
        description: 'Comprehensive preparation program for JEE Main and Advanced with expert faculty, regular mock tests, and personalized guidance.',
        shortDescription: 'Complete JEE preparation with expert guidance and proven results.',
        image: 'https://images.pexels.com/photos/5212329/pexels-photo-5212329.jpeg',
        duration: '2 Years',
        level: 'Advanced',
        category: 'Competitive',
        features: ['Expert Faculty', 'Regular Mock Tests', 'Study Material', 'Doubt Clearing Sessions'],
        price: 50000,
        discountPrice: 45000,
        instructor: {
          name: 'Dr. Rajesh Kumar',
          qualification: 'Ph.D. in Physics, IIT Delhi',
          experience: '15 years'
        }
      },
      {
        title: 'NEET Preparation Course',
        description: 'Specialized medical entrance exam preparation with focus on Biology, Chemistry, and Physics.',
        shortDescription: 'Medical entrance exam preparation with high success rate.',
        image: 'https://images.pexels.com/photos/5212317/pexels-photo-5212317.jpeg',
        duration: '1 Year',
        level: 'Advanced',
        category: 'Competitive',
        features: ['Medical Expert Faculty', 'NCERT Focus', 'Regular Tests', 'Previous Year Papers'],
        price: 40000,
        discountPrice: 35000,
        instructor: {
          name: 'Dr. Priya Sharma',
          qualification: 'MBBS, MD',
          experience: '12 years'
        }
      },
      {
        title: 'Class 10 CBSE Foundation',
        description: 'Strong foundation course for Class 10 students covering all CBSE subjects with regular assessments.',
        shortDescription: 'Complete Class 10 CBSE preparation with strong foundation.',
        image: 'https://images.pexels.com/photos/5212324/pexels-photo-5212324.jpeg',
        duration: '1 Year',
        level: 'Intermediate',
        category: 'Academic',
        features: ['All Subjects Covered', 'Regular Assessments', 'Doubt Sessions', 'Parent-Teacher Meetings'],
        price: 25000,
        discountPrice: 22000,
        instructor: {
          name: 'Mrs. Sunita Verma',
          qualification: 'M.Sc., B.Ed.',
          experience: '10 years'
        }
      }
    ];

    for (const course of courses) {
      const exists = await Course.findOne({ title: course.title });
      if (!exists) {
        await Course.create(course);
        console.log(`✅ Created course: ${course.title}`);
      }
    }
  } catch (error) {
    console.error('❌ Error seeding courses:', error);
  }
};

const seedToppers = async () => {
  try {
    const toppers = [
      {
        name: 'Arjun Patel',
        photo: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
        achievement: 'AIR 15 in JEE Advanced',
        exam: 'JEE Advanced 2023',
        year: 2023,
        score: '324/360',
        rank: 'AIR 15',
        course: 'JEE Main & Advanced',
        testimonial: 'Masters Academy provided me with the perfect environment and guidance to achieve my dream of getting into IIT.',
        featured: true
      },
      {
        name: 'Priya Singh',
        photo: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg',
        achievement: 'AIR 25 in NEET',
        exam: 'NEET 2023',
        year: 2023,
        score: '695/720',
        rank: 'AIR 25',
        course: 'NEET Preparation',
        testimonial: 'The faculty at Masters Academy helped me understand complex concepts easily and build confidence.',
        featured: true
      },
      {
        name: 'Rohit Kumar',
        photo: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg',
        achievement: '98.2% in Class 12 CBSE',
        exam: 'CBSE Class 12',
        year: 2023,
        score: '98.2%',
        rank: 'School Topper',
        course: 'Class 12 CBSE',
        testimonial: 'The systematic approach and regular tests helped me achieve excellent results in board exams.'
      }
    ];

    for (const topper of toppers) {
      const exists = await Topper.findOne({ name: topper.name, year: topper.year });
      if (!exists) {
        await Topper.create(topper);
        console.log(`✅ Created topper: ${topper.name}`);
      }
    }
  } catch (error) {
    console.error('❌ Error seeding toppers:', error);
  }
};

const seedAchievements = async () => {
  try {
    const achievements = [
      {
        title: 'Best Coaching Institute Award 2023',
        description: 'Recognized as the Best Coaching Institute for JEE/NEET preparation in the region.',
        image: 'https://images.pexels.com/photos/5905709/pexels-photo-5905709.jpeg',
        date: new Date('2023-12-15'),
        category: 'Institute Recognition',
        details: 'Awarded by the State Education Board for outstanding performance in competitive exam preparation.',
        featured: true,
        priority: 1
      },
      {
        title: '100% Pass Rate in Class 10',
        description: 'All our Class 10 students achieved passing grades with 85% scoring above 90%.',
        image: 'https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg',
        date: new Date('2023-06-01'),
        category: 'Academic Excellence',
        details: 'Outstanding performance by our Class 10 batch with exceptional results across all subjects.',
        featured: true,
        priority: 2
      },
      {
        title: 'Top 50 Students in JEE Advanced',
        description: 'Our students secured 50 positions in top 1000 ranks of JEE Advanced 2023.',
        image: 'https://images.pexels.com/photos/5212329/pexels-photo-5212329.jpeg',
        date: new Date('2023-09-15'),
        category: 'Student Achievement',
        details: 'Exceptional performance by our JEE batch with multiple students securing top ranks.',
        featured: true,
        priority: 3
      }
    ];

    for (const achievement of achievements) {
      const exists = await Achievement.findOne({ title: achievement.title });
      if (!exists) {
        await Achievement.create(achievement);
        console.log(`✅ Created achievement: ${achievement.title}`);
      }
    }
  } catch (error) {
    console.error('❌ Error seeding achievements:', error);
  }
};

const seedGallery = async () => {
  try {
    const galleryItems = [
      {
        title: 'Annual Function 2023',
        description: 'Students performing at our annual cultural function',
        image: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg',
        category: 'Functions',
        date: new Date('2023-12-20'),
        tags: ['cultural', 'performance', 'students'],
        featured: true
      },
      {
        title: 'Science Exhibition',
        description: 'Students showcasing their innovative science projects',
        image: 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg',
        category: 'Academic',
        date: new Date('2023-11-15'),
        tags: ['science', 'exhibition', 'innovation']
      },
      {
        title: 'Sports Day Celebration',
        description: 'Annual sports day with various athletic competitions',
        image: 'https://images.pexels.com/photos/1263349/pexels-photo-1263349.jpeg',
        category: 'Sports',
        date: new Date('2023-10-25'),
        tags: ['sports', 'athletics', 'competition']
      },
      {
        title: 'Campus Library',
        description: 'Our well-equipped library with extensive collection of books',
        image: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg',
        category: 'Campus Life',
        date: new Date('2023-09-01'),
        tags: ['library', 'books', 'study']
      },
      {
        title: 'Award Ceremony',
        description: 'Felicitating our top performers and achievers',
        image: 'https://images.pexels.com/photos/5905709/pexels-photo-5905709.jpeg',
        category: 'Achievements',
        date: new Date('2023-08-15'),
        tags: ['awards', 'ceremony', 'achievers'],
        featured: true
      },
      {
        title: 'Cultural Program',
        description: 'Students participating in cultural activities and performances',
        image: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg',
        category: 'Cultural',
        date: new Date('2023-07-20'),
        tags: ['cultural', 'dance', 'music']
      }
    ];

    for (const item of galleryItems) {
      const exists = await Gallery.findOne({ title: item.title });
      if (!exists) {
        await Gallery.create(item);
        console.log(`✅ Created gallery item: ${item.title}`);
      }
    }
  } catch (error) {
    console.error('❌ Error seeding gallery:', error);
  }
};

const seedAll = async () => {
  await connectDB();
  
  console.log('🌱 Starting database seeding...');
  
  await seedAdmin();
  await seedHomeData();
  await seedCourses();
  await seedToppers();
  await seedAchievements();
  await seedGallery();
  
  console.log('✅ Database seeding completed!');
  console.log('\n📋 Default Admin Credentials:');
  console.log('Email: admin@radianceacademy.com');
  console.log('Password: admin123');
  console.log('\n⚠️ Please change these credentials in production!');
  
  process.exit(0);
};

seedAll().catch(error => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
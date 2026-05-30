import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// POST seed the database with demo data
export async function POST() {
  try {
    // Clear existing data (reverse order of dependencies)
    await db.dailyTask.deleteMany();
    await db.dailyTimeBlock.deleteMany();
    await db.dailyPlan.deleteMany();
    await db.learningItem.deleteMany();
    await db.learningCategory.deleteMany();
    await db.certification.deleteMany();
    await db.portfolioProject.deleteMany();
    await db.jobApplication.deleteMany();
    await db.networkingConnection.deleteMany();
    await db.incomeEntry.deleteMany();
    await db.weeklyReview.deleteMany();
    await db.journalEntry.deleteMany();
    await db.northStarGoal.deleteMany();

    // ==========================================
    // 1. NORTH STAR GOALS (6)
    // ==========================================
    const goals = await Promise.all([
      db.northStarGoal.create({
        data: {
          title: 'Earn $5,000/month from remote work',
          target: 5000,
          current: 2350,
          deadline: daysAgo(-120),
        },
      }),
      db.northStarGoal.create({
        data: {
          title: 'Complete 5 professional certifications',
          target: 5,
          current: 2,
          deadline: daysAgo(-90),
        },
      }),
      db.northStarGoal.create({
        data: {
          title: 'Ship 8 portfolio projects',
          target: 8,
          current: 3,
          deadline: daysAgo(-150),
        },
      }),
      db.northStarGoal.create({
        data: {
          title: 'Build 50 meaningful network connections',
          target: 50,
          current: 22,
          deadline: daysAgo(-180),
        },
      }),
      db.northStarGoal.create({
        data: {
          title: 'Log 500 hours of structured learning',
          target: 500,
          current: 287,
          deadline: daysAgo(-200),
        },
      }),
      db.northStarGoal.create({
        data: {
          title: 'Get 3 job interviews at top companies',
          target: 3,
          current: 1,
          deadline: daysAgo(-60),
        },
      }),
    ]);

    // ==========================================
    // 2. LEARNING CATEGORIES (4) + ITEMS (12)
    // ==========================================
    const categoryWebDev = await db.learningCategory.create({
      data: { name: 'Web Development', color: '#10b981' },
    });
    const categoryAI = await db.learningCategory.create({
      data: { name: 'AI & Machine Learning', color: '#8b5cf6' },
    });
    const categoryDesign = await db.learningCategory.create({
      data: { name: 'Design & UX', color: '#f59e0b' },
    });
    const categoryBusiness = await db.learningCategory.create({
      data: { name: 'Business & Marketing', color: '#ef4444' },
    });

    const learningItems = await Promise.all([
      // Web Development (4)
      db.learningItem.create({
        data: {
          title: 'Next.js 15 App Router Mastery',
          categoryId: categoryWebDev.id,
          progress: 85,
          hoursSpent: 32,
          streak: 12,
          lastStudied: daysAgo(1),
          notes: 'Server components, streaming, and ISR are solid. Need to review middleware patterns.',
        },
      }),
      db.learningItem.create({
        data: {
          title: 'TypeScript Advanced Patterns',
          categoryId: categoryWebDev.id,
          progress: 60,
          hoursSpent: 18,
          streak: 5,
          lastStudied: daysAgo(2),
          notes: 'Working through discriminated unions and template literal types.',
        },
      }),
      db.learningItem.create({
        data: {
          title: 'PostgreSQL & Prisma ORM',
          categoryId: categoryWebDev.id,
          progress: 45,
          hoursSpent: 12,
          streak: 3,
          lastStudied: daysAgo(3),
          notes: 'Basic queries done. Moving to advanced relations and transactions.',
        },
      }),
      db.learningItem.create({
        data: {
          title: 'Tailwind CSS v4 Deep Dive',
          categoryId: categoryWebDev.id,
          progress: 90,
          hoursSpent: 15,
          streak: 8,
          lastStudied: daysAgo(1),
        },
      }),
      // AI & Machine Learning (4)
      db.learningItem.create({
        data: {
          title: 'Prompt Engineering for Developers',
          categoryId: categoryAI.id,
          progress: 70,
          hoursSpent: 22,
          streak: 7,
          lastStudied: daysAgo(1),
          notes: 'Chain-of-thought and few-shot techniques are powerful. Building a prompt library.',
        },
      }),
      db.learningItem.create({
        data: {
          title: 'LangChain & RAG Applications',
          categoryId: categoryAI.id,
          progress: 35,
          hoursSpent: 16,
          streak: 4,
          lastStudied: daysAgo(5),
          notes: 'Finished basic chains. Now working on retrieval-augmented generation pipelines.',
        },
      }),
      db.learningItem.create({
        data: {
          title: 'OpenAI API Integration',
          categoryId: categoryAI.id,
          progress: 55,
          hoursSpent: 10,
          streak: 6,
          lastStudied: daysAgo(2),
        },
      }),
      db.learningItem.create({
        data: {
          title: 'Vector Databases (Pinecone)',
          categoryId: categoryAI.id,
          progress: 20,
          hoursSpent: 6,
          streak: 2,
          lastStudied: daysAgo(7),
        },
      }),
      // Design & UX (2)
      db.learningItem.create({
        data: {
          title: 'Figma for Developers',
          categoryId: categoryDesign.id,
          progress: 40,
          hoursSpent: 8,
          streak: 0,
          lastStudied: daysAgo(14),
        },
      }),
      db.learningItem.create({
        data: {
          title: 'UI/UX Principles & Accessibility',
          categoryId: categoryDesign.id,
          progress: 30,
          hoursSpent: 5,
          streak: 0,
          lastStudied: daysAgo(21),
        },
      }),
      // Business & Marketing (2)
      db.learningItem.create({
        data: {
          title: 'Personal Branding on Social Media',
          categoryId: categoryBusiness.id,
          progress: 50,
          hoursSpent: 10,
          streak: 3,
          lastStudied: daysAgo(4),
        },
      }),
      db.learningItem.create({
        data: {
          title: 'Freelancing & Client Management',
          categoryId: categoryBusiness.id,
          progress: 65,
          hoursSpent: 14,
          streak: 0,
          lastStudied: daysAgo(10),
          notes: 'Built a client onboarding flow template. Need to work on proposal writing.',
        },
      }),
    ]);

    // ==========================================
    // 3. CERTIFICATIONS (5)
    // ==========================================
    const certifications = await Promise.all([
      db.certification.create({
        data: {
          name: 'AWS Cloud Practitioner',
          provider: 'Amazon Web Services',
          startDate: daysAgo(60),
          targetCompletion: daysAgo(-30),
          completionPct: 100,
          status: 'Completed',
        },
      }),
      db.certification.create({
        data: {
          name: 'Meta Front-End Developer',
          provider: 'Meta (Coursera)',
          startDate: daysAgo(45),
          targetCompletion: daysAgo(-15),
          completionPct: 100,
          status: 'Completed',
        },
      }),
      db.certification.create({
        data: {
          name: 'Google UX Design',
          provider: 'Google (Coursera)',
          startDate: daysAgo(30),
          targetCompletion: daysAgo(-60),
          completionPct: 45,
          status: 'In Progress',
        },
      }),
      db.certification.create({
        data: {
          name: 'Microsoft Azure AI Fundamentals',
          provider: 'Microsoft',
          startDate: daysAgo(10),
          targetCompletion: daysAgo(-50),
          completionPct: 15,
          status: 'In Progress',
        },
      }),
      db.certification.create({
        data: {
          name: 'CompTIA Security+',
          provider: 'CompTIA',
          startDate: null,
          targetCompletion: daysAgo(-120),
          completionPct: 0,
          status: 'Planned',
        },
      }),
    ]);

    // ==========================================
    // 4. PORTFOLIO PROJECTS (8)
    // ==========================================
    const projects = await Promise.all([
      db.portfolioProject.create({
        data: {
          title: 'Nevgo Mission Control Dashboard',
          description: 'A comprehensive personal OS dashboard for managing gap year activities including goals, learning, job tracking, and journaling.',
          skillsUsed: JSON.stringify(['Next.js', 'TypeScript', 'Prisma', 'SQLite', 'Tailwind CSS', 'shadcn/ui']),
          aiUsed: JSON.stringify(['AI Coach integration', 'Code suggestions with Copilot']),
          status: 'Building',
        },
      }),
      db.portfolioProject.create({
        data: {
          title: 'AI Resume Analyzer',
          description: 'Tool that analyzes resumes against job descriptions using AI and provides improvement suggestions.',
          skillsUsed: JSON.stringify(['React', 'Node.js', 'OpenAI API', 'PDF Parsing']),
          aiUsed: JSON.stringify(['Resume scoring with GPT-4', 'Keyword extraction']),
          status: 'Published',
          link: 'https://github.com/demo/ai-resume-analyzer',
          completionDate: daysAgo(14),
        },
      }),
      db.portfolioProject.create({
        data: {
          title: 'Freelance Invoice Generator',
          description: 'Full-stack SaaS tool for freelancers to create, track, and send professional invoices.',
          skillsUsed: JSON.stringify(['Next.js', 'Stripe', 'PostgreSQL', 'PDF Generation']),
          aiUsed: JSON.stringify(['Auto-categorization of line items']),
          status: 'Published',
          link: 'https://github.com/demo/invoice-gen',
          completionDate: daysAgo(30),
        },
      }),
      db.portfolioProject.create({
        data: {
          title: 'Habit Tracker with AI Insights',
          description: 'A habit tracking app that uses AI to analyze patterns and suggest optimizations.',
          skillsUsed: JSON.stringify(['React Native', 'Expo', 'Python', 'FastAPI']),
          aiUsed: JSON.stringify(['Pattern recognition', 'Personalized recommendations']),
          status: 'Review',
        },
      }),
      db.portfolioProject.create({
        data: {
          title: 'Community Event Platform',
          description: 'Platform for discovering and organizing local tech meetups and workshops.',
          skillsUsed: JSON.stringify(['Vue.js', 'Supabase', 'Mapbox', 'WebPush']),
          aiUsed: JSON.stringify(['Event recommendations']),
          status: 'Planning',
        },
      }),
      db.portfolioProject.create({
        data: {
          title: 'E-commerce Storefront Template',
          description: 'Production-ready e-commerce template with AI-powered product recommendations.',
          skillsUsed: JSON.stringify(['Next.js', 'Stripe', 'Sanity CMS', 'Vercel']),
          aiUsed: JSON.stringify(['Product recommendations', 'Search enhancement']),
          status: 'Building',
        },
      }),
      db.portfolioProject.create({
        data: {
          title: 'Markdown Blog Engine',
          description: 'Minimal, fast markdown-based blog with AI-assisted writing and SEO optimization.',
          skillsUsed: JSON.stringify(['Astro', 'MDX', 'TypeScript']),
          aiUsed: JSON.stringify(['SEO suggestions', 'Grammar check']),
          status: 'Published',
          link: 'https://github.com/demo/md-blog',
          completionDate: daysAgo(50),
        },
      }),
      db.portfolioProject.create({
        data: {
          title: 'CLI Dev Productivity Toolkit',
          description: 'Collection of CLI tools for developers including project scaffolding, code stats, and git utilities.',
          skillsUsed: JSON.stringify(['Rust', 'CLI', 'Git API']),
          aiUsed: JSON.stringify([]),
          status: 'Idea',
        },
      }),
    ]);

    // ==========================================
    // 5. JOB APPLICATIONS (12)
    // ==========================================
    const jobApplications = await Promise.all([
      db.jobApplication.create({
        data: {
          company: 'Vercel',
          position: 'Frontend Engineer',
          country: 'USA (Remote)',
          salaryRange: '$120k-$160k',
          jobLink: 'https://vercel.com/careers',
          applicationDate: daysAgo(7),
          status: 'Interview',
          notes: 'Phone screen completed. Technical round scheduled for next week.',
        },
      }),
      db.jobApplication.create({
        data: {
          company: 'Stripe',
          position: 'Developer Advocate',
          country: 'USA (Remote)',
          salaryRange: '$140k-$180k',
          applicationDate: daysAgo(14),
          status: 'Assessment',
          notes: 'Take-home coding challenge due in 3 days.',
        },
      }),
      db.jobApplication.create({
        data: {
          company: 'Supabase',
          position: 'Full Stack Developer',
          country: 'USA (Remote)',
          salaryRange: '$100k-$140k',
          applicationDate: daysAgo(10),
          status: 'Applied',
          notes: 'Applied through their careers page. Referenced open-source contributions.',
        },
      }),
      db.jobApplication.create({
        data: {
          company: 'Linear',
          position: 'Product Engineer',
          country: 'USA (Remote)',
          salaryRange: '$130k-$170k',
          applicationDate: daysAgo(5),
          status: 'Applied',
        },
      }),
      db.jobApplication.create({
        data: {
          company: 'Notion',
          position: 'Software Engineer',
          country: 'USA (Remote)',
          salaryRange: '$130k-$175k',
          applicationDate: daysAgo(21),
          status: 'Rejected',
          notes: 'Rejected after final round. Great learning experience.',
        },
      }),
      db.jobApplication.create({
        data: {
          company: 'Figma',
          position: 'Frontend Developer',
          country: 'USA (Remote)',
          salaryRange: '$125k-$165k',
          applicationDate: daysAgo(28),
          status: 'Rejected',
          notes: 'Position filled internally.',
        },
      }),
      db.jobApplication.create({
        data: {
          company: 'GitLab',
          position: 'Full Stack Engineer',
          country: 'Global (Remote)',
          salaryRange: '$95k-$140k',
          applicationDate: daysAgo(3),
          status: 'Applied',
        },
      }),
      db.jobApplication.create({
        data: {
          company: 'Shopify',
          position: 'Frontend Developer Intern',
          country: 'Canada (Remote)',
          salaryRange: '$45/hr CAD',
          applicationDate: daysAgo(12),
          status: 'Wishlist',
          notes: 'Re-opening applications next month.',
        },
      }),
      db.jobApplication.create({
        data: {
          company: 'Clerk',
          position: 'Developer Relations Engineer',
          country: 'USA (Remote)',
          salaryRange: '$110k-$150k',
          applicationDate: daysAgo(2),
          status: 'Applied',
          notes: 'Strong fit — already built projects with Clerk auth.',
        },
      }),
      db.jobApplication.create({
        data: {
          company: 'Resend',
          position: 'Software Engineer',
          country: 'USA (Remote)',
          salaryRange: '$120k-$160k',
          applicationDate: daysAgo(35),
          status: 'Offer',
          notes: 'Received offer! $135k base + equity. Deciding by end of week.',
        },
      }),
      db.jobApplication.create({
        data: {
          company: 'Railway',
          position: 'Platform Engineer',
          country: 'USA (Remote)',
          salaryRange: '$115k-$155k',
          applicationDate: daysAgo(18),
          status: 'Wishlist',
        },
      }),
      db.jobApplication.create({
        data: {
          company: 'PlanetScale',
          position: 'Developer Experience Engineer',
          country: 'USA (Remote)',
          salaryRange: '$125k-$165k',
          applicationDate: daysAgo(8),
          status: 'Wishlist',
          notes: 'Following their blog for application timing.',
        },
      }),
    ]);

    // ==========================================
    // 6. NETWORKING CONNECTIONS (10)
    // ==========================================
    const connections = await Promise.all([
      db.networkingConnection.create({
        data: {
          name: 'Sarah Chen',
          company: 'Vercel',
          role: 'Engineering Manager',
          platform: 'LinkedIn',
          connectionDate: daysAgo(30),
          lastInteraction: daysAgo(3),
          notes: 'Met at a meetup. She reviewed my portfolio project and gave great feedback.',
        },
      }),
      db.networkingConnection.create({
        data: {
          name: 'Marcus Johnson',
          company: 'Stripe',
          role: 'Senior Developer Advocate',
          platform: 'Twitter',
          connectionDate: daysAgo(45),
          lastInteraction: daysAgo(7),
          notes: 'Active in the Stripe community. Offered to introduce me to the hiring team.',
        },
      }),
      db.networkingConnection.create({
        data: {
          name: 'Priya Patel',
          company: 'Google',
          role: 'UX Researcher',
          platform: 'LinkedIn',
          connectionDate: daysAgo(60),
          lastInteraction: daysAgo(14),
          notes: 'Great for UX/career advice. Does monthly coffee chats.',
        },
      }),
      db.networkingConnection.create({
        data: {
          name: 'Alex Rivera',
          company: 'Freelance',
          role: 'Full Stack Developer',
          platform: 'Discord',
          connectionDate: daysAgo(90),
          lastInteraction: daysAgo(2),
          notes: 'Co-working buddy. We pair-program twice a week.',
        },
      }),
      db.networkingConnection.create({
        data: {
          name: 'Emma Wilson',
          company: 'GitHub',
          role: 'Product Manager',
          platform: 'LinkedIn',
          connectionDate: daysAgo(20),
          lastInteraction: daysAgo(10),
          notes: 'Discussed open-source strategy and how to contribute effectively.',
        },
      }),
      db.networkingConnection.create({
        data: {
          name: 'David Kim',
          company: 'AWS',
          role: 'Solutions Architect',
          platform: 'LinkedIn',
          connectionDate: daysAgo(75),
          lastInteraction: daysAgo(21),
          notes: 'Helped me prepare for the AWS certification exam.',
        },
      }),
      db.networkingConnection.create({
        data: {
          name: 'Lisa Thompson',
          company: 'Independent',
          role: 'Career Coach',
          platform: 'Email',
          connectionDate: daysAgo(100),
          lastInteraction: daysAgo(5),
          notes: 'Hired for 3 coaching sessions. Invaluable resume and interview advice.',
        },
      }),
      db.networkingConnection.create({
        data: {
          name: 'Omar Hassan',
          company: 'Supabase',
          role: 'Developer Advocate',
          platform: 'Discord',
          connectionDate: daysAgo(40),
          lastInteraction: daysAgo(4),
          notes: 'Very active in the Supabase community. Gave me early access to new features.',
        },
      }),
      db.networkingConnection.create({
        data: {
          name: 'Yuki Tanaka',
          company: 'Notion',
          role: 'Software Engineer',
          platform: 'X',
          connectionDate: daysAgo(55),
          lastInteraction: daysAgo(30),
          notes: 'Connection from the Notion interview process. Still on good terms.',
        },
      }),
      db.networkingConnection.create({
        data: {
          name: 'Chris Martinez',
          company: 'Acme Corp',
          role: 'CTO',
          platform: 'LinkedIn',
          connectionDate: daysAgo(15),
          lastInteraction: daysAgo(6),
          notes: 'Potential freelance client. Discussing a $3k project for their internal dashboard.',
        },
      }),
    ]);

    // ==========================================
    // 7. INCOME ENTRIES (8)
    // ==========================================
    const incomeEntries = await Promise.all([
      db.incomeEntry.create({
        data: {
          date: daysAgo(2),
          source: 'Chris Martinez - Dashboard Project',
          category: 'Freelance',
          amount: 1500,
          notes: 'First milestone payment for Acme Corp dashboard redesign.',
        },
      }),
      db.incomeEntry.create({
        data: {
          date: daysAgo(18),
          source: 'Upwork - Blog Setup',
          category: 'Freelance',
          amount: 350,
          notes: 'Setup Astro blog with MDX support for a client.',
        },
      }),
      db.incomeEntry.create({
        data: {
          date: daysAgo(32),
          source: 'Ad Revenue - Blog',
          category: 'Affiliate',
          amount: 125.5,
          notes: 'Monthly ad revenue from tech blog.',
        },
      }),
      db.incomeEntry.create({
        data: {
          date: daysAgo(45),
          source: 'Fiverr - React Component',
          category: 'Freelance',
          amount: 200,
          notes: 'Built a reusable data table component.',
        },
      }),
      db.incomeEntry.create({
        data: {
          date: daysAgo(52),
          source: 'Referral Bonus - Supabase',
          category: 'Affiliate',
          amount: 50,
          notes: 'Affiliate referral commission.',
        },
      }),
      db.incomeEntry.create({
        data: {
          date: daysAgo(60),
          source: 'Freelance - Portfolio Website',
          category: 'Freelance',
          amount: 800,
          notes: 'Designed and built portfolio site for a photographer.',
        },
      }),
      db.incomeEntry.create({
        data: {
          date: daysAgo(78),
          source: 'Ad Revenue - Blog',
          category: 'Affiliate',
          amount: 98.25,
          notes: 'Monthly blog revenue.',
        },
      }),
      db.incomeEntry.create({
        data: {
          date: daysAgo(90),
          source: 'Freelance - Landing Page',
          category: 'Freelance',
          amount: 450,
          notes: 'SaaS landing page with Tailwind and Next.js.',
        },
      }),
    ]);

    // ==========================================
    // 8. WEEKLY REVIEWS (6)
    // ==========================================
    const weeklyReviews = await Promise.all([
      db.weeklyReview.create({
        data: {
          weekStartDate: daysAgo(7),
          wins: 'Got interview at Vercel! Shipped Invoice Generator project. Passed AWS exam.',
          learnings: 'System design interviews need more practice. Vercels culture is very engineering-first.',
          challenges: 'Felt burnt out mid-week. Need to pace better.',
          nextGoals: 'Prepare for Vercel technical round. Submit 3 more job apps.',
        },
      }),
      db.weeklyReview.create({
        data: {
          weekStartDate: daysAgo(14),
          wins: 'Completed Meta Front-End cert. Built AI Resume Analyzer. Great networking call with Sarah.',
          learnings: 'Certifications alone dont get interviews — portfolio projects matter more.',
          challenges: 'Rejected by Notion. Need to handle rejection better mentally.',
          nextGoals: 'Apply to 5 more companies. Start Google UX Design cert.',
        },
      }),
      db.weeklyReview.create({
        data: {
          weekStartDate: daysAgo(21),
          wins: 'Launched AI Resume Analyzer on GitHub. Got 15 stars in first week!',
          learnings: 'Open source visibility is powerful for job search.',
          challenges: 'Struggled with RAG concepts in LangChain.',
          nextGoals: 'Deep dive into vector databases. Update resume with new projects.',
        },
      }),
      db.weeklyReview.create({
        data: {
          weekStartDate: daysAgo(28),
          wins: 'Freelance project paid $800. Networking connection led to a referral.',
          learnings: 'Warm referrals beat cold applications 10x. Always follow up.',
          challenges: 'Procrastination on the e-commerce template project.',
          nextGoals: 'Ship at least one project this week. Reach out to 5 new people.',
        },
      }),
      db.weeklyReview.create({
        data: {
          weekStartDate: daysAgo(42),
          wins: 'Started the gap year strong. Set up all tracking systems. Completed first week of structured learning.',
          learnings: 'Having a system matters more than motivation. Build habits, not plans.',
          challenges: 'Overwhelmed by how much there is to learn. Need to focus.',
          nextGoals: 'Pick top 3 learning priorities. Create first portfolio piece.',
        },
      }),
      db.weeklyReview.create({
        data: {
          weekStartDate: daysAgo(56),
          wins: 'Got AWS Cloud Practitioner cert. First freelance client landed.',
          learnings: 'Freelance income builds confidence faster than applying to jobs.',
          challenges: 'Time management between learning and earning.',
          nextGoals: 'Set up proper invoicing. Start Meta certification track.',
        },
      }),
    ]);

    // ==========================================
    // 9. JOURNAL ENTRIES (14)
    // ==========================================
    const journalEntries = await Promise.all([
      db.journalEntry.create({
        data: {
          date: daysAgo(0),
          reflection: 'Feeling really good about the Vercel interview prep. Spent 3 hours on system design and it finally clicked. The gap year is paying off — I can feel my skills compounding. Tomorrow I need to focus on the Stripe assessment and knock it out.',
          mood: 'Great',
          energyLevel: 9,
        },
      }),
      db.journalEntry.create({
        data: {
          date: daysAgo(1),
          reflection: 'Good day overall. Got the first milestone payment from Chris — $1,500! Feels surreal to earn money from skills I taught myself. Spent the afternoon pair-programming with Alex on a side project. Need to be careful about scope creep on freelance work.',
          mood: 'Good',
          energyLevel: 8,
        },
      }),
      db.journalEntry.create({
        data: {
          date: daysAgo(2),
          reflection: 'Hit a wall today with LangChain. The documentation is scattered and the API keeps changing. Watched a 2-hour tutorial that helped but still feel shaky. Reminded myself that confusion is part of the process. Need to build something real instead of just following tutorials.',
          mood: 'Neutral',
          energyLevel: 5,
        },
      }),
      db.journalEntry.create({
        data: {
          date: daysAgo(3),
          reflection: 'Productive morning — knocked out the Tailwind v4 course module. Afternoon was slower, spent too long on Twitter doom-scrolling. The comparison trap is real when I see other devs posting about their job offers. Need to stay in my own lane.',
          mood: 'Good',
          energyLevel: 7,
        },
      }),
      db.journalEntry.create({
        data: {
          date: daysAgo(5),
          reflection: 'Notion rejection stung. I really wanted that role. But Lisa (career coach) reminded me that every rejection is data. Spent the evening writing down what I could improve: system design, more open source contributions, and better storytelling in interviews.',
          mood: 'Bad',
          energyLevel: 4,
        },
      }),
      db.journalEntry.create({
        data: {
          date: daysAgo(7),
          reflection: 'Best week yet! Got the Vercel interview call, finished the Meta cert, and the Resume Analyzer got traction on GitHub. This is what momentum feels like. I need to protect this energy — sleep well, exercise, and keep the routines going.',
          mood: 'Great',
          energyLevel: 10,
        },
      }),
      db.journalEntry.create({
        data: {
          date: daysAgo(10),
          reflection: 'Slow day. Did some TypeScript exercises but nothing exciting. Sometimes I wonder if I should be going faster. But consistency over intensity, right? Reviewed my goals and Im actually ahead of schedule on certifications.',
          mood: 'Neutral',
          energyLevel: 6,
        },
      }),
      db.journalEntry.create({
        data: {
          date: daysAgo(14),
          reflection: 'Big milestone — shipped the AI Resume Analyzer! The code is clean, tests pass, and the UI looks great. Got positive feedback from Marcus at Stripe. He mentioned they might have an opening soon. Keeping my fingers crossed.',
          mood: 'Great',
          energyLevel: 9,
        },
      }),
      db.journalEntry.create({
        data: {
          date: daysAgo(18),
          reflection: 'Freelance project went well. Client was happy with the blog setup. Only $350 but the review was 5 stars. Building up my portfolio of happy clients. Need to raise my rates — Im definitely undercharging for my skill level now.',
          mood: 'Good',
          energyLevel: 7,
        },
      }),
      db.journalEntry.create({
        data: {
          date: daysAgo(21),
          reflection: 'Burnout creeping in. Woke up tired despite 8 hours of sleep. Skipped my morning routine. The gap year is a marathon, not a sprint. Need to take a proper rest day this weekend. No guilt about it.',
          mood: 'Bad',
          energyLevel: 3,
        },
      }),
      db.journalEntry.create({
        data: {
          date: daysAgo(28),
          reflection: 'Took the weekend off and it worked wonders. Came back Monday refreshed and shipped the Habit Tracker MVP. Sometimes the most productive thing you can do is rest. Lesson learned.',
          mood: 'Good',
          energyLevel: 8,
        },
      }),
      db.journalEntry.create({
        data: {
          date: daysAgo(35),
          reflection: 'Pivoted my learning strategy. Instead of trying to learn everything, Im focusing on being exceptional at Next.js + AI integration. Thats my niche. Talked to Sarah about this and she agreed — depth beats breadth when job hunting.',
          mood: 'Great',
          energyLevel: 8,
        },
      }),
      db.journalEntry.create({
        data: {
          date: daysAgo(49),
          reflection: 'First month of the gap year complete. Looking back, Ive accomplished more than I thought possible. 2 certifications, 2 published projects, started earning money, built a real network. The structured approach is working.',
          mood: 'Great',
          energyLevel: 9,
        },
      }),
      db.journalEntry.create({
        data: {
          date: daysAgo(60),
          reflection: 'Gap year kickoff! Finally taking the leap. Scary to leave the comfort zone but Im confident in the plan. Set up this tracking system to stay accountable. Lets make these 6 months count.',
          mood: 'Good',
          energyLevel: 8,
        },
      }),
    ]);

    // ==========================================
    // 10. DAILY PLAN FOR TODAY
    // ==========================================
    const today = todayStr();
    const todayDate = new Date(`${today}T00:00:00.000Z`);

    const dailyPlan = await db.dailyPlan.create({
      data: {
        date: todayDate,
        priority1: 'Complete Stripe assessment take-home challenge',
        priority2: 'Prepare for Vercel technical interview (system design)',
        priority3: 'Review and submit 3 job applications',
        notes: 'Block out 2 hours for the Stripe challenge — no interruptions. Have coffee with Alex at 3pm to discuss pair programming schedule.',
        reflection: '',
      },
    });

    // Timeblocks for today
    await Promise.all([
      db.dailyTimeBlock.create({
        data: { startTime: '06:00', endTime: '07:00', label: 'Morning Routine & Exercise', dayPlanId: dailyPlan.id },
      }),
      db.dailyTimeBlock.create({
        data: { startTime: '07:00', endTime: '07:30', label: 'Journal & Goal Review', dayPlanId: dailyPlan.id },
      }),
      db.dailyTimeBlock.create({
        data: { startTime: '07:30', endTime: '08:00', label: 'Breakfast & Planning', dayPlanId: dailyPlan.id },
      }),
      db.dailyTimeBlock.create({
        data: { startTime: '08:00', endTime: '10:00', label: 'Stripe Assessment Challenge', dayPlanId: dailyPlan.id },
      }),
      db.dailyTimeBlock.create({
        data: { startTime: '10:00', endTime: '10:15', label: 'Break', dayPlanId: dailyPlan.id },
      }),
      db.dailyTimeBlock.create({
        data: { startTime: '10:15', endTime: '12:00', label: 'Vercel Interview Prep - System Design', dayPlanId: dailyPlan.id },
      }),
      db.dailyTimeBlock.create({
        data: { startTime: '12:00', endTime: '13:00', label: 'Lunch Break', dayPlanId: dailyPlan.id },
      }),
      db.dailyTimeBlock.create({
        data: { startTime: '13:00', endTime: '14:30', label: 'Job Applications (3 target)', dayPlanId: dailyPlan.id },
      }),
      db.dailyTimeBlock.create({
        data: { startTime: '14:30', endTime: '15:00', label: 'Email & Messages', dayPlanId: dailyPlan.id },
      }),
      db.dailyTimeBlock.create({
        data: { startTime: '15:00', endTime: '16:00', label: 'Coffee with Alex - Pair Programming', dayPlanId: dailyPlan.id },
      }),
      db.dailyTimeBlock.create({
        data: { startTime: '16:00', endTime: '17:00', label: 'Learning: LangChain RAG', dayPlanId: dailyPlan.id },
      }),
      db.dailyTimeBlock.create({
        data: { startTime: '17:00', endTime: '17:30', label: 'Daily Review & Tomorrow Planning', dayPlanId: dailyPlan.id },
      }),
    ]);

    // Tasks for today
    await Promise.all([
      db.dailyTask.create({ data: { title: 'Review Stripe API documentation', completed: true, dayPlanId: dailyPlan.id } }),
      db.dailyTask.create({ data: { title: 'Complete Stripe assessment coding challenge', completed: false, dayPlanId: dailyPlan.id } }),
      db.dailyTask.create({ data: { title: 'Study rate limiting system design pattern', completed: false, dayPlanId: dailyPlan.id } }),
      db.dailyTask.create({ data: { title: 'Draft email to hiring manager at Linear', completed: false, dayPlanId: dailyPlan.id } }),
      db.dailyTask.create({ data: { title: 'Apply to GitLab Full Stack position', completed: false, dayPlanId: dailyPlan.id } }),
      db.dailyTask.create({ data: { title: 'Apply to Clerk DevRel position', completed: false, dayPlanId: dailyPlan.id } }),
      db.dailyTask.create({ data: { title: 'Update portfolio website with Resume Analyzer project', completed: false, dayPlanId: dailyPlan.id } }),
      db.dailyTask.create({ data: { title: 'Send weekly progress update to career coach Lisa', completed: true, dayPlanId: dailyPlan.id } }),
      db.dailyTask.create({ data: { title: '30 min exercise', completed: true, dayPlanId: dailyPlan.id } }),
    ]);

    return NextResponse.json({
      success: true,
      counts: {
        goals: goals.length,
        learningCategories: 4,
        learningItems: learningItems.length,
        certifications: certifications.length,
        projects: projects.length,
        jobApplications: jobApplications.length,
        connections: connections.length,
        incomeEntries: incomeEntries.length,
        weeklyReviews: weeklyReviews.length,
        journalEntries: journalEntries.length,
        dailyPlan: 1,
        timeBlocks: 12,
        tasks: 9,
      },
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { error: 'Failed to seed database', details: String(error) },
      { status: 500 }
    );
  }
}

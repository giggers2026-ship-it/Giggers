import type {
  Job, Application, Work, ChatThread, ChatMessage,
  Transaction, WalletData, Notification, Review,
  UserProfile, JobCategory
} from '../types';

// ============================================================
// JOB CATEGORIES — Only 2 supported categories
// ============================================================
export const CATEGORIES: JobCategory[] = [
  { id: 'catering',  name: 'Catering',          emoji: '👨‍🍳', icon: 'ChefHat',  color: '#f59e0b', bgColor: '#fef3c7' },
  { id: 'pamphlets', name: 'Pamphlet Dist.',     emoji: '📄', icon: 'FileText', color: '#0A4A3C', bgColor: '#d1fae5' },
];

// ============================================================
// MOCK USERS
// ============================================================
export const MOCK_USERS: UserProfile[] = [
  {
    id: 'u1', name: 'Amit Sharma', email: 'amit@example.com', phone: '+91 98765 43210',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amit',
    isVerified: true, aadhaarVerified: true, selfieVerified: true, city: 'Mumbai', area: 'Andheri West', createdAt: '2024-01-15',
    age: 26, gender: 'male', languages: ['Hindi', 'English', 'Marathi'],
    categories: ['Catering'],
    completedJobs: 47, rating: 4.8, totalEarnings: 38500,
    attendanceRate: 97, bio: 'Experienced catering staff with 3+ years in hospitality.',
    skills: ['Food Serving', 'Table Setup', 'Crowd Management'], reviewCount: 34,
    totalJobsPosted: 0,
  },
  {
    id: 'u2', name: 'Vikram Mehta', email: 'vikram@catering.co', phone: '+91 99887 76655',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=VM',
    isVerified: true, aadhaarVerified: true, selfieVerified: true, city: 'Mumbai', area: 'BKC', createdAt: '2023-08-01',
    companyName: 'Royal Catering Co.', totalJobsPosted: 42, rating: 4.8,
    reviewCount: 36, isVerifiedEmployer: true, completedJobs: 0, totalEarnings: 0, attendanceRate: 100,
  },
  {
    id: 'u3', name: 'Priya Patel', email: 'priya@example.com', phone: '+91 87654 32109',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    isVerified: true, aadhaarVerified: true, selfieVerified: true, city: 'Mumbai', area: 'Bandra East', createdAt: '2024-02-20',
    age: 23, gender: 'female', languages: ['Hindi', 'Gujarati', 'English'],
    categories: ['Pamphlet Dist.'],
    completedJobs: 29, rating: 4.9, totalEarnings: 21300,
    attendanceRate: 100, bio: 'Experienced pamphlet distributor covering all of Mumbai.',
    skills: ['Route Planning', 'Area Coverage', 'Time Management'], reviewCount: 22,
    totalJobsPosted: 0,
  },
];

// ============================================================
// MOCK JOBS — Only Catering and Pamphlet Dist. jobs
// ============================================================
export const MOCK_JOBS: Job[] = [
  {
    id: 'j1', title: 'Buffet Servers for Corporate Event',
    category: 'Catering', categoryEmoji: '👨‍🍳',
    description: 'We need experienced buffet servers for a large corporate event at BKC. Uniform will be provided. Experience in high-end catering preferred. Duties include food service, table setup, and clearing.',
    date: '2026-06-20', reportingTime: '09:00 AM', endTime: '06:00 PM',
    location: 'BKC, Mumbai', address: 'Bandra Kurla Complex, Mumbai 400051',
    lat: 19.0653, lng: 72.8677,
    workersNeeded: 10, workersHired: 3, payPerWorker: 800,
    foodProvided: true, transportProvided: false,
    dressCode: 'White shirt, black trousers', languagesRequired: ['Hindi', 'English'],
    genderPreference: 'any', status: 'active', employerId: 'u2',
    employerName: 'Royal Catering Co.', employerRating: 4.8,
    isVerifiedEmployer: true, isFeatured: true, isUrgent: true,
    createdAt: '2026-06-15T06:00:00Z', applicantsCount: 18, distance: 2.4,
  },
  {
    id: 'j2', title: 'Wedding Catering Waitstaff',
    category: 'Catering', categoryEmoji: '👨‍🍳',
    description: 'Professional waitstaff needed for a large wedding reception in Juhu. Smart appearance mandatory. Duties include guest service, food plating, and venue setup.',
    date: '2026-06-22', reportingTime: '04:00 PM', endTime: '11:00 PM',
    location: 'Juhu, Mumbai', address: 'Juhu Beach Road, Mumbai 400049',
    lat: 19.0990, lng: 72.8265,
    workersNeeded: 15, workersHired: 6, payPerWorker: 900,
    foodProvided: true, transportProvided: false,
    dressCode: 'Formal (White shirt, Black trousers)', languagesRequired: ['Hindi', 'English'],
    genderPreference: 'any', status: 'active', employerId: 'e2',
    employerName: 'Sparkle Events', employerRating: 4.6,
    isVerifiedEmployer: true, isFeatured: true, isUrgent: false,
    createdAt: '2026-06-15T07:00:00Z', applicantsCount: 24, distance: 5.1,
  },
  {
    id: 'j3', title: 'Pamphlet Distributors – Andheri',
    category: 'Pamphlet Dist.', categoryEmoji: '📄',
    description: 'Distribute promotional flyers for a new restaurant opening near Andheri Station. You will cover assigned areas around the station. Route map will be provided at reporting.',
    date: '2026-06-19', reportingTime: '10:00 AM', endTime: '02:00 PM',
    location: 'Andheri East, Mumbai', address: 'Near Andheri Railway Station',
    lat: 19.1136, lng: 72.8697,
    workersNeeded: 8, workersHired: 2, payPerWorker: 350,
    foodProvided: false, transportProvided: false,
    dressCode: 'Casual', languagesRequired: ['Hindi', 'Marathi'],
    genderPreference: 'any', status: 'active', employerId: 'e2',
    employerName: 'Sparkle Events', employerRating: 4.6,
    isVerifiedEmployer: true, isFeatured: false, isUrgent: true,
    createdAt: '2026-06-15T08:00:00Z', applicantsCount: 12, distance: 1.2,
  },
  {
    id: 'j4', title: 'Flyer Distribution – Mall Area',
    category: 'Pamphlet Dist.', categoryEmoji: '📄',
    description: 'We need 6 people to distribute flyers around Phoenix Marketcity Mall. Flyers promoting a new gym membership offer. Each person will get 500 flyers and cover one entry gate.',
    date: '2026-06-21', reportingTime: '11:00 AM', endTime: '03:00 PM',
    location: 'Kurla, Mumbai', address: 'Phoenix Marketcity, Kurla West',
    lat: 19.0883, lng: 72.8874,
    workersNeeded: 6, workersHired: 0, payPerWorker: 400,
    foodProvided: false, transportProvided: false,
    dressCode: 'Casual (Brand T-shirt provided)', languagesRequired: ['Hindi', 'English', 'Marathi'],
    genderPreference: 'any', status: 'active', employerId: 'u2',
    employerName: 'Royal Catering Co.', employerRating: 4.8,
    isVerifiedEmployer: true, isFeatured: false, isUrgent: false,
    createdAt: '2026-06-15T09:00:00Z', applicantsCount: 7, distance: 3.8,
  },
];

// ============================================================
// MOCK APPLICATIONS
// ============================================================
export const MOCK_APPLICATIONS: Application[] = [
  {
    id: 'a1', jobId: 'j1', job: MOCK_JOBS[0], workerId: 'u1',
    workerName: 'Amit Sharma', workerRating: 4.8,
    status: 'accepted', appliedAt: '2026-06-15T08:30:00Z', updatedAt: '2026-06-15T10:00:00Z',
  },
  {
    id: 'a2', jobId: 'j2', job: MOCK_JOBS[1], workerId: 'u1',
    workerName: 'Amit Sharma', workerRating: 4.8,
    status: 'applied', appliedAt: '2026-06-15T09:00:00Z', updatedAt: '2026-06-15T09:00:00Z',
  },
  {
    id: 'a3', jobId: 'j3', job: MOCK_JOBS[2], workerId: 'u1',
    workerName: 'Amit Sharma', workerRating: 4.8,
    status: 'shortlisted', appliedAt: '2026-06-14T14:00:00Z', updatedAt: '2026-06-15T08:00:00Z',
  },
];

// ============================================================
// MOCK JOB CANDIDATES (For Employer View)
// ============================================================
export const MOCK_JOB_CANDIDATES: Application[] = [
  {
    id: 'c1', jobId: 'j1', job: MOCK_JOBS[0], workerId: 'u1',
    workerName: MOCK_USERS[0].name, workerRating: MOCK_USERS[0].rating, workerProfile: MOCK_USERS[0],
    workerAvatar: MOCK_USERS[0].avatar,
    status: 'applied', appliedAt: '2026-06-15T08:30:00Z', updatedAt: '2026-06-15T08:30:00Z',
  },
  {
    id: 'c2', jobId: 'j1', job: MOCK_JOBS[0], workerId: 'u3',
    workerName: MOCK_USERS[2].name, workerRating: MOCK_USERS[2].rating, workerProfile: MOCK_USERS[2],
    workerAvatar: MOCK_USERS[2].avatar,
    status: 'applied', appliedAt: '2026-06-15T09:15:00Z', updatedAt: '2026-06-15T09:15:00Z',
  },
  {
    id: 'c3', jobId: 'j1', job: MOCK_JOBS[0], workerId: 'u4',
    workerName: 'Ravi Kumar', workerRating: 4.5,
    workerProfile: {
      id: 'u4', name: 'Ravi Kumar', email: 'ravi@example.com', phone: '+91 76543 21098',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ravi',
      isVerified: true, aadhaarVerified: true, selfieVerified: true, city: 'Mumbai', area: 'Dadar', createdAt: '2024-03-10',
      age: 28, gender: 'male', languages: ['Hindi', 'English'],
      categories: ['Catering'], completedJobs: 15, rating: 4.5, totalEarnings: 12000,
      attendanceRate: 95, bio: 'Reliable catering worker with hotel experience.',
      skills: ['Food Serving', 'Setup', 'Cleaning'], reviewCount: 10, totalJobsPosted: 0,
    },
    workerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ravi',
    status: 'applied', appliedAt: '2026-06-15T09:45:00Z', updatedAt: '2026-06-15T09:45:00Z',
  }
];

// ============================================================
// MOCK WORKS
// ============================================================
export const MOCK_WORKS: Work[] = [
  {
    id: 'wk1', jobId: 'j1', job: MOCK_JOBS[0], workerId: 'w1', employerId: 'e1',
    startOtp: '4821', endOtp: '9037', otpVerified: true,
    status: 'upcoming', pay: 800,
  },
  {
    id: 'wk2', jobId: 'j3', job: MOCK_JOBS[2], workerId: 'w1', employerId: 'e2',
    startOtp: '5539', endOtp: '2218', otpVerified: false,
    status: 'completed', startTime: '2026-06-10T10:15:00Z', endTime: '2026-06-10T14:00:00Z', pay: 350,
    rating: 5, review: 'Very reliable and punctual worker!',
  },
];

// ============================================================
// MOCK CHAT THREADS
// ============================================================
export const MOCK_CHAT_THREADS: ChatThread[] = [
  {
    id: 'ct1', type: 'job-applied', jobId: 'j1', jobTitle: 'Buffet Servers for Corporate Event',
    participantId: 'e1', participantName: 'Vikram Mehta (Royal Catering)',
    participantRole: 'employer', lastMessage: 'Please confirm your attendance tomorrow.',
    lastMessageTime: '2026-06-15T11:30:00Z', unreadCount: 2, isOnline: true,
  },
  {
    id: 'ct2', type: 'job-applied', jobId: 'j2', jobTitle: 'Wedding Catering Waitstaff',
    participantId: 'e2', participantName: 'Deepa Joshi (Sparkle Events)',
    participantRole: 'employer', lastMessage: 'Your application looks great!',
    lastMessageTime: '2026-06-15T09:00:00Z', unreadCount: 0, isOnline: false,
  },
  {
    id: 'ct3', type: 'job-posted', jobId: 'j3', jobTitle: 'Pamphlet Distributors – Andheri',
    participantId: 'u3', participantName: 'Priya Patel',
    participantRole: 'worker', lastMessage: 'Hi, I have covered Andheri area before.',
    lastMessageTime: '2026-06-15T07:45:00Z', unreadCount: 1, isOnline: true,
  },
];

// ============================================================
// MOCK CHAT MESSAGES
// ============================================================
export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'cm1', threadId: 'ct1', senderId: 'e1',
    text: 'Hi Amit! Your profile looks great for this catering job.',
    type: 'text', sentAt: '2026-06-15T10:00:00Z', isRead: true,
  },
  {
    id: 'cm2', threadId: 'ct1', senderId: 'w1',
    text: 'Thank you! I have 3 years of experience in corporate catering.',
    type: 'text', sentAt: '2026-06-15T10:05:00Z', isRead: true,
  },
  {
    id: 'cm3', threadId: 'ct1', senderId: 'e1',
    text: 'Perfect. Report at BKC at 9AM sharp. White shirt and black trousers required.',
    type: 'text', sentAt: '2026-06-15T10:30:00Z', isRead: true,
  },
  {
    id: 'cm4', threadId: 'ct1', senderId: 'e1',
    text: 'Please confirm your attendance tomorrow.',
    type: 'text', sentAt: '2026-06-15T11:30:00Z', isRead: false,
  },
];

// ============================================================
// MOCK TRANSACTIONS
// ============================================================
export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', type: 'credit', amount: 800, description: 'Catering Job – Corporate Event BKC', date: '2026-06-10T20:15:00Z', status: 'success', category: 'earning' },
  { id: 't2', type: 'credit', amount: 900, description: 'Catering Job – Royal Hotel Wedding', date: '2026-06-08T18:00:00Z', status: 'success', category: 'earning' },
  { id: 't3', type: 'debit',  amount: 2000, description: 'Withdrawal to HDFC Bank', date: '2026-06-07T10:00:00Z', status: 'success', category: 'withdrawal' },
  { id: 't4', type: 'credit', amount: 350, description: 'Pamphlet Distribution – Andheri Area', date: '2026-06-05T14:00:00Z', status: 'success', category: 'earning' },
  { id: 't5', type: 'credit', amount: 400, description: 'Pamphlet Distribution – Mall Campaign', date: '2026-06-03T15:00:00Z', status: 'success', category: 'earning' },
  { id: 't6', type: 'debit',  amount: 1500, description: 'Withdrawal to Paytm Wallet', date: '2026-06-01T11:00:00Z', status: 'success', category: 'withdrawal' },
  { id: 't7', type: 'credit', amount: 850, description: 'Catering Job – Banquet Hall Goregaon', date: '2026-05-28T16:00:00Z', status: 'success', category: 'earning' },
];

export const MOCK_WALLET_WORKER: WalletData = {
  currentBalance: 5850,
  pendingBalance: 800,
  totalEarnings: 52400,
  totalWithdrawn: 46550,
  transactions: MOCK_TRANSACTIONS,
};

export const MOCK_WALLET_EMPLOYER: WalletData = {
  currentBalance: 25000,
  pendingBalance: 9500,
  totalEarnings: 0,
  totalWithdrawn: 0,
  transactions: [
    { id: 'et1', type: 'debit',  amount: 8800, description: 'Job Payment – Buffet Servers (10 workers × ₹800)', date: '2026-06-15T06:00:00Z', status: 'pending', category: 'earning' },
    { id: 'et2', type: 'credit', amount: 50000, description: 'Wallet Top-up via UPI', date: '2026-06-14T09:00:00Z', status: 'success', category: 'topup' },
    { id: 'et3', type: 'debit',  amount: 3850, description: 'Job Payment – Pamphlet Dist. (11 workers × ₹350)', date: '2026-06-10T14:15:00Z', status: 'success', category: 'earning' },
  ],
};

// ============================================================
// MOCK NOTIFICATIONS
// ============================================================
export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'application_accepted', title: 'Application Accepted! 🎉', message: 'Royal Catering Co. accepted your application for Buffet Servers job.', isRead: false, createdAt: '2026-06-15T10:00:00Z', actionId: 'j1' },
  { id: 'n2', type: 'new_message', title: 'New Message', message: 'Vikram Mehta: Please confirm your attendance tomorrow.', isRead: false, createdAt: '2026-06-15T11:30:00Z', actionId: 'ct1' },
  { id: 'n3', type: 'job_applied', title: 'Application Sent', message: 'Your application for Wedding Catering Waitstaff has been submitted.', isRead: true, createdAt: '2026-06-15T09:00:00Z', actionId: 'j2' },
  { id: 'n4', type: 'payment_released', title: 'Payment Released 💰', message: '₹800 has been added to your wallet for completing the Catering job.', isRead: true, createdAt: '2026-06-10T20:15:00Z', actionId: 't1' },
  { id: 'n5', type: 'job_applied', title: 'Application Shortlisted', message: 'You have been shortlisted for Pamphlet Distributors – Andheri.', isRead: true, createdAt: '2026-06-14T15:00:00Z', actionId: 'j3' },
  { id: 'n6', type: 'job_completed', title: 'Job Completed ✅', message: 'Your pamphlet distribution at Andheri has been marked complete.', isRead: true, createdAt: '2026-06-10T14:05:00Z', actionId: 'j3' },
];

// ============================================================
// MOCK REVIEWS
// ============================================================
export const MOCK_REVIEWS: Review[] = [
  { id: 'r1', reviewerId: 'e1', reviewerName: 'Royal Catering Co.', rating: 5, comment: 'Excellent catering worker! Very professional and punctual. Highly recommended.', jobTitle: 'Catering', createdAt: '2026-06-10T21:00:00Z' },
  { id: 'r2', reviewerId: 'e2', reviewerName: 'Sparkle Events', rating: 5, comment: 'Amit was fantastic at the wedding event. Polite and hardworking.', jobTitle: 'Catering', createdAt: '2026-06-03T20:00:00Z' },
  { id: 'r3', reviewerId: 'e1', reviewerName: 'Royal Catering Co.', rating: 4, comment: 'Good pamphlet coverage. Covered the full area as assigned.', jobTitle: 'Pamphlet Dist.', createdAt: '2026-05-28T17:00:00Z' },
];

// ============================================================
// MOCK API FUNCTIONS
// ============================================================
const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

export const mockApi = {
  async getJobs(filter?: Partial<{ category: string; search: string; employerId: string }>) {
    await delay(800);
    let jobs = [...MOCK_JOBS];
    if (filter?.category) jobs = jobs.filter(j => j.category === filter.category);
    if (filter?.search) jobs = jobs.filter(j => j.title.toLowerCase().includes(filter.search!.toLowerCase()));
    if (filter?.employerId) jobs = jobs.filter(j => j.employerId === filter.employerId);
    return jobs;
  },
  async getJob(id: string) {
    await delay(500);
    return MOCK_JOBS.find(j => j.id === id) ?? null;
  },
  async getUsers(filter?: Partial<{ category: string; availableToday: boolean }>) {
    await delay(700);
    let users = [...MOCK_USERS];
    if (filter?.category) users = users.filter(u => u.categories?.includes(filter.category!));
    return users;
  },
  async getApplications(workerId: string) {
    await delay(600);
    return MOCK_APPLICATIONS.filter(a => a.workerId === workerId);
  },
  async getJobCandidates(jobId: string) {
    await delay(600);
    return MOCK_JOB_CANDIDATES.map(c => ({ ...c, jobId }));
  },
  async applyToJob(jobId: string, workerId: string) {
    await delay(1000);
    return { success: true, applicationId: `a-${Date.now()}`, jobId, workerId };
  },
  async getChatThreads() {
    await delay(500);
    return MOCK_CHAT_THREADS;
  },
  async getChatMessages(threadId: string) {
    await delay(400);
    return MOCK_CHAT_MESSAGES.filter(m => m.threadId === threadId);
  },
  async getWallet() {
    await delay(600);
    return MOCK_WALLET_WORKER;
  },
  async getNotifications() {
    await delay(400);
    return MOCK_NOTIFICATIONS;
  },
  async getReviews(workerId: string) {
    await delay(400);
    return workerId ? MOCK_REVIEWS : [];
  },
  async postJob(data: Partial<Job>) {
    await delay(1200);
    return { success: true, jobId: `j-${Date.now()}`, ...data };
  },
  async sendOtp(phone: string) {
    await delay(1000);
    return { success: true, phone, otp: '4821' };
  },
  async verifyOtp(phone: string, otp: string) {
    await delay(800);
    return { success: otp === '4821', phone };
  },
};

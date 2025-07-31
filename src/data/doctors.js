export const doctors = [
  {
    id: 1,
    name: "Dr. Emily Rodriguez",
    specialty: "Cardiology",
    rating: 4.9,
    reviewCount: 124,
    experience: 15,
    education: "Harvard Medical School",
    about: "Dr. Rodriguez is a board-certified cardiologist with over 15 years of experience treating cardiovascular diseases. She specializes in preventive cardiology and heart disease management.",
    languages: ["English", "Spanish"],
    location: "Heart & Vascular Institute",
    address: "1234 Medical Center Drive, Suite 200",
    phone: "(555) 123-4567",
    avatar: "/api/placeholder/150/150",
    availability: [
      { day: "Monday", slots: ["9:00 AM", "10:30 AM", "2:00 PM", "3:30 PM"] },
      { day: "Wednesday", slots: ["9:00 AM", "11:00 AM", "1:00 PM"] },
      { day: "Friday", slots: ["10:00 AM", "2:00 PM", "4:00 PM"] }
    ],
    consultationFee: 250,
    nextAvailable: "2024-01-15",
    badges: ["Top Rated", "Heart Specialist"]
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    specialty: "Dermatology",
    rating: 4.8,
    reviewCount: 89,
    experience: 12,
    education: "Johns Hopkins University",
    about: "Specialized in medical and cosmetic dermatology with expertise in skin cancer prevention and treatment. Known for his gentle approach and cutting-edge treatment methods.",
    languages: ["English", "Mandarin"],
    location: "Skin Care Excellence Center",
    address: "567 Wellness Boulevard, Floor 3",
    phone: "(555) 234-5678",
    avatar: "/api/placeholder/150/150",
    availability: [
      { day: "Tuesday", slots: ["8:30 AM", "10:00 AM", "11:30 AM", "2:30 PM"] },
      { day: "Thursday", slots: ["9:00 AM", "1:00 PM", "3:00 PM"] },
      { day: "Saturday", slots: ["9:00 AM", "11:00 AM"] }
    ],
    consultationFee: 200,
    nextAvailable: "2024-01-12",
    badges: ["Skin Expert", "Certified"]
  },
  {
    id: 3,
    name: "Dr. Sarah Williams",
    specialty: "Pediatrics",
    rating: 4.9,
    reviewCount: 156,
    experience: 18,
    education: "Stanford Medical School",
    about: "Compassionate pediatrician dedicated to providing comprehensive care for children from infancy through adolescence. Specializes in developmental pediatrics and childhood vaccines.",
    languages: ["English", "French"],
    location: "Children's Health Center",
    address: "890 Kids Care Lane, Building A",
    phone: "(555) 345-6789",
    avatar: "/api/placeholder/150/150",
    availability: [
      { day: "Monday", slots: ["8:00 AM", "9:30 AM", "11:00 AM", "2:00 PM", "3:30 PM"] },
      { day: "Wednesday", slots: ["8:00 AM", "10:00 AM", "1:30 PM"] },
      { day: "Friday", slots: ["9:00 AM", "11:30 AM", "2:30 PM"] }
    ],
    consultationFee: 180,
    nextAvailable: "2024-01-10",
    badges: ["Child Specialist", "Top Rated", "Vaccine Expert"]
  },
  {
    id: 4,
    name: "Dr. James Thompson",
    specialty: "Orthopedics",
    rating: 4.7,
    reviewCount: 73,
    experience: 20,
    education: "Mayo Clinic College of Medicine",
    about: "Orthopedic surgeon specializing in sports medicine and joint replacement. Has performed over 2000 successful surgeries and works with professional athletes.",
    languages: ["English"],
    location: "Orthopedic Sports Center",
    address: "456 Athletic Way, Suite 150",
    phone: "(555) 456-7890",
    avatar: "/api/placeholder/150/150",
    availability: [
      { day: "Tuesday", slots: ["7:00 AM", "8:30 AM", "1:00 PM"] },
      { day: "Thursday", slots: ["7:30 AM", "9:00 AM", "2:00 PM"] },
      { day: "Saturday", slots: ["8:00 AM", "10:00 AM"] }
    ],
    consultationFee: 300,
    nextAvailable: "2024-01-18",
    badges: ["Sports Medicine", "Surgery Expert"]
  },
  {
    id: 5,
    name: "Dr. Lisa Park",
    specialty: "Psychiatry",
    rating: 4.8,
    reviewCount: 91,
    experience: 14,
    education: "University of California, San Francisco",
    about: "Board-certified psychiatrist specializing in anxiety disorders, depression, and cognitive behavioral therapy. Committed to providing compassionate mental health care.",
    languages: ["English", "Korean"],
    location: "Mental Wellness Institute",
    address: "321 Serenity Drive, Suite 400",
    phone: "(555) 567-8901",
    avatar: "/api/placeholder/150/150",
    availability: [
      { day: "Monday", slots: ["10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM"] },
      { day: "Wednesday", slots: ["9:00 AM", "11:00 AM", "3:00 PM"] },
      { day: "Friday", slots: ["10:00 AM", "1:00 PM", "3:00 PM"] }
    ],
    consultationFee: 220,
    nextAvailable: "2024-01-14",
    badges: ["Mental Health", "Therapy Expert"]
  },
  {
    id: 6,
    name: "Dr. Robert Davis",
    specialty: "Neurology",
    rating: 4.9,
    reviewCount: 67,
    experience: 22,
    education: "Yale School of Medicine",
    about: "Leading neurologist with expertise in treating migraines, epilepsy, and neurodegenerative diseases. Published researcher with 50+ peer-reviewed papers.",
    languages: ["English", "German"],
    location: "Neurological Institute",
    address: "789 Brain Health Center, Floor 5",
    phone: "(555) 678-9012",
    avatar: "/api/placeholder/150/150",
    availability: [
      { day: "Tuesday", slots: ["9:00 AM", "11:00 AM", "2:30 PM"] },
      { day: "Thursday", slots: ["8:30 AM", "10:30 AM", "1:30 PM"] },
      { day: "Friday", slots: ["9:00 AM", "11:30 AM"] }
    ],
    consultationFee: 350,
    nextAvailable: "2024-01-20",
    badges: ["Research Expert", "Top Neurologist"]
  },
  {
    id: 7,
    name: "Dr. Amanda Foster",
    specialty: "Gynecology",
    rating: 4.8,
    reviewCount: 102,
    experience: 16,
    education: "University of Pennsylvania",
    about: "Experienced gynecologist providing comprehensive women's health services including preventive care, family planning, and minimally invasive procedures.",
    languages: ["English", "Portuguese"],
    location: "Women's Health Clinic",
    address: "135 Women's Way, Suite 200",
    phone: "(555) 789-0123",
    avatar: "/api/placeholder/150/150",
    availability: [
      { day: "Monday", slots: ["8:00 AM", "10:00 AM", "1:00 PM", "3:00 PM"] },
      { day: "Wednesday", slots: ["9:00 AM", "11:30 AM", "2:30 PM"] },
      { day: "Friday", slots: ["8:30 AM", "12:00 PM", "2:00 PM"] }
    ],
    consultationFee: 190,
    nextAvailable: "2024-01-13",
    badges: ["Women's Health", "Preventive Care"]
  },
  {
    id: 8,
    name: "Dr. Kevin Lee",
    specialty: "Internal Medicine",
    rating: 4.7,
    reviewCount: 118,
    experience: 19,
    education: "Duke University School of Medicine",
    about: "Primary care physician focused on preventive medicine and managing chronic conditions. Known for his thorough approach and patient education.",
    languages: ["English", "Japanese"],
    location: "Primary Care Associates",
    address: "246 Health Street, Ground Floor",
    phone: "(555) 890-1234",
    avatar: "/api/placeholder/150/150",
    availability: [
      { day: "Monday", slots: ["7:30 AM", "9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"] },
      { day: "Tuesday", slots: ["8:00 AM", "10:30 AM", "1:30 PM"] },
      { day: "Thursday", slots: ["7:30 AM", "9:30 AM", "2:30 PM"] },
      { day: "Friday", slots: ["8:00 AM", "10:00 AM", "1:00 PM"] }
    ],
    consultationFee: 160,
    nextAvailable: "2024-01-11",
    badges: ["Primary Care", "Chronic Disease"]
  }
];

export const specialties = [
  "All Specialties",
  "Cardiology",
  "Dermatology", 
  "Pediatrics",
  "Orthopedics",
  "Psychiatry",
  "Neurology",
  "Gynecology",
  "Internal Medicine",
  "Ophthalmology",
  "ENT (Ear, Nose, Throat)",
  "Endocrinology"
];

export const appointments = [
  {
    id: 1,
    doctorId: 1,
    doctorName: "Dr. Emily Rodriguez",
    specialty: "Cardiology",
    date: "2024-01-15",
    time: "10:30 AM",
    type: "Follow-up",
    status: "confirmed",
    location: "Heart & Vascular Institute",
    notes: "Annual heart check-up",
    duration: 30
  },
  {
    id: 2,
    doctorId: 3,
    doctorName: "Dr. Sarah Williams", 
    specialty: "Pediatrics",
    date: "2024-01-18",
    time: "2:00 PM",
    type: "Vaccination",
    status: "confirmed",
    location: "Children's Health Center",
    notes: "Annual flu shot",
    duration: 15
  },
  {
    id: 3,
    doctorId: 8,
    doctorName: "Dr. Kevin Lee",
    specialty: "Internal Medicine",
    date: "2024-01-22",
    time: "9:00 AM", 
    type: "Annual Physical",
    status: "pending",
    location: "Primary Care Associates",
    notes: "Complete physical examination",
    duration: 45
  }
];

export const healthMetrics = {
  vitals: {
    bloodPressure: { systolic: 120, diastolic: 80, date: "2024-01-08" },
    heartRate: { value: 72, date: "2024-01-08" },
    temperature: { value: 98.6, date: "2024-01-08" },
    weight: { value: 165, date: "2024-01-07" },
    height: { value: "5'8\"", date: "2023-12-01" }
  },
  labResults: [
    { test: "Cholesterol", value: 185, unit: "mg/dL", range: "< 200", status: "normal", date: "2024-01-05" },
    { test: "Blood Sugar", value: 95, unit: "mg/dL", range: "70-100", status: "normal", date: "2024-01-05" },
    { test: "Hemoglobin A1C", value: 5.2, unit: "%", range: "< 5.7", status: "normal", date: "2024-01-05" }
  ]
}; 
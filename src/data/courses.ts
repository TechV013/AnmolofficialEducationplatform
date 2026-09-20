import { Course } from "@/types/lms";

export const courses: Course[] = [
  {
    id: "1",
    title: "Fundamentals of 3D Modeling in Autodesk Maya",
    description: "Master the fundamentals of 3D modeling, from basic shapes to complex character modeling, using industry-standard tools in Autodesk Maya.",
    category: "3D & Animation",
    level: "Beginner",
    duration: "1 hr 30 min",
    durationMinutes: 90,
    totalLessons: 6,
    rating: 4.8,
    reviewsCount: 482,
    students: 1240,
    price: 1999,
    priceOld: 2999,
    status: "PUBLISHED",
    isFree: false,
    thumbnail: "/images/course1.jpg",
    instructorId: "1",
    instructorName: "Dr. Rajesh Sharma",
    whatYouWillLearn: [
      "Navigate Autodesk Maya's interface and core tools",
      "Model hard-surface and organic objects from scratch",
      "Apply extrude, bevel, and boolean workflows",
      "Set up lights and render a final scene"
    ],
    requirements: [
      "Autodesk Maya (any 2020+ version)",
      "A computer with at least 8GB RAM",
      "No prior 3D experience needed"
    ],
    modules: [
      {
        id: "m1",
        title: "Introduction to 3D Modeling",
        position: 0,
        lessons: [
          { id: "1.1", title: "Getting Started with Maya", position: 0, description: "Learn the Maya interface and navigation.", duration: "15 min", type: "video", videoUrl: "", resources: [{ id: "r1", title: "Maya Shortcuts.pdf", type: "pdf", url: "#" }] },
          { id: "1.2", title: "Understanding Polygons", position: 1, description: "Learn how polygons form the basis of 3D models.", duration: "20 min", type: "video", videoUrl: "", resources: [] },
          { id: "1.3", title: "Practice Exercise", position: 2, description: "Create your first 3D shape.", duration: "", type: "assignment", resources: [] },
        ],
      },
      {
        id: "m2",
        title: "Modeling Techniques",
        position: 1,
        lessons: [
          { id: "1.4", title: "Extrusion and Beveling", position: 0, description: "Learn extrusion and bevel techniques.", duration: "25 min", type: "video", videoUrl: "", resources: [] },
          { id: "1.5", title: "Hard Surface Modeling", position: 1, description: "Create hard surface objects.", duration: "30 min", type: "video", videoUrl: "", resources: [] },
        ],
      },
      {
        id: "m3",
        title: "Final Project",
        position: 2,
        lessons: [
          { id: "1.6", title: "Build Your Model", position: 0, description: "Complete your final project.", duration: "", type: "assignment", resources: [] },
        ],
      },
    ],
  },
  {
    id: "2",
    title: "Rigging Mastery in Autodesk Maya",
    description: "Advanced rigging techniques for character animation, including skeletal systems, IK/FK switches, and muscle simulations.",
    category: "Rigging",
    level: "Intermediate",
    duration: "1 hr 15 min",
    durationMinutes: 75,
    totalLessons: 5,
    rating: 4.9,
    reviewsCount: 310,
    students: 890,
    price: 1999,
    priceOld: 2999,
    status: "PUBLISHED",
    isFree: false,
    thumbnail: "/images/course2.jpg",
    instructorId: "1",
    instructorName: "Dr. Rajesh Sharma",
    whatYouWillLearn: [
      "Build clean bone hierarchies for characters",
      "Switch between IK and FK rigs with confidence",
      "Paint weights for smooth, natural deformation",
      "Troubleshoot and fix common rigging issues"
    ],
    requirements: [
      "Completed a basic 3D modeling course",
      "Working knowledge of Autodesk Maya",
      "Autodesk Maya (any 2020+ version)"
    ],
    modules: [
      { id: "m4", title: "Skeleton Setup", position: 0, lessons: [
        { id: "2.1", title: "Bone Hierarchy", position: 0, description: "Understand bone hierarchy.", duration: "20 min", type: "video", videoUrl: "", resources: [] },
        { id: "2.2", title: "IK vs FK", position: 1, description: "Learn inverse and forward kinematics.", duration: "25 min", type: "video", videoUrl: "", resources: [] },
      ]},
      { id: "m5", title: "Advanced Rigging", position: 1, lessons: [
        { id: "2.3", title: "Muscle Setup", position: 0, description: "Add muscles to your rig.", duration: "30 min", type: "video", videoUrl: "", resources: [] },
      ]},
    ],
  },
  {
    id: "3",
    title: "Video Editing with Premiere Pro",
    description: "Learn professional video editing from basic cuts to advanced color grading and motion graphics.",
    category: "Video Editing",
    level: "Beginner",
    duration: "1 hr",
    durationMinutes: 60,
    totalLessons: 5,
    rating: 4.7,
    reviewsCount: 620,
    students: 2100,
    price: 1999,
    priceOld: 2499,
    status: "PUBLISHED",
    isFree: false,
    thumbnail: "/images/course3.jpg",
    instructorId: "3",
    instructorName: "Prof. Arjun Nair",
    whatYouWillLearn: [
      "Edit and trim footage with professional precision",
      "Grade color like a professional editor",
      "Design motion graphics and animated titles",
      "Export optimized videos for any platform"
    ],
    requirements: [
      "Adobe Premiere Pro (any recent version)",
      "Basic computer skills"
    ],
    modules: [
      { id: "m6", title: "Editing Basics", position: 0, lessons: [
        { id: "3.1", title: "Interface Overview", position: 0, description: "Learn the Premiere Pro interface.", duration: "15 min", type: "video", videoUrl: "", resources: [] },
        { id: "3.2", title: "Cutting and Trimming", position: 1, description: "Master cutting and trimming clips.", duration: "20 min", type: "video", videoUrl: "", resources: [] },
      ]},
      { id: "m7", title: "Advanced Techniques", position: 1, lessons: [
        { id: "3.3", title: "Color Grading", position: 0, description: "Learn professional color grading.", duration: "25 min", type: "video", videoUrl: "", resources: [] },
      ]},
    ],
  },
];

export const instructors = [
  { id: "1", name: "Dr. Rajesh Sharma", role: "Professor of Computer Science", description: "Dr. Sharma has over 15 years of experience in academia and industry. He specializes in Artificial Intelligence, Machine Learning, and data-driven innovation.", photo: "/images/instructor/1.png" },
  { id: "2", name: "Dr. Priya Mehta", role: "Associate Professor", description: "Dr. Mehta is an expert in applied mathematics and data science. With a strong research background and a student-first approach, she simplifies complex concepts.", photo: "/images/instructor/2.png" },
  { id: "3", name: "Prof. Arjun Nair", role: "Assistant Professor", description: "Prof. Nair brings industry experience and academic excellence together. He teaches modern web technologies, cloud infrastructure, and system design.", photo: "/images/instructor/3.png" },
];

export const testimonials = [
  { name: "Rakesh Sharma", role: "3D Artist", rating: 5, quote: "The 3D modeling course changed how I approach my projects. I landed my first character modeling gig within two months of finishing it." },
  { name: "Neha Kumari Mishra", role: "VFX Artist", rating: 5, quote: "Clear, structured lessons with real industry context. The mentorship pushed me to build a demo reel that actually got me hired." },
  { name: "Pooja Kumari Mishra", role: "Motion Designer", rating: 5, quote: "I finally understand why certain techniques work. The founder's guidance on my portfolio made all the difference in interviews." },
  { name: "Shubam Kumar", role: "Video Editor", rating: 4, quote: "Practical editing projects from day one. I went from cutting home videos to editing commercial projects professionally." },
  { name: "Rahul Kumar Yadav", role: "Animator", rating: 5, quote: "Rigging used to feel overwhelming. Step-by-step lessons and timely feedback made it genuinely enjoyable to learn." },
  { name: "Kamal Kashyap", role: "Filmmaker", rating: 5, quote: "One conversation with the founder redirected my career. The course structure is built for real-world filmmaking, not just theory." },
];
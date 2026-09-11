import { Course } from "@/types/lms";

export const courses: Course[] = [
  {
    id: "1",
    title: "Fundamentals of 3D Modeling in Autodesk Maya",
    description: "Master the fundamentals of 3D modeling, from basic shapes to complex character modeling, using industry-standard tools in Autodesk Maya.",
    category: "3D & Animation",
    level: "Beginner",
    duration: "12 hrs",
    totalLessons: 6,
    rating: 4.8,
    students: 1240,
    price: 1999,
    isFree: false,
    thumbnail: "/images/course1.jpg",
    instructorId: "1",
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
    duration: "10 hrs",
    totalLessons: 5,
    rating: 4.9,
    students: 890,
    price: 1999,
    isFree: false,
    thumbnail: "/images/course2.jpg",
    instructorId: "1",
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
    duration: "8 hrs",
    totalLessons: 5,
    rating: 4.7,
    students: 2100,
    price: 1999,
    isFree: false,
    thumbnail: "/images/course3.jpg",
    instructorId: "3",
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
  { name: "Rakesh Sharma", role: "3D Artist", rating: 5 },
  { name: "Neha Kumari Mishra", role: "VFX Artist", rating: 5 },
  { name: "Pooja Kumari Mishra", role: "Motion Designer", rating: 5 },
  { name: "Shubam Kumar", role: "Video Editor", rating: 4 },
  { name: "Rahul Kumar Yadav", role: "Animator", rating: 5 },
  { name: "Kamal Kashyap", role: "Filmmaker", rating: 5 },
];

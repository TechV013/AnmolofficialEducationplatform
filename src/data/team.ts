export interface TeamMember {
  id: string;
  name: string;
  role: string;
  description: string;
  image: string;
}

export const team: TeamMember[] = [
  { id: "1", name: "Dr. Rajesh Sharma", role: "Animation Lead", description: "Specializes in character animation, rigging, and dynamic physics workflows.", image: "/images/instructor/instructor1.png" },
  { id: "2", name: "Dr. Priya Mehta", role: "3D Modeling Expert", description: "Expert in organic sculpture, hard-surface detailing, and asset topology.", image: "/images/instructor/instructor2.png" },
  { id: "3", name: "Prof. Arjun Nair", role: "VFX Specialist", description: "Brings years of visual effects, particles, and compositing experience.", image: "/images/instructor/instructor3.png" },
  { id: "4", name: "Shubham Kumar", role: "Video Editing Mentor", description: "Professional editor focused on commercial workflows and premiere design.", image: "/images/instructor/instructor4.png" },
  { id: "5", name: "Neha Mishra", role: "Character Rigging Pro", description: "Builds production-ready character skeletons and custom IK/FK controls.", image: "/images/instructor/instructor5.png" },
  { id: "6", name: "Kamal Kashyap", role: "Post-Production Lead", description: "Specializes in color science, Davinci grading, and mastering workflows.", image: "/images/instructor/instructor6.png" },
  { id: "7", name: "Ananya Sen", role: "UI/UX Specialist", description: "Teaches responsive digital product design, wireframing, and Figma prototyping.", image: "/images/instructor/instructor1.png" },
  { id: "8", name: "Aarav Kapoor", role: "Game Design Mentor", description: "Expert in Unreal Engine environment building, blueprint systems, and gameplay.", image: "/images/instructor/instructor2.png" },
  { id: "9", name: "Vikram Rathore", role: "Motion Graphics Expert", description: "Focuses on vector animation, kinetic typography, and After Effects workflows.", image: "/images/instructor/instructor3.png" },
  { id: "10", name: "Meera Joshi", role: "Texturing Specialist", description: "Creates procedural materials, substance painting, and PBR lighting setups.", image: "/images/instructor/instructor4.png" },
];

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  description: string;
  image: string;
}

export const team: TeamMember[] = [
  { id: "1", name: "Aditya Bangia", role: "Filmmaking", description: "Specialized in Filmmaking with 21 years of experience.", image: "/images/instructor/instructor-aditya-bangia.jpg" },
  { id: "2", name: "Anand Omanakuttan", role: "Filmmaking", description: "Specialized in Filmmaking with 23 years of experience.", image: "/images/instructor/instructor-anand-omanakuttan.jpeg" },
  { id: "3", name: "Anmol Deep", role: "Motion Design", description: "Specialized in Motion Design with 7 years of experience.", image: "/images/instructor/instructor-anmol-deep.jpeg" },
  { id: "4", name: "Yatindra Singh Yadav", role: "3D Animation", description: "Specialized in 3D Animation with 9 years of experience.", image: "/images/instructor/instructor-yatindra-singh-yadav.jpeg" },
  { id: "5", name: "Kostubh Vyas", role: "3D Animation", description: "Specialized in 3D Animation with 9 years of experience.", image: "/images/instructor/instructor-kostubh-vyas.jpeg" },
];

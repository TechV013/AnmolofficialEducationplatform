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
  { id: "6", name: "Bhaskar Mani Tiwari", role: "Visual Communication", description: "Specialized in Visual Communication with 7 years of experience.", image: "/images/instructor/instructor-bhaskar-mani-tiwari.jpeg" },
  { id: "7", name: "Roshni Mittal", role: "Concept Art", description: "Specialized in Concept Art with 23 years of experience.", image: "/images/instructor/instructor-roshni-mittal.jpeg" },
  { id: "8", name: "Laxyapal Singh Rathore", role: "Drawing & Painting", description: "Specialized in Drawing & Painting with 40+ years of experience.", image: "/images/instructor/instructor-laxypal-singh-rathore.jpeg" },
  { id: "9", name: "Divyansh Gupta", role: "3D Animation", description: "Specialized in 3D Animation with 6 years of experience.", image: "/images/instructor/instructor-divyansh-gupta.jpeg" },
];

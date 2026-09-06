export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  totalLessons: number;
  rating: number;
  students: number;
  price: number;
  isFree: boolean;
  thumbnail: string;
  instructorId?: string;
  modules: Module[];
}

export interface Instructor {
  id: string;
  name: string;
  role: string;
  description: string;
  photo: string;
}

export interface Resource {
  id: string;
  title: string;
  type: "pdf" | "link" | "file";
  url: string;
}

export interface Assignment {
  id: string;
  title: string;
  instructions: string;
  dueDate: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  duration: string;
  type: "video" | "assignment" | "resource";
  resources: Resource[];
  assignment?: Assignment;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Testimonial {
  name: string;
  role: string;
  rating: number;
}



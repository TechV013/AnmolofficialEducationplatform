
export interface EnrolledCourseDTO {
  courseId: string;
  title: string;
  thumbnail: string;
  instructorName: string | null;
  progressPercent: number;
  lastLessonId: string | null;
  lastLessonTitle: string | null;
}

export interface StudentDashboardDTO {
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  courses: EnrolledCourseDTO[];
  summary: {
    enrolledCourses: number;
  };
}

export interface Campus {
  id: string;
  text: string;
}

export interface Faculty {
  id: string;
  text: string;
}

export interface Course {
  code: string;
  url: string;
}

export interface TimetableRow {
  no: string;
  day: string;
  time: string;
  group: string;
  mode: string;
  status: string;
  room: string;
  program: string;
  faculty: string;
  course: string | null;
  subject?: string;
}

export interface SelectedCard {
  url: string;
  timetable: TimetableRow[];
  originalTimetable: TimetableRow[];
  group: string;
  courseLabel: string;
  color: string;
}

export interface StudentScheduleEntry {
  course_desc: string;
  courseid: string;
  groups: string;
  masa: string;
  bilik: string;
  lecturer: string | null;
}

export interface StudentDaySchedule {
  hari: string;
  jadual: StudentScheduleEntry[];
}

export type StudentSchedule = Record<string, StudentDaySchedule | null>;

export type EventApprovalStatus =
  | "PROPOSED"
  | "NEEDS_REVIEW"
  | "APPROVED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export interface IdeaCard {
  id: string;
  title: string;
  bigIdea: string;
  format: string;
  targetAudience: string;
  shotlist: string;
  equipment: string;
  timeline: string;
  feasibility: string;
  approvalStatus?: EventApprovalStatus;
  expectedOutcomes?: string[];
  departmentsInvolved?: string[];
  missingConfirmations?: string[];
  risks?: string[];
  kpiTarget?: string[];
  createdAt: string;
}

export interface RunSheetItem {
  time: string;
  activity: string;
  ownerDepartment: string;
  equipment: string;
  notes: string;
}

export interface RaciTask {
  id: string;
  taskName: string;
  deliverable: string;
  responsibleDept: "COMM" | "TECH" | "ALL";
  accountableRole: string;
  consultedDept?: string;
  informedDept?: string;
  deadlineLabel: string;
  priority: "High" | "Medium" | "Low";
  status: "todo" | "in_progress" | "done";
  completionCriteria: string;
}

export interface KpiMetricItem {
  category: "Learning" | "Engagement" | "Media" | "Operations";
  metric: string;
  target: string;
  estimate: string;
  actual: string | null;
}

export interface DirectorPlanCanvas {
  planId: string;
  planType: "event_canvas" | "monthly_plan";
  name: string;
  monthLabel?: string;
  concept: string;
  objective: string;
  audience: string;
  expectedOutcomes: string[];
  dateTimeStatus: string;
  venueStatus: string;
  capacityStatus: string;
  hostStatus: string;
  departments: string[];
  equipmentNeeds: string[];
  budgetStatus: string;
  runSheet: RunSheetItem[];
  raciTasks: RaciTask[];
  campaign: {
    preEvent: string[];
    duringEvent: string[];
    postEvent: string[];
  };
  risks: string[];
  kpis: KpiMetricItem[];
  missingConfirmations: string[];
  approvalStatus: EventApprovalStatus;
  approvedByRole?: string;
  approvedAt?: string;
  retrospectiveNotes?: string;
  lessonsLearned?: string[];
  exportedToCalendar?: boolean;
  promptVersion?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  type: "workshop" | "phototrip" | "facebook_post" | "tiktok_video" | "meeting";
  department: "COMM" | "TECH" | "ALL";
  description?: string;
  status: "scheduled" | "completed" | "in_review";
  createdAt: string;
}

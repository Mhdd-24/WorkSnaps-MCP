export interface WorksnapsUser {
  userId: string;
  login: string;
  firstName: string;
  lastName: string;
  email: string;
  timezoneId?: string;
  timezoneName?: string;
}

export interface WorksnapsProject {
  id: string;
  name: string;
  description?: string;
}

export interface WorksnapsTask {
  id: string;
  name: string;
  description?: string;
}

export interface OfflineTimeEntryRequest {
  projectId: number;
  taskId: number;
  minutes: number;
  comment?: string | null;
  date: string;
  startHour?: number;
}

export interface WorksnapsApiResult {
  status: number;
  body: string;
  url: string;
}

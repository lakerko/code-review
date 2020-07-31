import { FirebaseDate, EmployeeInfo } from '../shared/shared.model';

export interface Dontwant {
  technicalStuff?: string;
  dispatched?: boolean;
  dispatchedByTechnician?: boolean;
  note?: string;
  hsDispatchDate?: Date | FirebaseDate;
  hsDispatchDateTechnician?: Date | FirebaseDate;
  updatedAt?: Date | FirebaseDate;
  createdAt?: Date | FirebaseDate;
  type?: string;
  otherTechnicalStuff?: string;
  createdBy?: EmployeeInfo;
  assignedTo?: EmployeeInfo;
  migrated?: boolean;
  customerName?: string;
  customerPhone?: string;
  id?: string;
}

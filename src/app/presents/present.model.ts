import { Corresponding, EmployeeInfo, FirebaseDate } from '../shared/shared.model';

export interface technicalStuff {
  technicalStuff?: string;
  corresponding?: Corresponding;
  technicalStuffAnonym?: string;
  correspondingAnonym?: Corresponding;
  type?: string;
  typeAnonym?: string;
  otherTechnicalStuff?: string;
  otherTechnicalStuffAnonym?: string;
  createdBy?: EmployeeInfo;
  assignedTo?: EmployeeInfo;
  dateAdded?: Date | FirebaseDate;
  customerName?: string;
  customerPhone?: string;
  updatedAt?: Date | FirebaseDate;
  createdAt?: Date | FirebaseDate;
  assignedAt?: Date | FirebaseDate;
  status?: 'unfulfilled' | 'fulfilled';
  migrated?: boolean;
  tags?: string[];
  id?: string;
  isDefective?: boolean;
  anonymRef?: any;
  note?: string;
}

export interface EdittechnicalStuffData {
  technicalStuff?: technicalStuff;
  technicalStuffId?: string;
  correspondingtechnicalStuffTags?: string[];
  deleteCorrespondingRelationship?: string | null;
  lostFulfillment?: boolean;
}

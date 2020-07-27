import { Anonym } from '../anonyms/anonym.model';
import { Dontwant } from '../dontwants/dontwant.model';
import { technicalStuff } from '../presents/present.model';

export type EmployeeRole = 'god' | 'leader' | 'technician';

export interface User {
  uid: string;
  displayName: string;
  email: string;
  role: EmployeeRole;
  storeId: string;
  isTechnician?: boolean;
  login?: string;
}

export interface Employee {
  role?: string;
  email?: string;
  displayName?: string;
  uid?: string;
  id?: string;
}

export interface Corresponding {
  technicalStuff?: string;
  id?: string;
  type?: string;
  otherTechnicalStuff?: string;
}

export interface EmployeeInfo {
  uid: string;
  displayName: string;
}

export type CategoryQuery = 'opened' | 'inventory';

export interface ChangesObj {
  [key: string]: ChangesProperty;
}

export interface ChangesProperty {
  oldValue: any;
  newValue: any;
}

export interface History {
  changedValues: ChangesObj;
  changedProperties: string[];
  updatedBy: EmployeeInfo;
  updatedAt?: Date;
}

export interface FirebaseDate {
  seconds: number;
  nanoseconds: number;
}

export interface otherTechnicalStuffDefMap {
  [ key: string ]: otherTechnicalStuffDef;
}

export interface otherTechnicalStuffDef {
  otherTechnicalStuff: string;
  type: string;
  label: string;
  technicalStuffs: string[];
  id?: string;
}

export interface SelectOption {
  value: any;
  displayName: string;
}

import { WorkflowStep } from "./workflow";

// User and Authentication Types
export interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    role: UserRole;
    tenantId: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export enum UserRole {
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER',
    STAFF = 'STAFF',
    CLIENT = 'CLIENT'
  }
  
  // Tenant Types
  export interface Tenant {
    id: string;
    name: string;
    slug: string;
    plan: PlanType;
    settings: TenantSettings;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export enum PlanType {
    FREE = 'FREE',
    PRO = 'PRO',
    ENTERPRISE = 'ENTERPRISE'
  }
  
  export interface TenantSettings {
    branding: {
      logo?: string;
      primaryColor: string;
      companyName: string;
    };
    features: {
      workflows: boolean;
      automations: boolean;
      clientPortal: boolean;
      aiAssistant: boolean;
    };
  }
  
  // Workflow Types
  export interface Workflow {
    id: string;
    name: string;
    description?: string;
    tenantId: string;
    createdBy: string;
    isActive: boolean;
    steps: WorkflowStep[];
    createdAt: Date;
    updatedAt: Date;
  }
    
  export enum StepType {
    FORM = 'FORM',
    EMAIL = 'EMAIL',
    WEBHOOK = 'WEBHOOK',
    CONDITION = 'CONDITION',
    DELAY = 'DELAY',
    NOTIFICATION = 'NOTIFICATION'
  }
  
  export interface WorkflowCondition {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
    value: any;
  }
  
  // Client Types
  export interface Client {
    id: string;
    tenantId: string;
    name: string;
    email: string;
    phone?: string;
    status: ClientStatus;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export enum ClientStatus {
    LEAD = 'LEAD',
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    ARCHIVED = 'ARCHIVED'
  }
  
  // Document Types
  export interface Document {
    id: string;
    tenantId: string;
    name: string;
    type: DocumentType;
    url: string;
    size: number;
    mimeType: string;
    metadata: DocumentMetadata;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
  }
  
  export enum DocumentType {
    INVOICE = 'INVOICE',
    CONTRACT = 'CONTRACT',
    PROPOSAL = 'PROPOSAL',
    RECEIPT = 'RECEIPT',
    OTHER = 'OTHER'
  }
  
  export interface DocumentMetadata {
    extractedText?: string;
    summary?: string;
    entities?: Record<string, any>;
    aiTags?: string[];
  }
  
  // API Response Types
  export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
  }
  
  export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }
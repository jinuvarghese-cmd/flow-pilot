export const typeDefs = /* GraphQL */ `
  type Tenant {
    id: String!
    name: String!
    slug: String!
    plan: PlanType!
    settings: JSON!
    createdAt: String!
    updatedAt: String!
    users: [User!]!
    workflows: [Workflow!]!
    clients: [Client!]!
    documents: [Document!]!
  }

  type User {
    id: String!
    email: String!
    name: String!
    avatar: String
    role: UserRole!
    tenantId: String!
    createdAt: String!
    updatedAt: String!
  }

  type Workflow {
    id: String!
    name: String!
    description: String
    tenantId: String!
    createdBy: String!
    isActive: Boolean!
    steps: JSON!
    createdAt: String!
    updatedAt: String!
  }

  type Client {
    id: String!
    tenantId: String!
    name: String!
    email: String!
    phone: String
    status: ClientStatus!
    metadata: JSON!
    createdAt: String!
    updatedAt: String!
  }

  type Document {
    id: String!
    tenantId: String!
    name: String!
    type: DocumentType!
    url: String!
    size: Int!
    mimeType: String!
    metadata: JSON!
    tags: [String!]!
    createdAt: String!
    updatedAt: String!
  }

  enum UserRole {
    ADMIN
    MANAGER
    STAFF
    CLIENT
  }

  enum PlanType {
    FREE
    PRO
    ENTERPRISE
  }

  enum ClientStatus {
    LEAD
    ACTIVE
    INACTIVE
    ARCHIVED
  }

  enum DocumentType {
    INVOICE
    CONTRACT
    PROPOSAL
    RECEIPT
    OTHER
  }

  scalar JSON

  type Query {
    tenants: [Tenant!]!
    tenant(id: String!): Tenant
    users: [User!]!
    user(id: String!): User
    workflows: [Workflow!]!
    workflow(id: String!): Workflow
    clients: [Client!]!
    client(id: String!): Client
    documents: [Document!]!
    document(id: String!): Document
  }

  type Mutation {
    createTenant(input: CreateTenantInput!): Tenant!
    createUser(input: CreateUserInput!): User!
    createWorkflow(input: CreateWorkflowInput!): Workflow!
    createClient(input: CreateClientInput!): Client!
  }

  input CreateTenantInput {
    name: String!
    slug: String!
    plan: PlanType = FREE
    settings: JSON!
  }

  input CreateUserInput {
    email: String!
    name: String!
    avatar: String
    role: UserRole = STAFF
    tenantId: String!
  }

  input CreateWorkflowInput {
    name: String!
    description: String
    tenantId: String!
    createdBy: String!
    isActive: Boolean = true
    steps: JSON!
  }

  input CreateClientInput {
    tenantId: String!
    name: String!
    email: String!
    phone: String
    status: ClientStatus = LEAD
    metadata: JSON
  }
`
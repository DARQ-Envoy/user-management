# User Management Module

A self-contained Angular 18 module for managing system users. Built as a portable feature module — the `users/` folder can be lifted out of this project and dropped into any Angular host application with minimal integration work.

---

## Overview

The module provides a full CRUD interface for system users: view, add, edit, and delete. It is built against a mock data layer during development. The host application replaces the mock with its real service implementation at the `InjectionToken` boundary — no changes to the module itself are required.

---

## Architecture

### Folder structure

```
src/app/
├── users/                          ← deliverable module
│   ├── interfaces/
│   │   └── server-comm.interface.ts
│   ├── models/
│   │   ├── user.model.ts
│   │   └── response.model.ts
│   ├── services/
│   │   └── user-data.service.ts
│   ├── tokens/
│   │   └── server-comm.token.ts
│   ├── validators/
│   │   ├── email.validator.ts
│   │   └── unique-email.validator.ts
│   └── users.component.ts
├── app.component.ts                ← host shell (sidebar, page heading)
└── app.config.ts                   ← token registration (dev only)
```

### Integration point

The module communicates with the outside world through a single `InjectionToken`:

```typescript
export const SERVER_COMM_TOKEN = new InjectionToken<ServerComm>('SERVER_COMM_TOKEN');
```

The host application provides its own implementation by overriding this token:

```typescript
// host app's app.config.ts
{ provide: SERVER_COMM_TOKEN, useClass: HostRealService }
```

The `UsersComponent` never references a concrete service — it only knows about the token.

---

## ServerComm Interface

```typescript
export interface ServerComm {
  LoadData<TRes extends BaseResponse>(): Promise<TRes>;
  AddUser(user: Omit<User, 'id'>): Promise<UserResponse>;
  EditUser(user: User): Promise<UserResponse>;
  DeleteUser(id: number): Promise<UserResponse>;
}
```

`LoadData` follows the original generic spec — constrained to `BaseResponse` subtypes so the same interface pattern can serve other modules in the host application. `AddUser`, `EditUser`, and `DeleteUser` are user-module specific and each return a `Promise<UserResponse>` containing the full updated user list. The component resets its local state from this return value on every operation — no local array mutations.

`AddUser` accepts `Omit<User, 'id'>` because ID assignment is the server's responsibility. The caller never provides one.

---

## Data Models

```typescript
export class User {
  constructor(
    public id: number,
    public name: string,
    public email: string
  ) {}
}

export class BaseResponse {}

export class UserResponse extends BaseResponse {
  constructor(public users: User[] = []) {
    super();
  }
}
```

`BaseResponse` is intentionally empty — it exists as a type constraint anchor for the generic `LoadData` method, not as a data carrier.

---

## State Management

The component uses Angular 18 signals throughout. No `BehaviorSubject`, no manual change detection.

```typescript
users      = signal<User[]>([]);
searchTerm = signal('');
status     = signal<Status>('idle');
editingId  = signal<number | null>(null);
isLoading  = signal(false);
error      = signal<string | null>(null);

filteredUsers = computed(() => { ... });
```

`filteredUsers` is a `computed()` signal that reacts automatically when either `users` or `searchTerm` changes. Search filters across both name and email fields.

### Mode switching — `handleStatus`

All UI mode transitions go through a single `handleStatus(next: Status, user?: User)` function. Possible statuses are `'idle' | 'add' | 'edit'`. Each conditional handles its own setup and teardown:

```typescript
handleStatus(next: Status, user?: User): void {
  if (next === 'add')  { /* reset editForm, reset addForm */ }
  if (next === 'edit') { /* populate editForm, set editingId */ }
  if (next === 'idle') { /* reset both forms, clear editingId */ }
  this.status.set(next);
}
```

Add and edit modes are mutually exclusive — switching to one always tears down the other.

---

## Edge Cases Covered

### Failed data fetch

Every service call is wrapped in `try/catch/finally`:

```typescript
async loadData(): Promise<void> {
  this.isLoading.set(true);
  this.error.set(null);
  try {
    const result = await this.serverComm.LoadData<UserResponse>();
    this.users.set(result.users);
  } catch {
    this.error.set('Failed to load users. Please try refreshing.');
  } finally {
    this.isLoading.set(false);
  }
}
```

The same pattern applies to `AddUser`, `EditUser`, and `DeleteUser`. On failure, a descriptive error banner appears above the table. The error is cleared automatically when `handleStatus` is called — stale errors never persist across interactions.

All buttons are disabled via `[disabled]="isLoading()"` while any operation is in flight, preventing double-submission and race conditions.

### Duplicate email entry

A synchronous `uniqueEmailValidator` checks the current in-memory user list before submission. The list is always fresh — each service call returns the latest full list, so the validator is always checking against up-to-date data.

Edit mode passes the current user's own ID as an exclusion so the validator does not flag a user's own email as a duplicate when editing their record.

The frontend check is a UX convenience only. The backend is the source of truth for uniqueness enforcement.

---

## Custom Validators

Both validators live inside `users/validators/` and travel with the module.

### `trimValidator`

Strips leading and trailing whitespace from a field value before other validators run. Prevents valid emails from failing due to accidental paste-in spaces.

```typescript
export const trimValidator: ValidatorFn = (control) => {
  if (typeof control.value === 'string' && control.value !== control.value.trim()) {
    control.setValue(control.value.trim(), { emitEvent: false });
  }
  return null;
};
```

`{ emitEvent: false }` prevents the `setValue` call from triggering another validation cycle, which would cause a double-write loop.

### `uniqueEmailValidator`

A higher-order validator that accepts the current user list and an optional excluded ID via factory functions:

```typescript
export function uniqueEmailValidator(
  getUsers: () => User[],
  excludeId?: () => number | null
): ValidatorFn
```

Used in the add form:
```typescript
email: ['', [Validators.required, trimValidator, Validators.email,
             uniqueEmailValidator(() => this.users())]]
```

Used in the edit form — excludes the current user's own email:
```typescript
email: ['', [Validators.required, trimValidator, Validators.email,
             uniqueEmailValidator(() => this.users(), () => this.editingId())]]
```

---

## Accessibility

- `aria-hidden="true"` on all decorative SVG icons
- `aria-label` on the search input, toolbar, and all action buttons
- Action button labels are contextual: `"Edit Alice Johnson"`, `"Delete Alice Johnson"`
- `role="alert"` and `aria-live="assertive"` on the error banner for immediate screen reader announcement
- `aria-invalid` and `aria-describedby` on email inputs linked to their error messages
- `aria-required="true"` on all required form fields
- `scope="col"` on all table header elements
- `role="status"` on the empty state cell
- `role="region"` and `aria-label` on the add user form row

---

## Running Locally

```bash
npm install
ng serve
```

Navigate to `http://localhost:4200`.

---

## Build

```bash
ng build
```

Output is in `dist/user-management/browser`.

## Live App
The live app is at:
https://user-management-9r7zjeepc-darq-envoys-projects.vercel.app/ 
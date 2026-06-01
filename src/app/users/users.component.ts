import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { SERVER_COMM_TOKEN } from './tokens/server-comm.token';
import { User } from './models/user.model';
import { trimValidator, uniqueEmailValidator } from './validators/email.validator';
 
type Status = 'idle' | 'add' | 'edit';
 
@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})

export class UsersComponent implements OnInit {
  private serverComm = inject(SERVER_COMM_TOKEN);
  private fb         = inject(FormBuilder);
 
  users      = signal<User[]>([]);
  searchTerm = signal('');
  status     = signal<Status>('idle');
  editingId  = signal<number | null>(null);
  isLoading  = signal(false);
  error      = signal<string | null>(null);
 
  filteredUsers = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return term
      ? this.users().filter(
          u =>
            u.name.toLowerCase().includes(term) ||
            u.email.toLowerCase().includes(term)
        )
      : this.users();
  });
 
  addForm: FormGroup = this.fb.group({
    name:  ['', Validators.required],
email: ['',
  [Validators.required, trimValidator, Validators.email,
   uniqueEmailValidator(() => this.users())] ]  
  });
 

  editForm: FormGroup = this.fb.group({
    name:  ['', Validators.required],
email: ['',
  [Validators.required, trimValidator, Validators.email,
   uniqueEmailValidator(() => this.users(), () => this.editingId())]
]
  });
 


  


  async ngOnInit(): Promise<void> {
    await this.loadUsers();
  }
 

  handleStatus(next: Status, user?: User): void {
    if (next === 'add') {
      this.editingId.set(null);
      this.editForm.reset();
      this.addForm.reset();
      this.error.set(null);
    }
 
    if (next === 'edit' && user) {
      this.addForm.reset();
      this.editingId.set(user.id);
      this.editForm.setValue({ name: user.name, email: user.email });
      this.error.set(null);
    }
 
    if (next === 'idle') {
      this.editingId.set(null);
      this.addForm.reset();
      this.editForm.reset();
      this.error.set(null);
    }
 
    this.status.set(next);
  }
 

  async loadUsers(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const result = await this.serverComm.LoadUsers();
      this.users.set(result.users);
    } catch {
      this.error.set('Failed to load users. Please try refreshing.');
    } finally {
      this.isLoading.set(false);
    }
  }
 
  async addUser(): Promise<void> {
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const { name, email } = this.addForm.value;
      const result = await this.serverComm.AddUser({ name, email });
      this.users.set(result.users);
      this.handleStatus('idle');
    } catch {
      this.error.set('Failed to add user. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }
 
  async editUser(user: User): Promise<void> {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const { name, email } = this.editForm.value;
      const result = await this.serverComm.EditUser(new User(user.id, name, email));
      this.users.set(result.users);
      this.handleStatus('idle');
    } catch {
      this.error.set('Failed to update user. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }
 
  async deleteUser(id: number): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const result = await this.serverComm.DeleteUser(id);
      this.users.set(result.users);
      if (this.editingId() === id) {
        this.handleStatus('idle');
      }
    } catch {
      this.error.set('Failed to delete user. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
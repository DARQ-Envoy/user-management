import { Injectable } from '@angular/core';
import { ServerComm } from '../interfaces/server-comm.interface';
import { UserResponse } from '../models/response.model';
import { User } from '../models/user.model';

let mockUsers: User[] = [
  new User(1, 'Alice Johnson',  'alice.johnson@example.com'),
  new User(2, 'Bob Smith',      'bob.smith@example.com'),
  new User(3, 'Carol Williams', 'carol.williams@example.com'),
  new User(4, 'David Brown',    'david.brown@example.com'),
  new User(5, 'Emma Davis',     'emma.davis@example.com'),
];

let nextId = mockUsers.length + 1;

@Injectable({ providedIn: 'root' })
export class UserDataService implements ServerComm {

  LoadUsers(): Promise<UserResponse> {
    return Promise.resolve(new UserResponse([...mockUsers]));
  }

  AddUser(user: Omit<User, 'id'>): Promise<UserResponse> {
    const newUser = new User(nextId++, user.name, user.email);
    mockUsers = [...mockUsers, newUser];
    return Promise.resolve(new UserResponse([...mockUsers]));
  }

  EditUser(updated: User): Promise<UserResponse> {
    mockUsers = mockUsers.map(u => u.id === updated.id ? updated : u);
    return Promise.resolve(new UserResponse([...mockUsers]));
  }

  DeleteUser(id: number): Promise<UserResponse> {
    mockUsers = mockUsers.filter(u => u.id !== id);
    return Promise.resolve(new UserResponse([...mockUsers]));
  }
}
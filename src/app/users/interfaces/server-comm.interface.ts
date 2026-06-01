import { UserResponse } from '../models/response.model';
import { User } from '../models/user.model';

export interface ServerComm {
  LoadUsers(): Promise<UserResponse>;
  AddUser(user: Omit<User, 'id'>): Promise<UserResponse>;
  EditUser(user: User): Promise<UserResponse>;
  DeleteUser(id: number): Promise<UserResponse>;
}


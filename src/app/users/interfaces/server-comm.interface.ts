import { BaseResponse, UserResponse } from '../models/response.model';
import { User } from '../models/user.model';

// generic — lives at app level, reusable across modules
export interface ServerComm {
  LoadData<TRes extends BaseResponse>(): Promise<TRes>;
}

// user-specific — lives inside the users module
export interface UserServerComm extends ServerComm {
  AddUser(user: Omit<User, 'id'>): Promise<UserResponse>;
  EditUser(user: User): Promise<UserResponse>;
  DeleteUser(id: number): Promise<UserResponse>;
}
import { BaseResponse, UserResponse } from '../models/response.model';
import { User } from '../models/user.model';

export interface ServerComm {
  LoadData<TRes extends BaseResponse>(): Promise<TRes>;
  LoadUsers(): Promise<UserResponse>;
  AddUser(user: Omit<User, 'id'>): Promise<UserResponse>;
  EditUser(user: User): Promise<UserResponse>;
  DeleteUser(id: number): Promise<UserResponse>;
}


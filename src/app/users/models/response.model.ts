import { User } from './user.model';

export class BaseResponse {}

export class UserResponse extends BaseResponse {
  constructor(public users: User[] = []) {
    super();
  }
}
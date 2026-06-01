import { InjectionToken } from '@angular/core';
import {  UserServerComm } from '../interfaces/server-comm.interface';

export const SERVER_COMM_TOKEN = new InjectionToken<UserServerComm>(
  'SERVER_COMM_TOKEN'
);
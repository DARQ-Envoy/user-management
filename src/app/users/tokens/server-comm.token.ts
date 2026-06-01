import { InjectionToken } from '@angular/core';
import { ServerComm } from '../interfaces/server-comm.interface';

export const SERVER_COMM_TOKEN = new InjectionToken<ServerComm>(
  'SERVER_COMM_TOKEN'
);
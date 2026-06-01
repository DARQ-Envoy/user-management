import { Component  } from '@angular/core';
import {UsersComponent}  from './users/users.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [UsersComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'user-management';

  async ngOnInit(){

  }
}

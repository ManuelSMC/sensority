import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, PasswordModule, ButtonModule, CardModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent {
  email = '';
  password = '';
  error: string | null = null;

  // Demo users
  private users = [
    { email: 'admin@sensity.io', password: 'Admin123!' },
    { email: 'operador@sensity.io', password: 'Operador123!' }
  ];

  constructor(private router: Router) {}

  onLogin() {
    this.error = null;
    const found = this.users.find(u => u.email === this.email && u.password === this.password);
    if (found) {
      this.router.navigate(['/dashboard']);
    } else {
      this.error = 'Credenciales inválidas. Verifica usuario y contraseña.';
    }
  }
}

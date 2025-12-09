import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  authError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // Check if we're coming from signup with credentials
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state;

    // Also check history state for when component reloads
    const historyState = window.history.state;

    if (state && state['fromSignup'] && state['username'] && state['password']) {
      // Coming from signup - populate form
      this.loginForm.patchValue({
        username: state['username'],
        password: state['password'],
        rememberMe: true // Optionally set remember me
      });
      
      // Show a helpful message
      this.toastr.info('Please click Login to continue', 'Registration Successful');
    } else if (historyState && historyState['fromSignup'] && historyState['username'] && historyState['password']) {
      // Handle the case where component reloaded but state is in history
      this.loginForm.patchValue({
        username: historyState['username'],
        password: historyState['password'],
        rememberMe: true
      });
      
      this.toastr.info('Please click Login to continue', 'Registration Successful');
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid || this.isLoading) {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;
    this.authError = null;

    const { username, password, rememberMe } = this.loginForm.value;

    this.authService.login({ username, password }).subscribe({
      next: (response) => {
        this.authService.saveToken(response.token, rememberMe);
        this.authService.saveUser(response);
        this.toastr.success('Welcome back!', 'Login Successful');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.authError = err?.error?.message || 'Login failed. Please check your credentials.';
        this.toastr.error('Login Failed');
      },
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }
}
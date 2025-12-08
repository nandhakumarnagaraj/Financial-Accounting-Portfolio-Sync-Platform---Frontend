import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-xero-callback',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="callback-container">
      <div class="callback-card">
        <mat-spinner diameter="60"></mat-spinner>
        <h2>Connecting to Xero...</h2>
        <p>Please wait while we complete your authentication.</p>
      </div>
    </div>
  `,
  styles: [`
    .callback-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    .callback-card {
      background: white;
      border-radius: 20px;
      padding: 60px 40px;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 400px;
    }
    
    h2 {
      font-size: 24px;
      font-weight: 700;
      margin: 30px 0 10px;
      color: #111827;
    }
    
    p {
      font-size: 15px;
      color: #6b7280;
      margin: 0;
    }
  `]
})
export class XeroCallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get authorization code from URL
    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      const state = params['state'];

      if (code) {
        // If your backend handles the callback, just close this window
        // Or navigate to Xero connection page
        setTimeout(() => {
          // Notify the opener window (Xero Connection component)
          if (window.opener) {
            window.opener.postMessage(
              { type: 'XERO_AUTH_SUCCESS', code },
              window.location.origin
            );
            window.close();
          } else {
            // Fallback: redirect to Xero connection page
            this.router.navigate(['/xero-connection']);
          }
        }, 1500);
      } else {
        // Auth failed or was cancelled
        if (window.opener) {
          window.opener.postMessage(
            { type: 'XERO_AUTH_FAILED' },
            window.location.origin
          );
          window.close();
        } else {
          this.router.navigate(['/xero-connection']);
        }
      }
    });
  }
}
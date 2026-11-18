import { Component } from '@angular/core';

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  template: '<main class="page-shell"><h1>Page not found</h1><p>The page you requested does not exist.</p></main>',
  styleUrl: './page.scss',
})
export class NotFoundPage {}

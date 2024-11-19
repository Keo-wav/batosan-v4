import {Component, OnInit} from '@angular/core';
import {ApiService} from './core/services/api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'batosan-v4';

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.apiService.fetchWords();
  }
}

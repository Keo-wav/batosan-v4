import {Component, Input, OnInit} from '@angular/core';
import {ApiService} from '../../core/services/api.service';

@Component({
  selector: 'app-words',
  templateUrl: './words.component.html',
  styleUrl: './words.component.css'
})
export class WordsComponent implements OnInit {
  englishWords: string[] = [];
  japaneseWords: string[] = [];

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.apiService.englishWords$.subscribe(words => {
      this.englishWords = words;
      console.log('English Words:', this.englishWords);
    });

    this.apiService.japaneseWords$.subscribe(words => {
      this.japaneseWords = words;
      console.log('Japanese Words:', this.japaneseWords);
    });
  }
}

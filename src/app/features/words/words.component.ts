import {Component, OnInit} from '@angular/core';
import {ApiService} from '../../core/services/api.service';
import {FormControl} from '@angular/forms';
import {BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, map} from 'rxjs';

@Component({
  selector: 'app-words',
  templateUrl: './words.component.html',
  styleUrl: './words.component.css'
})
export class WordsComponent implements OnInit {
  englishWords: string[] = [];
  japaneseWords: string[] = [];
  filteredEnglishWords$ = new BehaviorSubject<string[]>([]);
  filteredJapaneseWords$ = new BehaviorSubject<string[]>([]);
  searchControl = new FormControl('');

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {

    combineLatest([
      this.apiService.englishWords$,
      this.apiService.japaneseWords$,
    ]).subscribe(([englishWords, japaneseWords]) => {
      this.englishWords = englishWords;
      this.japaneseWords = japaneseWords;

      // Initialize the filtered lists with full words
      this.filteredEnglishWords$.next(this.englishWords);
      this.filteredJapaneseWords$.next(this.japaneseWords);
    });

    // this.apiService.englishWords$.subscribe(words => {
    //   this.englishWords = words;
    //   // console.log('English Words:', this.englishWords);
    // });
    //
    // this.apiService.japaneseWords$.subscribe(words => {
    //   this.japaneseWords = words;
    //   // console.log('Japanese Words:', this.japaneseWords);
    // });

    // Reactive search logic
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        map((searchTerm) => searchTerm || ''),
        distinctUntilChanged(),
        map((searchTerm: string) => searchTerm.trim().toLowerCase()),
        map((searchTerm) => {
          // Filter the English words
          const filteredIndices = this.englishWords
            .map((word, index) => (word.toLowerCase().includes(searchTerm) ? index : -1))
            .filter(index => index !== -1);

          return {
            english: filteredIndices.map(index => this.englishWords[index]),
            japanese: filteredIndices.map(index => this.japaneseWords[index])
          };
        })
      )
      .subscribe(({ english, japanese }) => {
        this.filteredEnglishWords$.next(english);
        this.filteredJapaneseWords$.next(japanese);
      });
  }
}

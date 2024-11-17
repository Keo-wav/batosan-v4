import {Component, OnDestroy, OnInit} from '@angular/core';
import {ApiService} from '../../core/services/api.service';
import {FormControl} from '@angular/forms';
import {BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, map, Subject, takeUntil} from 'rxjs';

@Component({
  selector: 'app-words',
  templateUrl: './words.component.html',
  styleUrl: './words.component.css'
})
export class WordsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  englishWords: string[] = [];
  japaneseWords: string[] = [];
  filteredEnglishWords$ = new BehaviorSubject<string[]>([]);
  filteredJapaneseWords$ = new BehaviorSubject<string[]>([]);
  searchControl = new FormControl('');

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {

    // combineLatest ensures that we receive the latest values from both observables together as a single array
    combineLatest([
      this.apiService.englishWords$,
      this.apiService.japaneseWords$,
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([englishWords, japaneseWords]) => {
      this.englishWords = englishWords;
      this.japaneseWords = japaneseWords;

      // Initialize the filtered lists with full words
      this.filteredEnglishWords$.next(this.englishWords);
      this.filteredJapaneseWords$.next(this.japaneseWords);
    });

    // Reactive search logic
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        map((searchTerm) => searchTerm || ''),
        distinctUntilChanged(),
        map((searchTerm: string) => searchTerm.trim().toLowerCase()),
        map((searchTerm: string) => {
          const lowerCaseTerm = searchTerm.toLowerCase();
          const filteredIndices = this.englishWords
            .map((word, index) => (word.toLowerCase().includes(lowerCaseTerm) ? index : -1))
            .filter(index => index !== -1);

          return {
            english: filteredIndices.map(index => this.englishWords[index]),
            japanese: filteredIndices.map(index => this.japaneseWords[index])
          };
        }),
        takeUntil(this.destroy$) // Automatically unsubscribe on destroy
      )
      .subscribe(({ english, japanese }) => {
        this.filteredEnglishWords$.next(english);
        this.filteredJapaneseWords$.next(japanese);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(); // Signal all subscriptions to unsubscribe
    this.destroy$.complete(); // Complete the subject
  }
}

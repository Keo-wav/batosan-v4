import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from '../../environments/environment';
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private isDataFetched = false;
  wordsDatabase: string[] = [];
  englishWords: string[] = [];
  japaneseWords: string[] = [];
  spreadsheetID: string = environment.spreadsheetID;
  sheetRange: string = environment.sheetRange;
  apiKey: string = environment.apiKey;

  private englishWordsSubject = new BehaviorSubject<string[]>([]);
  private japaneseWordsSubject = new BehaviorSubject<string[]>([]);

  englishWords$ = this.englishWordsSubject.asObservable();
  japaneseWords$ = this.japaneseWordsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.fetchWords();
  }

  private processWords(words: string[]): void {
    this.englishWords = this.getEngWords(words);
    this.japaneseWords = this.getJapWords(words);
    this.englishWordsSubject.next(this.englishWords);
    this.japaneseWordsSubject.next(this.japaneseWords);
  }

  fetchWords() {
    if (this.isDataFetched) {
      console.log('Data already fetched, skipping API call.');
      return;
    }

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetID}/values/${this.sheetRange}?key=${this.apiKey}`;

    this.http.get<any>(url).subscribe(
      (response) => {
        if (response.values) {
          const rows = response.values;
          this.wordsDatabase = rows.flat();
          this.processWords(this.wordsDatabase)
          this.isDataFetched = true;
          // console.log('DATA EXTRACT & PROCESS SUCCESS :', this.englishWords, this.japaneseWords);
          console.log('DATA EXTRACT & PROCESS : ' + this.isDataFetched);
        } else {
          console.error('No data found in response:', response);
        }
      },
      (error) => {
        console.error('Error fetching the Google Sheet data:', error);
      }
    );
  }

  getEngWords(words: string[]) {
    this.englishWords = [];
    for (let i = 0; i < words.length; i++) {
      if (i % 2 === 0) {
        this.englishWords.push(words[i]);
      }
    }
    return this.englishWords
  }

  getJapWords(words: string[]) {
    this.japaneseWords = [];
    for (let i = 0; i < words.length; i++) {
      if (i % 2 !== 0) {
        this.japaneseWords.push(words[i]);
      }
    }
    return this.japaneseWords
  }
}

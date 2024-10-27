import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-ex1',
  templateUrl: './ex1.component.html',
  styleUrl: './ex1.component.css'
})
export class Ex1Component implements OnInit {  englishWords: string[] = [];

  shuffledEnglishWords: string[] = [];
  japaneseWords: string[] = [];
  shuffledJapaneseWords: string[] = [];

  firstClickedWord: string | null = null;
  lastClickedWord: string | null = null;
  firstWordIndex: number | null = null;
  lastWordIndex: number | null = null;

  buttonStates: string[] = [];

  isAlertVisible: boolean = false;
  alertMessage: string = "";

  constructor(private apiService: ApiService ) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.apiService.englishWords$.subscribe(words => {
        this.englishWords = words;
        console.log('English Words data : OK');
      });

      this.apiService.japaneseWords$.subscribe(words => {
        this.japaneseWords = words;
        console.log('Japanese Words data : OK');
      });

      this.displayEx1();
    }, 1000);
  }

  private displayEx1() {
    this.chooseWords();
    this.buttonStates = [];
  }

  private chooseWords(): void {
    // clear arrays
    this.shuffledEnglishWords = [];
    this.shuffledJapaneseWords = [];

    // settings definition
    const numberOfWords: number = 5;
    const selectedIndexes: Set<number> = new Set();

    // choosing the random indexes
    while (selectedIndexes.size < numberOfWords) {
      const randomIndex = Math.floor(Math.random() * this.englishWords.length);
      selectedIndexes.add(randomIndex);
    }

    // selecting en/jp words at same indexes
    selectedIndexes.forEach(index => {
      this.shuffledEnglishWords.push(this.englishWords[index]);
      this.shuffledJapaneseWords.push(this.japaneseWords[index]);
    })

    // Shuffle arrays again
    this.shuffledEnglishWords = this.shuffle(this.shuffledEnglishWords);
    this.shuffledJapaneseWords = this.shuffle(this.shuffledJapaneseWords);
  }

  private shuffle(array: string[]): string[]
  {
    // Clone the array to avoid modifying the original
    const shuffledArray = [...array];
    // Iterate through the array in reverse order
    for (let i = shuffledArray.length - 1; i > 0; i--)
    {
      // Generate a random index 'j' between 0 and i (inclusive)
      const j = Math.floor(Math.random() * (i + 1));
      // Swap the elements at indices 'i' and 'j'
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
  }

  onClick(word: string, index: number) {
    if (this.buttonStates[index] === 'match') {
      this.showAlert("Already validated this one, my man. Don't be a piece of shit :)")
      return;
    }

    if (this.firstClickedWord === null) {
      this.firstClickedWord = word;
      this.firstWordIndex = index;
      this.buttonStates[index] = 'selected';
      console.log('WORD 1 : ' + this.firstClickedWord);
    } else {
      this.lastClickedWord = word;
      this.lastWordIndex = index;

      if (this.lastClickedWord === this.firstClickedWord) {
        this.showAlert("That's the same word, you colossal twat");
      } else if (this.sameLanguageCheck(this.firstClickedWord, this.lastClickedWord)) {
        this.showAlert("Can't select a word from the same language, you bitch ass");
      } else {
        console.log('WORD 2 : ' + this.lastClickedWord);
        const isMatch = this.pairMatch(this.firstClickedWord, this.lastClickedWord);

        if (isMatch) { // Mark as matched (green)
          this.buttonStates[this.firstWordIndex!] = 'match';
          this.buttonStates[this.lastWordIndex!] = 'match';
          this.resetSelection();

          // Check if all pairs are matched only after marking the last pair as 'match'
          if (this.areAllPairsMatched()) {
            console.log('All pairs matched, generating new words...');
            this.showAlert("Félicitations, pauvre con!");

            // Delay generating new words to allow the UI to update the last matched pair
            setTimeout(() => {
              this.displayEx1();
            }, 1000);
          }
        } else { // Mark as mismatched (red)
          this.buttonStates[this.firstWordIndex!] = 'mismatch';
          this.buttonStates[this.lastWordIndex!] = 'mismatch';

          // Track mismatches for both words
          /*          this.updateMismatchStats(this.firstClickedWord);
                    this.updateMismatchStats(this.lastClickedWord);*/

          setTimeout(() => { // used to clear the mismatch color
            this.buttonStates[this.firstWordIndex!] = '';
            this.buttonStates[this.lastWordIndex!] = '';
            this.resetSelection();
          }, 400);
        }

      }
    }
  }

  areAllPairsMatched(): boolean {
    return this.buttonStates.filter(state => state === 'match').length === 10;
  }

  sameLanguageCheck(firstClickedWord: string, lastClickedWord: string): boolean {
    return (this.englishWords.includes(firstClickedWord) && this.englishWords.includes(lastClickedWord)) ||
      (this.japaneseWords.includes(firstClickedWord) && this.japaneseWords.includes(lastClickedWord));
  }

  resetSelection() {
    this.firstClickedWord = null;
    this.lastClickedWord = null;
    this.firstWordIndex = null;
    this.lastWordIndex = null;
  }

  pairMatch(firstClickedWord: string, lastClickedWord: string): boolean {
    // Check if the first word is English and the second word is Japanese
    const englishIndex = this.englishWords.indexOf(firstClickedWord);
    const japaneseIndex = this.japaneseWords.indexOf(lastClickedWord);

    // Check if the first word is Japanese and the second word is English
    const reverseEnglishIndex = this.englishWords.indexOf(lastClickedWord);
    const reverseJapaneseIndex = this.japaneseWords.indexOf(firstClickedWord);

    // Match check in both directions
    if ((englishIndex !== -1 && japaneseIndex === englishIndex) || // index = -1 if word is not in the english array.
      (reverseJapaneseIndex !== -1 && reverseJapaneseIndex === reverseEnglishIndex)) {
      console.log("It's a match.");
      return true;
    } else {
      console.log("Not a match.");
      return false;
    }
  }

  showAlert(message: string): void {
    console.log("Alert triggered with message:", message);
    this.alertMessage = message;
    this.isAlertVisible = true;
  }

  closeAlert(): void {
    this.isAlertVisible = false;
  }
}

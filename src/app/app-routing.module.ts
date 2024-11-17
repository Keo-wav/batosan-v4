import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Ex1Component } from './features/ex1/ex1.component';
import { WordsComponent } from './features/words/words.component';

const routes: Routes = [
  { path: '', redirectTo: 'words', pathMatch: 'full' },
  { path: 'ex1', component: Ex1Component },
  { path: 'words', component: WordsComponent },
  { path: '**', redirectTo: '/', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

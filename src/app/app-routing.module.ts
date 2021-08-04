import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { BoardComponent } from './components/board/board.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { NewProjectComponent } from './components/new-project/new-project.component';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { AuthGuard } from './shared/guard/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/sign-in', pathMatch: 'full' },
  { path: 'sign-in', component: SignInComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
  
    children: [
        {
           path: ':id',
           component: BoardComponent,
        },
        {
          path: '',
          component: NewProjectComponent,
       }
    ]
  },
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

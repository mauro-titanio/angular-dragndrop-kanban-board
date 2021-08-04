import { AuthService } from './../../shared/services/auth.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard'])
    }
  }

  login() {
    this.authService.googleAuth().then(data => {
      console.log("Dale ok", data);
      this.router.navigate(["dashboard"])
    }, error => {
      console.log("Dale NO", error);
    })
  }
}
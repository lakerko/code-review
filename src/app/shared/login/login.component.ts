import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Subscription } from 'rxjs';

import { DataService } from '../data/data.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  private loginSubject$: Subscription;
  public loginForm: FormGroup;
  public loginError: string;
  public isPasswordVisible = false;

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
  ) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: [ '', [
        Validators.required, Validators.email,
      ]],
      password: [ '', [
        Validators.required,
      ]],
    });

    this.loginSubject$ = this.dataService.loginSubject.subscribe(observer => {
      console.warn('observer', observer);
      if (observer.code === 'auth/user-not-found') {
        this.loginError = 'Uživateľ neexsituje';
      } else if (observer.code === 'auth/wrong-password') {
        this.loginError = 'Nesprvávne heslo';
      }
    });
  }

  get email() { return this.loginForm.get('email'); }

  get password() { return this.loginForm.get('password'); }

  login() {
    this.dataService.login(this.loginForm.value.email, this.loginForm.value.password);
  }

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  ngOnDestroy() {
    this.loginSubject$.unsubscribe();
  }

}

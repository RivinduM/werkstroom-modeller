import {Component, OnInit} from '@angular/core';
import {AuthService} from '../services/auth.service';
import {Router} from '@angular/router';
import {FlashMessagesService} from 'angular2-flash-messages';
import {NavbarComponent} from '../navbar/navbar.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  username: String;
  password: String;

  constructor(private authService: AuthService,
              private router: Router,
              private flashMessage: FlashMessagesService) {
  }

  ngOnInit() {
  }

  /**
   * @desc submit form values
   */
  onLoginSubmit() {
    const user = {
      username: this.username,
      password: this.password
    };

    this.authService.authenticateUser(user).subscribe(data => {
      if (data.success) {
        this.authService.storeUserData(data.token, data.user);
        NavbarComponent.username = data.user.name;
        this.flashMessage.show('Successfully logged in', {cssClass: 'alert-success', timeout: 5000});
        this.router.navigate(['/']);
      } else {
        this.flashMessage.show(data.msg, {cssClass: 'alert-danger', timeout: 5000});
        this.router.navigate(['login']);
      }
    });
  }
}

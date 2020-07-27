import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AngularFireAuthGuard, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { AuthGuard } from './auth.guard';

import { LoginComponent } from './shared/login/login.component';
import { LoginGuard } from './login.guard';
import { CustomPreloadingStrategy } from './custom-preloading-strategy';


const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [ LoginGuard ],
  },
  {
    path: 'anonyms',
    loadChildren: () => import('./anonyms/anonyms.module').then(m => m.AnonymsModule),
    canActivate: [ AuthGuard, AngularFireAuthGuard ],
    data: {
      preload: true,
      authGuardPipe: redirectUnauthorizedToLogin,
    },
  },
  {
    path: 'dontwants',
    loadChildren: () => import('./dontwants/dontwants.module').then(m => m.DontwantsModule),
    canActivate: [ AuthGuard, AngularFireAuthGuard ],
    data: {
      preload: true,
      authGuardPipe: redirectUnauthorizedToLogin,
    },
  },
  {
    path: 'Present',
    loadChildren: () => import('./presents/presents.module').then(m => m.PresentsModule),
    canActivate: [ AuthGuard, AngularFireAuthGuard ],
    data: {
      preload: true,
      authGuardPipe: redirectUnauthorizedToLogin,
    },
  },
  {
    path: 'reklamacie',
    loadChildren: () => import('./reclamations/reclamations.module').then(m => m.ReclamationsModule),
    canActivate: [ AuthGuard, AngularFireAuthGuard ],
    data: {
      authGuardPipe: redirectUnauthorizedToLogin,
    },
  },
  {
    path: 'administracia',
    loadChildren: () => import('./administration/administration.module').then(m => m.AdministrationModule),
    canActivate: [ AngularFireAuthGuard ],
    data: {
      authGuardPipe: redirectUnauthorizedToLogin,
    },
  },
  {
    path: '',
    redirectTo: '/anonyms',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: CustomPreloadingStrategy }),
  ],
  exports: [
    RouterModule,
  ],
  providers: [
    CustomPreloadingStrategy,
  ],
})
export class AppRoutingModule { }

import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Protects routes from unauthenticated users.
 * If the user is not logged in, redirects to the sign-in page.
 */
export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated()) {
        return true;
    }

    // Store the attempted URL for redirecting after login if needed
    return router.createUrlTree(['/auth/sign-in'], {
        queryParams: { returnUrl: state.url },
    });
};

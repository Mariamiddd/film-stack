import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Prevents authenticated users from accessing auth-only pages like Sign In or Sign Up.
 * If the user is already logged in, redirects to the home page or profile.
 */
export const guestGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
        return true;
    }

    // If already logged in, go back to home or profile
    return router.createUrlTree(['/']);
};

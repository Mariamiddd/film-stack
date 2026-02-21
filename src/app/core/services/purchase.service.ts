import { Injectable, signal } from '@angular/core';

export interface Purchase {
    movieId: number;
    movieTitle: string;
    posterPath: string | null;
    purchaseDate: Date;
    price: number;
    mediaType?: 'movie' | 'tv';
}

@Injectable({
    providedIn: 'root'
})
export class PurchaseService {
    // Store purchased movies (in a real app, this would be in a database)
    private purchases = signal<Purchase[]>([]);
    private currentUserId: string | null = null;

    constructor() {
        // Initial load for guest or last user
        const userStr = localStorage.getItem('current_user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user && user.id) {
                    this.initializeForUser(user.id);
                }
            } catch (e) {
                this.loadPurchases();
            }
        } else {
            this.loadPurchases();
        }
    }

    initializeForUser(userId: string) {
        this.currentUserId = userId;
        this.loadPurchases();
    }

    private get storageKey(): string {
        return this.currentUserId ? `purchases_${this.currentUserId}` : 'purchases';
    }

    private loadPurchases() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Convert date strings back to Date objects
                const purchases = parsed.map((p: any) => ({
                    ...p,
                    purchaseDate: new Date(p.purchaseDate)
                }));
                this.purchases.set(purchases);
            } catch (e) {
                console.error('Failed to parse purchases', e);
                this.purchases.set([]);
            }
        } else {
            this.purchases.set([]);
        }
    }

    private savePurchases() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.purchases()));
    }

    purchaseMovie(movieId: number, movieTitle: string, posterPath: string | null = null, price: number = 4.99, mediaType: 'movie' | 'tv' = 'movie'): boolean {
        // Check if already purchased
        if (this.hasPurchased(movieId)) {
            return false;
        }

        const purchase: Purchase = {
            movieId,
            movieTitle,
            posterPath,
            purchaseDate: new Date(),
            price,
            mediaType
        };

        this.purchases.update(p => [...p, purchase]);
        this.savePurchases();
        return true;
    }

    hasPurchased(movieId: number): boolean {
        return this.purchases().some(p => p.movieId === movieId);
    }

    getPurchases(): Purchase[] {
        return this.purchases();
    }

    getPurchase(movieId: number): Purchase | undefined {
        return this.purchases().find(p => p.movieId === movieId);
    }

    removePurchase(movieId: number): void {
        this.purchases.update(items => items.filter(p => p.movieId !== movieId));
        this.savePurchases();
    }

    updatePurchasePoster(movieId: number, posterPath: string) {
        this.purchases.update(items => items.map(p =>
            p.movieId === movieId ? { ...p, posterPath } : p
        ));
        this.savePurchases();
    }

    /**
     * Clears the current list from the UI and memory, but keeps the storage for the user.
     * Used on sign-out.
     */
    reset(): void {
        this.purchases.set([]);
        this.currentUserId = null;
    }

    /**
     * Completely clears everything for the current context.
     */
    clearPurchases(): void {
        localStorage.removeItem(this.storageKey);
        this.purchases.set([]);
    }
}

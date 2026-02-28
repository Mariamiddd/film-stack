import { Injectable, signal, computed, effect } from '@angular/core';

export interface Mood {
    label: string;
    icon: string;
    value: number; // For compatibility
    color: string;
    genres: string[]; // TMDB genre IDs
    description: string;
}

export const MOODS: Mood[] = [
    { label: 'Peaceful', icon: '🌿', value: 0, color: '#43aa8b', genres: ['10751', '99', '14'], description: 'Searching for inner serenity' },
    { label: 'Joyful', icon: '✨', value: 12, color: '#f9c74f', genres: ['35', '16', '10402'], description: 'Curation for celebration' },
    { label: 'Romantic', icon: '🍷', value: 25, color: '#ff6f59', genres: ['10749', '18'], description: 'Deep soulful connections' },
    { label: 'Curious', icon: '🔭', value: 37, color: '#4d908e', genres: ['878', '9648'], description: 'Unlocking new worlds' },
    { label: 'Inspired', icon: '🖋️', value: 50, color: '#ffffff', genres: ['36', '10752', '99'], description: 'Greatness in the making' },
    { label: 'Melancholic', icon: '🌧️', value: 62, color: '#577590', genres: ['18', '10770'], description: 'Beauty in sadness' },
    { label: 'Gutsy', icon: '🃏', value: 75, color: '#f94144', genres: ['80', '53'], description: 'High stakes and adrenaline' },
    { label: 'Excited', icon: '⚡', value: 87, color: '#f3722c', genres: ['28', '12'], description: 'Imperial adventure awaits' },
    { label: 'Terrified', icon: '🌙', value: 100, color: '#254441', genres: ['27', '53', '9648'], description: 'Into the darkness' }
];

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    // Dynamic glow color
    activeColor = signal<string>('#baf2bb');

    // Mood Slider state
    moodValue = signal<number>(50);

    currentMood = computed(() => {
        const val = this.moodValue();
        return MOODS.reduce((prev, curr) => {
            return Math.abs(curr.value - val) < Math.abs(prev.value - val) ? curr : prev;
        });
    });

    constructor() {
        effect(() => {
            const color = this.activeColor();
            // Apply the active color to the global glow variables
            document.documentElement.style.setProperty('--primary-glow', color);
            // Add a very subtle tint to the main background
            document.documentElement.style.setProperty('--bg-app-tint', `${color}15`);
        });
    }

    setActiveColor(color: string) {
        this.activeColor.set(color);
    }

    setMood(value: number) {
        this.moodValue.set(value);
    }

    // Imperial Vault Genre Colors
    getGenreColor(genreId: string): string {
        const colors: Record<string, string> = {
            '27': '#8B0000', // Horror - Blood Maroon
            '878': '#CC8E35', // Sci-Fi - Bronze/Amber
            '28': '#B22222', // Action - Firebrick Red
            '35': '#FFD700', // Comedy - Royal Gold
            '18': '#5E0B0B', // Drama - Velvet Red
            '10749': '#C19A6B', // Romance - Desert Sand/Champagne
        };
        return colors[genreId] || '#D4AF37';
    }
}

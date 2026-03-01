import { Injectable, signal, computed } from '@angular/core';

export interface Mood {
    id: string;
    label: string;
    genres: string[]; // TMDB genre IDs
    description: string;
}

export const MOODS: Mood[] = [
    { id: 'Calming', label: 'Calming', genres: ['10751', '99', '14'], description: 'Searching for inner serenity' },
    { id: 'Joyful', label: 'Joyful', genres: ['35', '16', '10402'], description: 'Curation for celebration' },
    { id: 'Romantic', label: 'Romantic', genres: ['10749', '18'], description: 'Deep soulful connections' },
    { id: 'Curious', label: 'Curious', genres: ['878', '9648'], description: 'Unlocking new worlds' },
    { id: 'Inspiring', label: 'Inspiring', genres: ['36', '10752', '99'], description: 'Greatness in the making' },
    { id: 'Melancholic', label: 'Melancholic', genres: ['18', '10770'], description: 'Beauty in sadness' },
    { id: 'Gutsy', label: 'Gutsy', genres: ['80', '53'], description: 'High stakes and adrenaline' },
    { id: 'Excited', label: 'Excited', genres: ['28', '12'], description: 'Imperial adventure awaits' },
    { id: 'Dangerous', label: 'Dangerous', genres: ['27', '53', '9648'], description: 'Into the darkness' }
];

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    // Current selected mood ID
    private selectedMoodId = signal<string>('Inspiring');

    currentMood = computed(() => {
        return MOODS.find(m => m.id === this.selectedMoodId()) || MOODS[4];
    });

    constructor() {
    }

    setMood(id: string) {
        this.selectedMoodId.set(id);
    }
}

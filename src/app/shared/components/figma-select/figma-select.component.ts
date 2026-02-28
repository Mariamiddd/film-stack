import { Component, input, output, signal, HostListener, ElementRef, inject } from '@angular/core';

export interface SelectOption {
    label: string;
    value: string;
}

@Component({
    selector: 'app-figma-select',
    standalone: true,
    imports: [],
    templateUrl: './figma-select.component.html',
    styleUrl: './figma-select.component.css'
})
export class FigmaSelectComponent {
    options = input.required<SelectOption[]>();
    value = input<string | undefined>('');
    placeholder = input<string>('Select...');
    title = input<string>('');
    defaultValue = input<string>('');
    alignRight = input<boolean>(false);

    valueChange = output<string>();

    isOpen = signal(false);
    private el = inject(ElementRef);

    selectedLabel = signal('');

    // Update selectedLabel whenever value or options change
    constructor() {
    }

    currentLabel = signal<string>('');

    toggle() {
        this.isOpen.update(v => !v);
    }

    selectOption(option: SelectOption) {
        this.valueChange.emit(option.value);
        this.isOpen.set(false);
    }

    @HostListener('document:click', ['$event'])
    onClick(event: MouseEvent) {
        if (!this.el.nativeElement.contains(event.target)) {
            this.isOpen.set(false);
        }
    }

    getCurrentLabel(): string {
        const selected = this.options().find(opt => opt.value === this.value());
        return selected ? selected.label : this.placeholder();
    }
}

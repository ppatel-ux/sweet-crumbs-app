import { Directive, ElementRef, HostListener, Input, Renderer2, inject } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true,
})
export class HighlightDirective {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);

  @Input('appHighlight') color = '#fff3cd';

  @HostListener('mouseenter')
  onMouseEnter(): void {
    if (this.elementRef.nativeElement.classList.contains('is-selected')) {
      return;
    }

    this.renderer.setStyle(this.elementRef.nativeElement, 'background-color', this.color);
    this.renderer.setStyle(this.elementRef.nativeElement, 'transition', 'background-color 0.2s ease');
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    if (this.elementRef.nativeElement.classList.contains('is-selected')) {
      return;
    }

    this.renderer.removeStyle(this.elementRef.nativeElement, 'background-color');
  }
}

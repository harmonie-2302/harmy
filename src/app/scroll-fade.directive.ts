import { Directive, ElementRef, OnInit, OnDestroy, Renderer2, inject } from '@angular/core';

@Directive({
  selector: '[appScrollFade]',
  standalone: true
})
export class ScrollFadeDirective implements OnInit, OnDestroy {
  private observer: IntersectionObserver | null = null;
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  ngOnInit() {
    this.renderer.addClass(this.el.nativeElement, 'scroll-fade-init');
    
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.renderer.addClass(this.el.nativeElement, 'scroll-fade-visible');
            // Unobserve once shown to prevent redundant triggering
            this.observer?.unobserve(this.el.nativeElement);
          }
        });
      }, {
        threshold: 0.05, // Trigger as soon as 5% is visible
        rootMargin: '0px 0px -40px 0px' // Trigger slightly before it fully rolls in
      });

      this.observer.observe(this.el.nativeElement);
    } else {
      // Fallback if IntersectionObserver isn't supported (e.g. some SSR environments)
      this.renderer.addClass(this.el.nativeElement, 'scroll-fade-visible');
    }
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

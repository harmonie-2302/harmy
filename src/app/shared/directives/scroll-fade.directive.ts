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
            this.observer?.unobserve(this.el.nativeElement);
          }
        });
      }, {
        threshold: 0.05,
        rootMargin: '0px 0px -40px 0px'
      });

      this.observer.observe(this.el.nativeElement);
    } else {
      this.renderer.addClass(this.el.nativeElement, 'scroll-fade-visible');
    }
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

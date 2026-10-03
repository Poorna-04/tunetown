import { useEffect, useRef, useState } from 'react';

const offers = [
  { title: 'Beginner guitar kits', text: 'Start playing with complete kits at 20% off.' },
  {
    title: 'Free keyboard tuning session',
    text: 'Get a guided setup session with selected keyboards.',
  },
  { title: 'Classical instruments week', text: 'Discover sitars, tablas, flutes, and harmoniums.' },
];

export default function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const regionRef = useRef(null);

  useEffect(() => {
    if (paused) return undefined;
    const timer = window.setInterval(
      () => setActiveIndex((current) => (current + 1) % offers.length),
      5000,
    );
    return () => window.clearInterval(timer);
  }, [paused]);

  function showPrevious() {
    setActiveIndex((current) => (current - 1 + offers.length) % offers.length);
  }

  return (
    <section
      ref={regionRef}
      className="hero-carousel"
      aria-roledescription="carousel"
      aria-label="TuneTown offers"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
    >
      <p className="eyebrow">Current offer</p>
      <h1>{offers[activeIndex].title}</h1>
      <p>{offers[activeIndex].text}</p>
      <div className="carousel-controls">
        <button
          type="button"
          className="secondary-button"
          onClick={showPrevious}
          aria-label="Previous offer"
        >
          Previous
        </button>
        <div className="carousel-dots" aria-label="Choose an offer">
          {offers.map((offer, index) => (
            <button
              key={offer.title}
              type="button"
              className={
                index === activeIndex ? 'carousel-dot carousel-dot--active' : 'carousel-dot'
              }
              aria-label={`Show offer ${index + 1}: ${offer.title}`}
              aria-current={index === activeIndex ? 'true' : undefined}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
        <button
          type="button"
          className="secondary-button"
          onClick={() => setActiveIndex((activeIndex + 1) % offers.length)}
          aria-label="Next offer"
        >
          Next
        </button>
      </div>
    </section>
  );
}

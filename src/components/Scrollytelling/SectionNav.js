import { memo } from 'react';

/**
 * Sağ kenardaki "bölüm" navigasyonu — scrollytelling'in bölüm göstergesi.
 * Aktif bölümü vurgular, tıklayınca ilgili bölüme yumuşakça kaydırır.
 */
const SECTIONS = [
  { id: 'home', label: 'Home', index: '01' },
  { id: 'about', label: 'About', index: '02' },
  { id: 'portfolio', label: 'Work', index: '03' },
  { id: 'contact', label: 'Contact', index: '04' },
];

const SectionNav = memo(({ activeSection, onNavigate }) => (
  <nav className="section-nav" aria-label="Bölüm navigasyonu">
    <ul className="section-nav__list">
      {SECTIONS.map((section) => {
        const isActive = section.id === activeSection;
        return (
          <li key={section.id} className="section-nav__item">
            <button
              type="button"
              className={`section-nav__dot${isActive ? ' is-active' : ''}`}
              onClick={() => onNavigate(section.id)}
              aria-label={`${section.label} bölümüne git`}
              aria-current={isActive ? 'true' : undefined}
            >
              <span className="section-nav__label" aria-hidden="true">
                <span className="section-nav__label-index">{section.index}</span>
                {section.label}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  </nav>
));

export default SectionNav;

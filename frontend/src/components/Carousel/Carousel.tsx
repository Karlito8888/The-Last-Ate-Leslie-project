import React from 'react';
import MultiCarousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import styles from './Carousel.module.scss';

// Import des logos
import logo050 from '../../assets/logos/050.png';
import aprilBeauty from '../../assets/logos/april-beauty.png';
import axiom from '../../assets/logos/axiom.png';
import bosch from '../../assets/logos/bosch.svg';
import docibHealthcare from '../../assets/logos/docib-healthcare.png';
import electrolux from '../../assets/logos/electrolux.png';
import fares from '../../assets/logos/fares.png';
import hotpack from '../../assets/logos/hotpack.png';
import indesit from '../../assets/logos/indesit.png';
import jawhara from '../../assets/logos/jawhara.png';
import lootah from '../../assets/logos/lootah.png';
import philips from '../../assets/logos/philips.png';
import rasasi from '../../assets/logos/rasasi.png';
import samsung from '../../assets/logos/samsung.png';
import sawalef from '../../assets/logos/sawalef.png';
import siemens from '../../assets/logos/siemens.png';
import swissArabian from '../../assets/logos/swiss-arabian.png';

const LOGOS = [
  { id: 1, src: logo050, alt: '050' },
  { id: 2, src: aprilBeauty, alt: 'April Beauty' },
  { id: 3, src: axiom, alt: 'Axiom' },
  { id: 4, src: bosch, alt: 'Bosch' },
  { id: 5, src: docibHealthcare, alt: 'Docib Healthcare' },
  { id: 6, src: electrolux, alt: 'Electrolux' },
  { id: 7, src: fares, alt: 'Fares' },
  { id: 8, src: hotpack, alt: 'Hotpack' },
  { id: 9, src: indesit, alt: 'Indesit' },
  { id: 10, src: jawhara, alt: 'Jawhara' },
  { id: 11, src: lootah, alt: 'Lootah' },
  { id: 12, src: philips, alt: 'Philips' },
  { id: 13, src: rasasi, alt: 'Rasasi' },
  { id: 14, src: samsung, alt: 'Samsung' },
  { id: 15, src: sawalef, alt: 'Sawalef' },
  { id: 16, src: siemens, alt: 'Siemens' },
  { id: 17, src: swissArabian, alt: 'Swiss Arabian' }
];

const Carousel: React.FC = () => {
  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 1536 },
      items: 7
    },
    desktop: {
      breakpoint: { max: 1536, min: 1024 },
      items: 5
    },
    tablet: {
      breakpoint: { max: 1024, min: 640 },
      items: 3
    },
    mobile: {
      breakpoint: { max: 640, min: 0 },
      items: 1
    }
  };

  return (
    <div className={styles.carouselWrapper}>
      <MultiCarousel
        responsive={responsive}
        infinite={true}
        autoPlay={true}
        autoPlaySpeed={3000}
        keyBoardControl={true}
        customTransition="all 0.5s ease-in-out"
        transitionDuration={500}
        containerClass={styles.carousel}
        itemClass={styles.carouselItem}
        arrows={false}
        showDots={false}
        swipeable={true}
        draggable={true}
        ssr={true}
        pauseOnHover={true}
      >
        {LOGOS.map((logo) => (
          <div key={logo.id} className={styles.logoWrapper}>
            <img 
              src={logo.src} 
              alt={logo.alt}
              className={styles.logo}
              loading="lazy"
            />
          </div>
        ))}
      </MultiCarousel>
    </div>
  );
};

export default Carousel; 
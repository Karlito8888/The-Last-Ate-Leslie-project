import React from 'react'
import styles from './About.module.scss'

const About: React.FC = () => {
  const values = [
    {
      title: 'International Standards',
      description: 'We deliver to the highest international standards with a proven track record.',
      icon: '🌟'
    },
    {
      title: 'Customer Excellence',
      description: 'We strive to exceed customer expectations with turnkey solutions for businesses of all sizes.',
      icon: '🎯'
    },
    {
      title: 'Comprehensive Solutions',
      description: 'From concept to production, we offer full-service packages for all your needs.',
      icon: '🎁'
    },
    {
      title: 'Quality Craftsmanship',
      description: 'Our carpentry, lighting, and engineering are built to the highest possible standard.',
      icon: '⚡'
    }
  ]

  return (
    <div className={styles.aboutContent}>
      <section className={styles.aboutHeader}>
        <h3>About Us</h3>
        <p className={styles.tagline}>
          Excellence in Exhibition and Interior Solutions
        </p>
        <p className={styles.subtitle}>
          Creative Vision International Trading LLC is a young dynamic company with a proven track record 
          in delivering exceptional solutions throughout Dubai, Riyadh, and the GCC.
        </p>
      </section>

      <section className={styles.vision}>
        <div className={styles.visionContent}>
          <h4>Who We Are</h4>
          <p>
            Creative Vision is one of the premier exhibition companies in Dubai, Riyadh, and throughout the GCC. 
            Our expertise lies in creating custom booth displays and fabrications for exhibitions including 
            corporate gifts and other marketing paraphernalia.
          </p>
          <p>
            We specialize in turnkey interior fit out works for businesses of all sizes, offering comprehensive 
            design and project delivery services from concepts through to development of Working Drawings and 
            Authority Approval Drawings.
          </p>
        </div>
      </section>

      <section className={styles.scope}>
        <div className={styles.scopeContent}>
          <h4>Our Scope</h4>
          <p>
            We provide comprehensive solutions in:
          </p>
          <ul>
            <li>Design and Layout Planning</li>
            <li>Interior Fit out for Showrooms</li>
            <li>Exhibition Stands and Kiosks</li>
            <li>Office and Restaurant Interiors</li>
            <li>Shop Fittings Design and Manufacturing</li>
            <li>Visual Merchandising Solutions</li>
            <li>Window Display Implementation</li>
            <li>VM Props and Signage Solutions</li>
          </ul>
        </div>
      </section>

      <section className={styles.values}>
        <h4>Our Values</h4>
        <div className={styles.valuesGrid}>
          {values.map((value, index) => (
            <article key={index} className={styles.valueCard}>
              <span className={styles.icon}>{value.icon}</span>
              <h5>{value.title}</h5>
              <p>{value.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.mission}>
        <div className={styles.missionContent}>
          <h4>Our Commitment</h4>
          <p className={styles.highlight}>Building Your Brand Through Design Excellence</p>
          <p>
            We strive to ensure all design solutions provide functionality and where appropriate epitomize 
            a client's brand. Our full service package includes a range of styles, materials, and color schemes 
            that add a new dimension to your overall corporate image.
          </p>
        </div>
      </section>

      <section className={styles.contactCTA}>
        <h4>Let's Work Together</h4>
        <p>Ready to create exceptional spaces that represent your brand?</p>
        <a href="/contact" className={styles.ctaButton}>
          Start a Project
        </a>
      </section>
    </div>
  )
}

export default About 
import React from 'react'
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaWhatsapp } from 'react-icons/fa'
import styles from './Footer.module.scss'

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()
  const phoneNumber = '+971526142870'
  const whatsappNumber = '971526142870' // Format sans le + pour WhatsApp

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerGrid}>
          {/* Contact Information */}
          <div className={styles.footerSection}>
            <h3>Contact Us</h3>
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <FaMapMarkerAlt className={styles.icon} />
                <p>
                  Unit No. 1304<br />
                  Jumeirah Bay X2, Cluster X<br />
                  Jumeirah Lakes Tower<br />
                  PO BOX: 30893<br />
                  Dubai, UAE
                </p>
              </div>
              <div className={styles.contactItem}>
                <div className={styles.contactButtons}>
                  <a href={`tel:${phoneNumber}`} className={styles.contactLink} aria-label="Call us">
                    <FaPhone className={styles.icon} />
                  </a>
                  <a href={`https://wa.me/${whatsappNumber}`} className={styles.contactLink} target="_blank" rel="noopener noreferrer" aria-label="Contact us on WhatsApp">
                    <FaWhatsapp className={styles.icon} />
                  </a>
                </div>
                <div>
                  <p className={styles.phoneNumber}>{phoneNumber}</p>
                </div>
              </div>
              <div className={styles.contactItem}>
                <FaEnvelope className={styles.icon} />
                <a href="mailto:info@creativevisionintl.com">
                  info@creativevisionintl.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className={styles.copyrightBar}>
          <p>
            © {currentYear} Creative Vision International. All rights reserved
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer 
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFacebookF,
  faXTwitter,
  faInstagram,
  faLinkedinIn,
  faYoutube
} from '@fortawesome/free-brands-svg-icons';
import { faRss } from '@fortawesome/free-solid-svg-icons';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <span>© 2025 telSpiel Communications Pvt. Ltd. | All Rights Reserved</span>
        <div className="social-icons">
          <a
            href="https://www.facebook.com/telspiel"
            target="_blank"
            rel="noopener noreferrer"
            className="icon facebook"
          >
            <FontAwesomeIcon icon={faFacebookF} />
          </a>
          <a
            href="https://twitter.com/TelSpiel"
            target="_blank"
            rel="noopener noreferrer"
            className="icon twitter"
          >
            <FontAwesomeIcon icon={faXTwitter} />
          </a>
          <a
            href="https://www.instagram.com/telspiel/#"
            target="_blank"
            rel="noopener noreferrer"
            className="icon instagram"
          >
            <FontAwesomeIcon icon={faInstagram} />
          </a>
          <a
            href="https://www.linkedin.com/company/telspiel/posts/?feedView=all"
            target="_blank"
            rel="noopener noreferrer"
            className="icon linkedin"
          >
            <FontAwesomeIcon icon={faLinkedinIn} />
          </a>
          {/* <a
            href="/rss"
            target="_blank"
            rel="noopener noreferrer"
            className="icon rss"
          >
            <FontAwesomeIcon icon={faRss} />
          </a> */}
          <a
            href="https://www.youtube.com/channel/UCJNJb4iAloNSN-f2J41X8Jw"
            target="_blank"
            rel="noopener noreferrer"
            className="icon youtube"
          >
            <FontAwesomeIcon icon={faYoutube} />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

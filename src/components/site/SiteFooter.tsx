import { handleLinkClick } from '../../lib/router';

const REPO_URL = 'https://github.com/MohsinCell/SEPIA-Air-Instruments';

export function SiteFooter() {
    return (<footer className="site-footer">
      <div className="site-footer__inner">
        <p className="site-footer__note">
          Sepia runs entirely in your browser. Camera frames are analysed on your device and are never uploaded.
          For the best tracking, use even lighting and keep both hands within the frame.
        </p>

        <div className="site-footer__columns">
          <div>
            <h2>Explore</h2>
            <ul>
              <li><a href="/#how" onClick={handleLinkClick}>How it works</a></li>
              <li><a href="/#instruments" onClick={handleLinkClick}>Instruments</a></li>
            </ul>
          </div>
          <div>
            <h2>Legal</h2>
            <ul>
              <li><a href="/privacy" onClick={handleLinkClick}>Privacy Policy</a></li>
              <li><a href={`${REPO_URL}/blob/main/LICENSE`} target="_blank" rel="noreferrer">MIT License</a></li>
            </ul>
          </div>
          <div>
            <h2>Project</h2>
            <ul>
              <li><a href={REPO_URL} target="_blank" rel="noreferrer">Source code</a></li>
              <li><a href={`${REPO_URL}/issues`} target="_blank" rel="noreferrer">Report an issue</a></li>
            </ul>
          </div>
        </div>

        <div className="site-footer__legal">
          <span>Copyright © {new Date().getFullYear()} Mohsin Belam.</span>
          <span>Designed and built by Mohsin Belam.</span>
        </div>
      </div>
    </footer>);
}

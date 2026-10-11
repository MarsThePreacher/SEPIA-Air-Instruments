import { usePageMeta } from '../../lib/meta';
import { SiteNav } from '../site/SiteNav';
import { SiteFooter } from '../site/SiteFooter';
import '../../styles/Site.css';
import '../../styles/Privacy.css';

const EFFECTIVE_DATE = 'October 12, 2026';
const REPO_URL = 'https://github.com/MohsinCell/SEPIA-Air-Instruments';

const SECTIONS = [
    { id: 'camera', title: 'Camera and hand tracking' },
    { id: 'audio', title: 'Sound and recordings' },
    { id: 'storage', title: 'What is stored on your device' },
    { id: 'third-parties', title: 'Files loaded from other services' },
    { id: 'not-collected', title: 'What we don’t do' },
    { id: 'choices', title: 'Your choices' },
    { id: 'children', title: 'Children' },
    { id: 'changes', title: 'Changes to this policy' },
    { id: 'contact', title: 'Contact' },
];

interface PrivacyProps {
    onStart: () => void;
}

export function Privacy({ onStart }: PrivacyProps) {
    usePageMeta({
        title: 'Privacy Policy | Sepia',
        description: 'How Sepia handles your camera, sound and settings. Hand tracking runs on your device, and there are no accounts, analytics or cookies.',
        path: '/privacy',
    });

    return (<div className="site">
      <SiteNav onPlay={onStart}/>

      <main className="policy">
        <header className="policy__header">
          <p className="policy__eyebrow">Legal</p>
          <h1 className="policy__title">Privacy Policy</h1>
          <p className="policy__meta">Effective {EFFECTIVE_DATE}</p>
        </header>

        <section className="policy__summary" aria-labelledby="summary-title">
          <h2 id="summary-title">The short version</h2>
          <ul>
            <li>Your camera feed is analysed on your device and is never recorded, stored or uploaded.</li>
            <li>Sepia has no accounts, no analytics, no advertising and no cookies.</li>
            <li>Recordings contain only the sound Sepia makes, and stay on your device unless you save them.</li>
            <li>To run, your browser downloads the hand-tracking software from jsDelivr and Google. Those services see an ordinary web request.</li>
          </ul>
        </section>

        <div className="policy__layout">
          <nav className="policy__toc" aria-label="On this page">
            <p>On this page</p>
            <ol>
              {SECTIONS.map(section => (<li key={section.id}><a href={`#${section.id}`}>{section.title}</a></li>))}
            </ol>
          </nav>

          <article className="policy__body">
            <p>
              Sepia (“Sepia”, “we”, “us”) is a web app that turns hand movements into music. This policy explains what
              happens to information when you use Sepia at sepia.website. It is written to be read, so it is short.
            </p>

            <section id="camera">
              <h2>Camera and hand tracking</h2>
              <p>
                When you choose <strong>Start playing</strong>, your browser asks for permission to use your camera.
                If you allow it, each video frame is passed to a hand-tracking model (Google’s MediaPipe Hand Landmarker)
                that runs inside your browser using WebAssembly. The model returns the positions of 21 points on each hand,
                and Sepia uses those positions to decide which fingers are raised.
              </p>
              <p>
                Frames and hand positions are held in memory only for as long as it takes to process them. They are not
                recorded, saved, or sent to us or anyone else. We do not use the camera for identification of any kind.
              </p>
              <p>
                The camera is switched off when you return to the home page or close the tab. Sepia never requests your
                microphone.
              </p>
            </section>

            <section id="audio">
              <h2>Sound and recordings</h2>
              <p>
                All sound is generated in your browser with the Web Audio API. If you use <strong>Record</strong>, Sepia captures
                its own audio output, not your microphone, and keeps the recording in your browser’s memory. It is only
                written to a file if you choose <strong>Save</strong>, and it is discarded when you leave or reload the page.
              </p>
            </section>

            <section id="storage">
              <h2>What is stored on your device</h2>
              <p>Sepia uses your browser’s local storage, not cookies, to remember two preferences:</p>
              <dl className="policy__table">
                <div>
                  <dt><code>air-instruments-settings</code></dt>
                  <dd>Volume, and whether the hand skeleton and particle effects are shown.</dd>
                </div>
                <div>
                  <dt><code>sepia-theme</code></dt>
                  <dd>Your Light or Dark appearance choice, if you set one.</dd>
                </div>
              </dl>
              <p>
                These values never leave your device. You can delete them at any time by clearing this site’s data in your
                browser settings.
              </p>
            </section>

            <section id="third-parties">
              <h2>Files loaded from other services</h2>
              <p>
                Sepia’s hand tracking needs two sets of files that are hosted by other services. To make playing start
                quickly, your browser may begin downloading them as soon as you open the home page:
              </p>
              <ul>
                <li>
                  <strong>jsDelivr</strong> (<code>cdn.jsdelivr.net</code>) serves the MediaPipe WebAssembly runtime.
                  See the <a href="https://www.jsdelivr.com/terms/privacy-policy-jsdelivr-net" target="_blank" rel="noreferrer">jsDelivr privacy policy</a>.
                </li>
                <li>
                  <strong>Google</strong> (<code>storage.googleapis.com</code>) serves the hand-tracking model.
                  See the <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Google privacy policy</a>.
                </li>
              </ul>
              <p>
                Like any web request, these downloads expose your IP address, browser type and the time of the request to
                the service that delivers the file. They do not include anything from your camera, your music or your
                settings. Fonts and all other files are served directly from sepia.website.
              </p>
              <p>
                The server that delivers Sepia may keep standard, short-lived access logs (IP address, browser type, pages
                requested and time) to keep the site running and secure. We do not use these logs to profile anyone.
              </p>
            </section>

            <section id="not-collected">
              <h2>What we don’t do</h2>
              <ul>
                <li>We don’t run analytics, tracking pixels or fingerprinting.</li>
                <li>We don’t show ads or share information with advertisers.</li>
                <li>We don’t sell, rent or trade personal information.</li>
                <li>We don’t ask you to create an account or give us your name or email address.</li>
              </ul>
            </section>

            <section id="choices">
              <h2>Your choices</h2>
              <p>
                You can refuse or withdraw camera permission at any time. Sepia will not work without it, but nothing else is
                affected. To change the permission, open your browser’s site settings for sepia.website, or on iPhone and iPad go
                to Settings, then Safari, then Camera.
              </p>
              <p>
                Because we don’t hold personal information about you, there is nothing for us to access, correct, export or
                delete on your behalf. Clearing this site’s data in your browser removes everything Sepia stored.
              </p>
            </section>

            <section id="children">
              <h2>Children</h2>
              <p>
                Sepia is suitable for all ages and does not knowingly collect personal information from anyone, including
                children.
              </p>
            </section>

            <section id="changes">
              <h2>Changes to this policy</h2>
              <p>
                If the way Sepia handles information changes, we will update this page and the effective date above before the
                change takes effect.
              </p>
            </section>

            <section id="contact">
              <h2>Contact</h2>
              <p>
                Questions about this policy are welcome. Please <a href={`${REPO_URL}/issues`} target="_blank" rel="noreferrer">open an issue on GitHub</a>.
                Sepia’s source code is public, so you can also check every statement on this page yourself.
              </p>
            </section>
          </article>
        </div>
      </main>

      <SiteFooter />
    </div>);
}

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Landing.css';

gsap.registerPlugin(ScrollTrigger);

export default function Landing() {
    const navigate = useNavigate();

    useEffect(() => {
        // gsap.context scopes all animations and handles cleanup safely
        const ctx = gsap.context(() => {

            gsap.from('.gs-fade-down', {
                y: -30, opacity: 0, duration: 1, ease: 'power2.out'
            });

            const heroTl = gsap.timeline();
            heroTl
                .from('.gs-reveal', {
                    y: 30, opacity: 0, duration: 0.8, stagger: 0.15, ease: 'power2.out'
                })
                .from('.gs-reveal-right .flex-visual-block', {
                    x: 50, opacity: 0, duration: 0.8, stagger: 0.2, ease: 'power3.out'
                }, '-=0.5');

            gsap.utils.toArray<Element>('.gs-up').forEach((elem) => {
                gsap.from(elem, {
                    scrollTrigger: { trigger: elem, start: 'top 85%', toggleActions: 'play none none reverse' },
                    y: 40, opacity: 0, duration: 0.8, ease: 'power2.out'
                });
            });

            gsap.utils.toArray<Element>('.gs-card').forEach((card) => {
                gsap.from(card, {
                    scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none reverse' },
                    y: 50, opacity: 0, scale: 0.98, duration: 0.8, ease: 'power3.out'
                });
            });

            gsap.from('.gs-step', {
                scrollTrigger: { trigger: '.process-grid', start: 'top 80%' },
                y: 50, rotationY: -90, transformOrigin: 'left center',
                opacity: 0, duration: 0.8, stagger: 0.15, ease: 'back.out(1.4)'
            });

            gsap.from('.cta-box', {
                scrollTrigger: { trigger: '.cta-section', start: 'top 85%', scrub: 1 },
                y: 60, scale: 0.95, ease: 'none'
            });

            gsap.to('.caterer-bob', {
                y: -10, rotation: 1, duration: 3, repeat: -1, yoyo: true, ease: 'sine.inOut'
            });
            gsap.to('.pamphlets-bob', {
                y: 15, rotation: -5, duration: 4.5, repeat: -1, yoyo: true, ease: 'sine.inOut'
            });
        });

        return () => ctx.revert();
    }, []);

    return (
        <div className="landing-page">

            {/* Navbar */}
            <nav className="lp-navbar">
                <div className="lp-container nav-flex gs-fade-down">
                    <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><img src="/logo.png" alt="Giggers" style={{ width: '36px', height: '36px', borderRadius: '8px' }} />Giggers<span style={{ color: 'var(--primary)' }}>.</span></div>
                    <div className="nav-links">
                        <a href="#about">Platform</a>
                        <a href="#services">Services</a>
                        <a href="#process">Process</a>
                    </div>
                    <button onClick={() => navigate('/login')} className="lp-btn lp-btn-primary">Hire Workers</button>
                </div>
            </nav>

            {/* Hero */}
            <header className="lp-hero">
                <div className="lp-container">
                    <div className="hero-grid">
                        <div className="hero-content">
                            <div className="lp-tag gs-reveal">Giggers Network</div>
                            <h1 className="gs-reveal">
                                Mobilize your <br />
                                <span className="lp-highlight">one-day</span> workforce.
                            </h1>
                            <p className="gs-reveal">The most organized platform to connect clients with verified local workers for catering events and massive pamphlet distributions.</p>
                            <div className="btn-group gs-reveal">
                                <button onClick={() => navigate('/login')} className="lp-btn lp-btn-primary btn-large">Explore Services</button>
                                <button onClick={() => navigate('/login')} className="lp-btn lp-btn-outline btn-large">Post a Gig</button>
                            </div>
                        </div>

                        <div className="hero-visual gs-reveal-right">
                            <div className="flex-visual-block catering-block">
                                <div className="visual-card">
                                    <div className="visual-icon yellow">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 2v20" /><path d="M2 12h20" /><path d="m18 12 4-4" /><path d="m6 12-4 4" /><path d="m18 12 4 4" /><path d="m6 12-4-4" />
                                        </svg>
                                    </div>
                                    <h3>Catering Staff</h3>
                                    <p>Matched in 4 mins</p>
                                </div>
                            </div>

                            <div className="flex-visual-block flyers-block">
                                <div className="visual-card">
                                    <div className="visual-icon blue">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M2 3h15a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" /><path d="M0 7h19" /><path d="M0 11h19" /><path d="M5 15h10" />
                                        </svg>
                                    </div>
                                    <h3>Flyer Teams</h3>
                                    <p>Matched in 2 mins</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Services */}
            <section id="services" className="services-section">
                <div className="lp-container">
                    <div className="sticky-wrapper">
                        <div className="sticky-text">
                            <h2 className="gs-up">Neatly organized <br /> domains.</h2>
                            <p className="gs-up">We separated our focus into two distinct categories to guarantee high-quality worker mapping and 100% fulfill rates.</p>
                        </div>
                        <div className="scrolling-cards">
                            <div className="clean-card bg-yellow gs-card">
                                <div className="card-header">
                                    <span className="card-badge dark-badge">Industry 01</span>
                                </div>
                                <h3>Event Catering<br />Professionals</h3>
                                <p>Clean, organized, and reliable waitstaff and food prep crews for local banquets and events.</p>
                                <ul>
                                    <li>✔ Strict background checks</li>
                                    <li>✔ Uniform verification</li>
                                    <li>✔ Rating system</li>
                                </ul>
                            </div>

                            <div className="clean-card bg-blue gs-card">
                                <div className="card-header">
                                    <span className="card-badge">Industry 02</span>
                                </div>
                                <h3>Pamphlet<br />Distribution</h3>
                                <p>Swift ground deployments. Blanket your city's zip codes with promotional flyers by tomorrow morning.</p>
                                <ul>
                                    <li>✔ Live GPS heatmaps</li>
                                    <li>✔ Delivery photos</li>
                                    <li>✔ Scalable headcounts</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Process */}
            <section id="process" className="process-section">
                <div className="lp-container">
                    <div className="text-center margin-bottom-lg gs-up">
                        <h2>The Organized Workflow</h2>
                        <p>Post, track, and pay from one unified, clean dashboard.</p>
                    </div>
                    <div className="process-grid">
                        <div className="process-step gs-step">
                            <div className="step-icon">1</div>
                            <h4>Post Gig</h4>
                            <p>Enter the date, location, and parameters of the job structure neatly.</p>
                        </div>
                        <div className="process-step gs-step">
                            <div className="step-icon outline">2</div>
                            <h4>Match</h4>
                            <p>Verified workers accept the contract via push notification.</p>
                        </div>
                        <div className="process-step gs-step">
                            <div className="step-icon">3</div>
                            <h4>Track</h4>
                            <p>Monitor arrivals and shift completion in a clear interface.</p>
                        </div>
                        <div className="process-step gs-step">
                            <div className="step-icon highlight">4</div>
                            <h4>Auto-Pay</h4>
                            <p>Release escrow payments digitally with zero messy paperwork.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="cta-section">
                <div className="lp-container">
                    <div className="cta-box bg-yellow gs-up">
                        <h2>Ready to streamline your staffing?</h2>
                        <p>Join Giggers and say goodbye to disorganized agency texts.</p>
                        <div className="btn-group" style={{ marginTop: '2rem', justifyContent: 'center' }}>
                            <button onClick={() => navigate('/login')} className="lp-btn lp-btn-secondary btn-large">Get Started Today</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="lp-footer">
                <div className="lp-container text-center">
                    <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}><img src="/logo.png" alt="Giggers" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />Giggers<span style={{ color: 'var(--primary)' }}>.</span></div>
                    <p>© 2026 Giggers Platform. Neat. Organized. Fast.</p>
                </div>
            </footer>

        </div>
    );
}

import { BookOutlined, CheckCircleOutlined, ReadOutlined, TeamOutlined  } from '@ant-design/icons';
import { Tag } from 'antd';
import { useEffect, useState } from 'react';
import MarqueeModule from 'react-fast-marquee';

const Marquee = MarqueeModule.default ?? MarqueeModule;

const featureItems = [
    { label: 'Discover a new read', Icon: BookOutlined },
    { label: 'Keep loans in view', Icon: ReadOutlined },
    { label: 'Request returns clearly', Icon: CheckCircleOutlined },
    { label: 'Manage the library desk', Icon: TeamOutlined },
];

function FeatureTag({ item }) {
    const Icon = item.Icon;

    return (
        <Tag
            className="welcome-feature-marquee-tag"
            classNames={{ icon: 'welcome-feature-marquee-icon' }}
            icon={<Icon aria-hidden="true" />}
            variant="filled"
        >
            {item.label}
        </Tag>
    );
}

function usePrefersReducedMotion() {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

        updatePreference();
        mediaQuery.addEventListener?.('change', updatePreference);

        return () => mediaQuery.removeEventListener?.('change', updatePreference);
    }, []);

    return prefersReducedMotion;
}

function StaticFeatureList() {
    return (
        <ul className="welcome-feature-marquee-static" aria-label="Library capabilities">
            {featureItems.map((item) => (
                <li key={item.label}>
                    <FeatureTag item={item} />
                </li>
            ))}
        </ul>
    );
}

export default function WelcomeFeatureMarquee() {
    const prefersReducedMotion = usePrefersReducedMotion();

    return (
        <section className="welcome-feature-marquee-section" aria-labelledby="feature-marquee-title">
            <div className="welcome-feature-marquee-heading">
                <h2 id="feature-marquee-title">What you can do here.</h2>
                <p>Find books, track loans, and handle returns.</p>
            </div>

            <div className="welcome-feature-marquee-viewport">
                {prefersReducedMotion ? (
                    <StaticFeatureList />
                ) : (
                    <>
                        <div aria-hidden="true">
                            <Marquee
                                autoFill
                                className="welcome-feature-marquee"
                                gradient
                                gradientColor="#f5f8f7"
                                gradientWidth={56}
                                pauseOnHover
                                speed={28}
                            >
                                {featureItems.map((item) => (
                                    <span className="welcome-feature-marquee-item" key={item.label}>
                                        <FeatureTag item={item} />
                                    </span>
                                ))}
                            </Marquee>
                        </div>

                        <ul className="sr-only" aria-label="Library capabilities">
                            {featureItems.map((item) => (
                                <li key={item.label}>{item.label}</li>
                            ))}
                        </ul>
                    </>
                )}
            </div>
        </section>
    );
}

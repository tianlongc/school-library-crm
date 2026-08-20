import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { App as AntdApp, ConfigProvider } from 'antd';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App: InertiaApp, props }) {
        const root = createRoot(el);

        root.render(
            <ConfigProvider
                theme={{
                    token: {
                        colorPrimary: '#0f766e',
                        colorError: '#be123c',
                        borderRadius: 8,
                        colorText: '#14242e',
                        fontFamily: 'Figtree, system-ui, sans-serif',
                    },
                 }}
            >
                <AntdApp>
                    <InertiaApp {...props} />
                </AntdApp>
            </ConfigProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

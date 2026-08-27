import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { App as AntdApp, ConfigProvider, theme } from 'antd';

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
                    algorithm: theme.defaultAlgorithm,
                    cssVar: true,
                    token: {
                        colorPrimary: '#0f766e',
                        colorSuccess: '#52c41a',
                        colorWarning: '#faad14',
                        colorError: '#ff4d4f',
                        colorInfo: '#1677ff',
                        borderRadius: 6,
                        fontSize: 14,
                        colorText: '#14242e',
                        fontFamily: 'Figtree, system-ui, sans-serif',
                    },
                    components: {
                        Card: {
                            headerFontSize: 14,
                        },
                        Layout: {
                            bodyBg: '#f5f5f5',
                            headerBg: '#ffffff',
                            siderBg: '#14242e',
                        },
                        Menu: {
                            darkItemBg: '#14242e',
                            darkSubMenuItemBg: '#14242e',
                            darkItemSelectedBg: '#0f766e',
                            darkItemHoverBg: '#213741',
                            itemBorderRadius: 6,
                            itemHeight: 40,
                        },
                        Table: {
                            cellPaddingBlockMD: 12,
                            cellPaddingInlineMD: 16,
                            headerBg: '#fafafa',
                        },
                    },
                }}
            >
                <AntdApp>
                    <InertiaApp {...props} />
                </AntdApp>
            </ConfigProvider>,
        );
    },
    progress: {
        color: '#0f766e',
    },
});

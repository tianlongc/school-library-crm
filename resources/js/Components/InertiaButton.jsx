import { router } from '@inertiajs/react';
import { Button } from 'antd';

export default function InertiaButton({
    data = {},
    href,
    method = 'get',
    onClick,
    preserveScroll = false,
    preserveState = false,
    replace = false,
    ...props
}) {
    const navigate = (event) => {
        if (
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
        ) {
            return;
        }

        onClick?.(event);

        if (event.defaultPrevented) {
            return;
        }

        event.preventDefault();

        router.visit(href, {
            data,
            method,
            preserveScroll,
            preserveState,
            replace,
        });
    };

    return <Button {...props} href={href} onClick={navigate} />;
}

import { useCallback, useEffect, useRef, useState } from 'react';

import { jsonRequest } from './jsonRequest';

export function useCmsContentAutosave({ content, delay = 900, enabled = true }) {
    const [status, setStatus] = useState('idle');
    const contentRef = useRef(content);
    const lastSavedRef = useRef(JSON.stringify(content));
    const timeoutRef = useRef(null);
    const saveQueueRef = useRef(Promise.resolve());

    contentRef.current = content;

    const saveNow = useCallback(() => {
        if (!enabled) {
            return Promise.resolve(null);
        }

        if (timeoutRef.current) {
            window.clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        const serializedContent = JSON.stringify(contentRef.current);

        if (serializedContent === lastSavedRef.current) {
            return saveQueueRef.current;
        }

        setStatus('saving');
        saveQueueRef.current = saveQueueRef.current
            .catch(() => undefined)
            .then(() =>
                jsonRequest({
                    url: route('admin.cms.content.update'),
                    method: 'POST',
                    data: { content: JSON.parse(serializedContent) },
                }),
            )
            .then((payload) => {
                lastSavedRef.current = serializedContent;
                setStatus('saved');

                return payload;
            })
            .catch((error) => {
                setStatus('error');
                throw error;
            });

        return saveQueueRef.current;
    }, [enabled]);

    useEffect(() => {
        if (!enabled || JSON.stringify(content) === lastSavedRef.current) {
            return undefined;
        }

        setStatus('pending');
        timeoutRef.current = window.setTimeout(() => {
            void saveNow().catch(() => undefined);
        }, delay);

        return () => {
            if (timeoutRef.current) {
                window.clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, [content, delay, enabled, saveNow]);

    return { saveNow, status };
}

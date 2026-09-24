import { useCallback, useEffect, useRef, useState } from 'react';

import { jsonRequest } from './jsonRequest';
import { getCmsSaveStatus } from './cmsSaveStatus';

export function useCmsContentAutosave({ content, delay = 900, enabled = true }) {
    const contentRef = useRef(content);
    const lastSavedRef = useRef(JSON.stringify(content));
    const lastQueuedRef = useRef(lastSavedRef.current);
    const [progress, setProgress] = useState({
        saved: lastSavedRef.current,
        saving: null,
        error: false,
    });
    const timeoutRef = useRef(null);
    const saveQueueRef = useRef(Promise.resolve());

    contentRef.current = content;
    const status = getCmsSaveStatus({
        current: JSON.stringify(content),
        ...progress,
    });

    const saveNow = useCallback(() => {
        if (!enabled) {
            return Promise.resolve(null);
        }

        if (timeoutRef.current) {
            window.clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        const serializedContent = JSON.stringify(contentRef.current);

        if (serializedContent === lastQueuedRef.current) {
            return saveQueueRef.current;
        }

        lastQueuedRef.current = serializedContent;
        setProgress((current) => ({
            ...current,
            saving: serializedContent,
            error: false,
        }));
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
                setProgress((current) => ({
                    saved: serializedContent,
                    saving:
                        current.saving === serializedContent
                            ? null
                            : current.saving,
                    error: false,
                }));

                return payload;
            })
            .catch((error) => {
                if (lastQueuedRef.current === serializedContent) {
                    lastQueuedRef.current = lastSavedRef.current;
                }
                setProgress((current) => ({
                    ...current,
                    saving:
                        current.saving === serializedContent
                            ? null
                            : current.saving,
                    error: true,
                }));
                throw error;
            });

        return saveQueueRef.current;
    }, [enabled]);

    useEffect(() => {
        const serializedContent = JSON.stringify(content);

        if (
            !enabled ||
            serializedContent === lastSavedRef.current ||
            serializedContent === lastQueuedRef.current
        ) {
            return undefined;
        }

        timeoutRef.current = window.setTimeout(() => {
            void saveNow().catch(() => undefined);
        }, delay);

        return () => {
            if (timeoutRef.current) {
                window.clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, [content, delay, enabled, progress.saved, saveNow]);

    return { saveNow, status };
}

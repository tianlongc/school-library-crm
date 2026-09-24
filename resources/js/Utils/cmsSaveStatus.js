export function getCmsSaveStatus({ current, saved, saving, error }) {
    if (saving !== null) {
        return current === saving ? 'saving' : 'pending';
    }

    if (current === saved) {
        return 'saved';
    }

    return error ? 'error' : 'pending';
}

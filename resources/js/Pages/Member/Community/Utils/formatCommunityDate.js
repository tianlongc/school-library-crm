const communityDateFormatter = new Intl.DateTimeFormat('en-MY', {
    dateStyle: 'medium',
    timeStyle: 'short',
});

const communityShortDateFormatter = new Intl.DateTimeFormat('en-MY', {
    day: 'numeric',
    month: 'short',
});

const communityShortDateWithYearFormatter = new Intl.DateTimeFormat('en-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
});

export function formatCommunityDate(value) {
    return communityDateFormatter.format(new Date(value));
}

export function formatCommunityTimestamp(value) {
    const date = new Date(value);
    const elapsedSeconds = Math.round(
        (Date.now() - date.getTime()) / 1000,
    );
    const seconds = Math.abs(elapsedSeconds);

    if (seconds < 60) {
        return 'now';
    }

    if (seconds < 60 * 60) {
        return `${Math.floor(seconds / 60)}m`;
    }

    if (seconds < 24 * 60 * 60) {
        return `${Math.floor(seconds / (60 * 60))}h`;
    }

    if (seconds < 7 * 24 * 60 * 60) {
        return `${Math.floor(seconds / (24 * 60 * 60))}d`;
    }

    return date.getFullYear() === new Date().getFullYear()
        ? communityShortDateFormatter.format(date)
        : communityShortDateWithYearFormatter.format(date);
}

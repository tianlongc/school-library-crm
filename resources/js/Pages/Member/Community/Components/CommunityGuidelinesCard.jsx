import { Card } from 'antd';

const guidelines = [
    'Be respectful to other readers.',
    'Keep posts relevant to books and the library',
    'Do not spam the community.',
    'Avoid sharing personal information.',
];

export default function CommunityGuidelinesCard() {
    return (
        <Card
            className="min-w-0 rounded-2xl shadow-sm"
            size="small"
            title={(
                <h2 id="community-guidelines-title" className="m-0 text-base font-semibold text-[var(--library-ink)]">
                    Community guidelines
                </h2>
            )}
        >
            <ul className="-my-1 list-disc space-y-2 pl-5 text-sm leading-5 text-slate-600">
                {guidelines.map((guideline) => (
                    <li key={guideline}>{guideline}</li>
                ))}
            </ul>
        </Card>
    );
}

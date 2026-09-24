import { Card } from 'antd';

export default function TrendingBooksCard({ books = [] }) {
    return (
        <Card
            className="min-w-0 rounded-2xl shadow-sm"
            size="small"
            title={(
                <h2 id="community-trending-title" className="m-0 text-base font-semibold text-[var(--library-ink)]">
                    Trending this week
                </h2>
            )}
        >
            {books.length === 0 ? (
                <p className="text-sm text-slate-600">
                    No books have recent discussions yet.
                </p>
            ) : (
                <ol className="-my-2 divide-y divide-slate-100">
                    {books.map((book, index) => (
                        <li key={book.id} className="flex gap-3 py-3">
                            <span
                                aria-hidden="true"
                                className="w-5 shrink-0 pt-0.5 text-sm font-semibold tabular-nums text-teal-800"
                            >
                                {index + 1}
                            </span>

                            <div className="min-w-0">
                                <p className="break-words text-sm font-semibold leading-5 text-slate-900">
                                    {book.title}
                                </p>
                                <p className="mt-0.5 break-words text-xs text-slate-600">
                                    {book.author}
                                </p>
                                <p className="mt-1 text-xs text-slate-600">
                                    {book.discussionsCount}{' '}
                                    {book.discussionsCount === 1
                                        ? 'discussion'
                                        : 'discussions'
                                    }
                                </p>
                            </div>
                        </li>
                    ))}
                </ol>
            )}
        </Card>
    );
}

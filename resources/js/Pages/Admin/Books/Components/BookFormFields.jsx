function FieldError({ id, message }) {
    if (!message) {
        return null;
    }

    return <p id={id} className="mt-1.5 text-xs font-medium text-rose-700" role="alert">{message}</p>;
}

const inputClassName = (hasError) =>
    `ui-input mt-1.5 ${hasError ? 'ui-input-error' : ''}`;

export default function BookFormFields({ clearErrors, data, errors, setData }) {
    const updateField = (field, value) => {
        setData(field, value);
        clearErrors(field);
    };

    return (
        <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
                <label htmlFor="title" className="ui-label">Title <span className="text-rose-600">*</span></label>
                <input id="title" name="title" value={data.title} onChange={(event) => updateField('title', event.target.value)} className={inputClassName(Boolean(errors.title))} placeholder="For example, The Little Prince…" maxLength="255" required autoComplete="off" aria-invalid={Boolean(errors.title)} aria-describedby={errors.title ? 'title-error' : undefined} />
                <FieldError id="title-error" message={errors.title} />
            </div>

            <div>
                <label htmlFor="author" className="ui-label">Author <span className="text-rose-600">*</span></label>
                <input id="author" name="author" value={data.author} onChange={(event) => updateField('author', event.target.value)} className={inputClassName(Boolean(errors.author))} placeholder="Author name…" maxLength="255" required autoComplete="off" aria-invalid={Boolean(errors.author)} aria-describedby={errors.author ? 'author-error' : undefined} />
                <FieldError id="author-error" message={errors.author} />
            </div>

            <div>
                <label htmlFor="isbn" className="ui-label">ISBN <span className="text-rose-600">*</span></label>
                <input id="isbn" name="isbn" value={data.isbn} onChange={(event) => updateField('isbn', event.target.value)} className={inputClassName(Boolean(errors.isbn))} placeholder="For example, 9780132350884…" maxLength="13" required autoComplete="off" spellCheck={false} aria-invalid={Boolean(errors.isbn)} aria-describedby={errors.isbn ? 'isbn-error' : 'isbn-help'} />
                <p id="isbn-help" className="ui-help">Enter exactly 13 characters.</p>
                <FieldError id="isbn-error" message={errors.isbn} />
            </div>

            <div className="sm:col-span-2 sm:max-w-xs">
                <label htmlFor="total_copies" className="ui-label">Total copies <span className="text-rose-600">*</span></label>
                <input id="total_copies" name="total_copies" type="number" min="1" step="1" inputMode="numeric" value={data.total_copies} onChange={(event) => updateField('total_copies', event.target.value)} className={inputClassName(Boolean(errors.total_copies))} required autoComplete="off" aria-invalid={Boolean(errors.total_copies)} aria-describedby={errors.total_copies ? 'total-copies-error' : 'total-copies-help'} />
                <p id="total-copies-help" className="ui-help">Physical copies owned by the library.</p>
                <FieldError id="total-copies-error" message={errors.total_copies} />
            </div>

            <div className="sm:col-span-2">
                <label htmlFor="description" className="ui-label">Description <span className="font-normal text-slate-400">(optional)</span></label>
                <textarea id="description" name="description" rows="6" value={data.description} onChange={(event) => updateField('description', event.target.value)} className={inputClassName(Boolean(errors.description))} placeholder="Add a short summary or cataloguing notes…" autoComplete="off" aria-invalid={Boolean(errors.description)} aria-describedby={errors.description ? 'description-error' : undefined} />
                <FieldError id="description-error" message={errors.description} />
            </div>
        </div>
    );
}

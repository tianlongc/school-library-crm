import { jsonRequest } from '@/Utils/jsonRequest';
import { getLaravelValidationErrors } from '@/Utils/laravelValidation';
import { getRequestErrorMessage } from '@/Utils/requestErrorMessage';
import { Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function CategoryForm({ category = null, onSuccess, submitLabel, url }) {
    const { clearErrors, data, errors, setData, setError } = useForm({
        name: category?.name ?? '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [requestError, setRequestError] = useState('');

    const submit = async (event) => {
        event.preventDefault();
        clearErrors();
        setRequestError('');
        setSubmitting(true);

        try {
            const payload = await jsonRequest({
                url,
                method: 'POST',
                data,
            });

            onSuccess(payload);
        } catch (error) {
            const validationErrors = getLaravelValidationErrors(error);

            if (validationErrors) {
                setError(validationErrors);
            } else {
                setRequestError(
                    getRequestErrorMessage(
                        error,
                        'The category could not be saved. Try again.',
                    ),
                );
            }
        } finally {
            setSubmitting(false);
        }
    };

    const updateName = (value) => {
        setData('name', value);
        clearErrors('name');
    };

    return (
        <form onSubmit={submit} className="ui-panel">
            <div className="ui-panel-header">
                <div>
                    <p className="ui-eyebrow">Classification</p>
                    <h2 className="ui-panel-title mt-1">Category details</h2>
                    <p className="ui-panel-description">
                        Use a concise name that librarians will recognise while cataloguing books.
                    </p>
                </div>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200">
                    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 13 11 22l-9-9V2h11l9 9-2 2Z" />
                        <circle cx="7.5" cy="7.5" r="1.5" />
                    </svg>
                </span>
            </div>

            <div className="px-5 py-6 sm:px-6">
                <div aria-live="polite">
                    {requestError && (
                        <div className="mb-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">
                            {requestError}
                        </div>
                    )}
                </div>

                <div className="max-w-xl">
                    <label htmlFor="category-name" className="ui-label">
                        Category name <span className="text-rose-600">*</span>
                    </label>
                    <input
                        id="category-name"
                        name="name"
                        value={data.name}
                        onChange={(event) => updateName(event.target.value)}
                        className={`ui-input mt-1.5 ${errors.name ? 'ui-input-error' : ''}`}
                        placeholder="For example, Science fiction"
                        maxLength="255"
                        required
                        autoFocus
                        autoComplete="off"
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={errors.name ? 'category-name-help category-name-error' : 'category-name-help'}
                    />
                    <p id="category-name-help" className="ui-help">
                        Category names must be unique. Books can remain uncategorized.
                    </p>
                    {errors.name && (
                        <p id="category-name-error" className="mt-1.5 text-xs font-medium text-rose-700" role="alert">
                            {errors.name}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                <Link href={route('staff.categories.index')} className="ui-button-secondary">
                    Cancel
                </Link>
                <button type="submit" disabled={submitting} className="ui-button-primary disabled:cursor-wait">
                    {submitting ? 'Saving…' : submitLabel}
                </button>
            </div>
        </form>
    );
}

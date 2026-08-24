import { jsonRequest } from '@/Utils/jsonRequest';
import { getLaravelValidationErrors } from '@/Utils/laravelValidation';
import { getRequestErrorMessage } from '@/Utils/requestErrorMessage';
import { Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import BookFormFields from './BookFormFields';

export default function BookForm({ book = null, categories = [], submitLabel, url, onSuccess }) {
    const { data, setData, errors, setError, clearErrors } = useForm({
        title: book?.title ?? '',
        author: book?.author ?? '',
        isbn: book?.isbn ?? '',
        description: book?.description ?? '',
        total_copies: book?.total_copies ?? 1,
        category_id: book?.category_id ?? '',
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
                setRequestError(getRequestErrorMessage(error, 'The book could not be saved. Try again.'));
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={submit} className="ui-panel">
            <div className="ui-panel-header">
                <div>
                    <h2 className="ui-panel-title">Book information</h2>
                    <p className="ui-panel-description">Fields marked with an asterisk are required.</p>
                </div>
            </div>

            <div className="px-5 py-6 sm:px-6">
                <div aria-live="polite">
                    {requestError && <div className="mb-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">{requestError}</div>}
                </div>
                <BookFormFields
                    categories={categories}
                    data={data}
                    errors={errors}
                    setData={setData}
                    clearErrors={clearErrors}
                />
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                <Link href={route('staff.books.index')} className="ui-button-secondary">Cancel</Link>
                <button type="submit" disabled={submitting} className="ui-button-primary disabled:cursor-wait">
                    {submitting ? 'Saving…' : submitLabel}
                </button>
            </div>
        </form>
    );
}

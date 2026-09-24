import { Segmented } from 'antd';

export default function CommunityCategoryNav({
    categoryOptions,
    selectedCategoryId,
    onChange,
}) {
    const options = [
        { label: 'All categories', value: 'all' },
        ...categoryOptions.map((category) => ({
            label: category.label,
            value: category.value,
        })),
    ];

    return (
        <div className="min-w-0 overflow-x-auto py-1">
            <Segmented
                aria-label="Filter community posts by category"
                className="min-w-max"
                options={options}
                value={selectedCategoryId ?? 'all'}
                onChange={(value) => onChange(value === 'all' ? null : value)}
            />
        </div>
    );
}

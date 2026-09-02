import SearchOutlined from '@ant-design/icons/SearchOutlined';
import { Input } from 'antd';

export default function TableSearchInput({
    ariaLabel,
    onChange,
    placeholder,
    value,
}) {
    return (
        <Input
            allowClear
            aria-label={ariaLabel}
            autoComplete="off"
            prefix={<SearchOutlined />}
            placeholder={placeholder}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            style={{
                flex: '1 1 220px',
                minWidth: 220,
            }}
        />
    );
}

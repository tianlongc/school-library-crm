import { Button, Tooltip } from 'antd';

export default function ToolbarButton({
    title,
    icon,
    active,
    disabled = false,
    onClick,
}) {
    return (
        <Tooltip title={title}>
            <Button
                type={active ? 'primary' : 'text'}
                icon={icon}
                disabled={disabled}
                aria-label={title}
                aria-pressed={typeof active === 'boolean' ? active : undefined}
                htmlType="button"
                size="small"
                onMouseDown={(event) => {
                    event.preventDefault();
                }}
                onClick={onClick}
            />
        </Tooltip>
    );
}

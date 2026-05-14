export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}) {
    return (
        <label
            {...props}
            className={
                `block text-lg font-bold text-slate-50 dark:text-sky-700 ` +
                className
            }
        >
            {value ? value : children}
        </label>
    );
}

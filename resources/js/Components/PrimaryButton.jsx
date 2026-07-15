export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center rounded-full border border-transparent bg-[#0F5132] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white shadow-sm transition duration-150 ease-in-out hover:bg-[#146C43] focus:bg-[#146C43] focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 active:bg-[#0B2F1F] dark:bg-emerald-900 dark:text-slate-100 dark:hover:bg-emerald-800 dark:focus:bg-emerald-800 dark:focus:ring-offset-gray-900 ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}

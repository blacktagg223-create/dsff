import { forwardRef } from 'react';

const FormField = forwardRef(({ 
  label, 
  error, 
  type = 'text',
  className = '',
  required = false,
  ...props 
}, ref) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {type === 'textarea' ? (
        <textarea
          ref={ref}
          className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors ${error ? 'border-red-500' : ''} ${className}`}
          {...props}
        />
      ) : type === 'select' ? (
        <select
          ref={ref}
          className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors ${error ? 'border-red-500' : ''} ${className}`}
          {...props}
        />
      ) : (
        <input
          ref={ref}
          type={type}
          className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors ${error ? 'border-red-500' : ''} ${className}`}
          {...props}
        />
      )}
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
});

FormField.displayName = 'FormField';

export default FormField;
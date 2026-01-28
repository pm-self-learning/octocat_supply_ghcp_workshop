import { useState, FormEvent } from 'react';
import { useTheme } from '../context/ThemeContext';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export default function ContactUs() {
  const { darkMode } = useTheme();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    // Validate email
    // Using a practical email validation pattern that covers most common cases.
    // For stricter RFC 5322 compliance, consider using a dedicated validation library.
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate message
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccessMessage('');

    if (validateForm()) {
      // Form is valid, show success message and clear form
      setSuccessMessage('Thank you for contacting us!');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
      setErrors({});
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
    // Clear success message when user starts modifying the form
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  return (
    <div
      className={`min-h-screen ${darkMode ? 'bg-dark text-light' : 'bg-gray-50 text-gray-900'} pt-20 pb-12 transition-colors duration-300`}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1
            className={`text-4xl font-bold mb-4 ${darkMode ? 'text-light' : 'text-gray-900'}`}
          >
            Contact Us
          </h1>
          <p
            className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
          >
            Have a question or need assistance? We'd love to hear from you!
          </p>
        </div>

        {successMessage && (
          <div
            className={`mb-6 p-4 rounded-md ${darkMode ? 'bg-green-900/30 border border-green-500 text-green-300' : 'bg-green-100 border border-green-400 text-green-700'}`}
            role="alert"
            aria-live="assertive"
          >
            {successMessage}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-8 transition-colors duration-300`}
          noValidate
        >
          <div className="mb-6">
            <label
              htmlFor="name"
              className={`block text-sm font-medium mb-2 ${darkMode ? 'text-light' : 'text-gray-700'}`}
            >
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none ${
                errors.name
                  ? 'border-red-500'
                  : darkMode
                    ? 'border-gray-600 bg-gray-700 text-light'
                    : 'border-gray-300 bg-white text-gray-900'
              } transition-colors duration-300`}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && (
              <p
                id="name-error"
                className="mt-1 text-sm text-red-500"
                role="alert"
              >
                {errors.name}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label
              htmlFor="email"
              className={`block text-sm font-medium mb-2 ${darkMode ? 'text-light' : 'text-gray-700'}`}
            >
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none ${
                errors.email
                  ? 'border-red-500'
                  : darkMode
                    ? 'border-gray-600 bg-gray-700 text-light'
                    : 'border-gray-300 bg-white text-gray-900'
              } transition-colors duration-300`}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <p
                id="email-error"
                className="mt-1 text-sm text-red-500"
                role="alert"
              >
                {errors.email}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label
              htmlFor="subject"
              className={`block text-sm font-medium mb-2 ${darkMode ? 'text-light' : 'text-gray-700'}`}
            >
              Subject
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none ${
                darkMode
                  ? 'border-gray-600 bg-gray-700 text-light'
                  : 'border-gray-300 bg-white text-gray-900'
              } transition-colors duration-300`}
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="message"
              className={`block text-sm font-medium mb-2 ${darkMode ? 'text-light' : 'text-gray-700'}`}
            >
              Message *
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={6}
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none resize-none ${
                errors.message
                  ? 'border-red-500'
                  : darkMode
                    ? 'border-gray-600 bg-gray-700 text-light'
                    : 'border-gray-300 bg-white text-gray-900'
              } transition-colors duration-300`}
              aria-invalid={!!errors.message}
              aria-describedby={errors.message ? 'message-error' : undefined}
            />
            {errors.message && (
              <p
                id="message-error"
                className="mt-1 text-sm text-red-500"
                role="alert"
              >
                {errors.message}
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-primary hover:bg-accent text-white font-medium px-8 py-3 rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Send Message
            </button>
          </div>
        </form>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div
              className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${darkMode ? 'bg-primary/20' : 'bg-primary/10'}`}
            >
              <svg
                className="w-6 h-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3
              className={`text-lg font-medium mb-2 ${darkMode ? 'text-light' : 'text-gray-900'}`}
            >
              Email
            </h3>
            <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
              support@octocat.supply
            </p>
          </div>

          <div className="text-center">
            <div
              className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${darkMode ? 'bg-primary/20' : 'bg-primary/10'}`}
            >
              <svg
                className="w-6 h-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
            <h3
              className={`text-lg font-medium mb-2 ${darkMode ? 'text-light' : 'text-gray-900'}`}
            >
              Phone
            </h3>
            <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
              +1 (555) 123-4567
            </p>
          </div>

          <div className="text-center">
            <div
              className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${darkMode ? 'bg-primary/20' : 'bg-primary/10'}`}
            >
              <svg
                className="w-6 h-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h3
              className={`text-lg font-medium mb-2 ${darkMode ? 'text-light' : 'text-gray-900'}`}
            >
              Address
            </h3>
            <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
              123 Cat Street, San Francisco, CA 94102
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

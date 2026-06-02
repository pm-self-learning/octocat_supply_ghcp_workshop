import { FormEvent, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const initialForm = {
  name: '',
  email: '',
  company: '',
  subject: '',
  message: '',
};

export default function Contact() {
  const { darkMode } = useTheme();
  const [formData, setFormData] = useState(initialForm);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitted(true);
    setFormData(initialForm);
  };

  const handleChange = (field: keyof typeof initialForm, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
    if (isSubmitted) {
      setIsSubmitted(false);
    }
  };

  return (
    <div
      className={`min-h-screen ${darkMode ? 'bg-dark text-gray-300' : 'bg-gray-100 text-gray-700'} px-4 py-20 transition-colors duration-300`}
    >
      <div className="max-w-6xl mx-auto space-y-8">
        <div
          className={`${darkMode ? 'bg-gray-800 border-primary/20' : 'bg-white border-gray-200'} rounded-lg border shadow-lg p-8 transition-colors duration-300`}
        >
          <span className="inline-flex rounded-full bg-primary/15 px-4 py-2 text-sm font-semibold text-primary">
            Contact Us
          </span>
          <h1
            className={`mt-4 text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} transition-colors duration-300`}
          >
            Let&apos;s plan your next cat tech rollout
          </h1>
          <p className="mt-4 max-w-3xl text-lg">
            Connect with OctoCAT Supply for product guidance, enterprise sourcing questions, or
            help choosing the right AI-powered tools for your feline customers.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr,1.2fr]">
          <section
            className={`${darkMode ? 'bg-gray-800 border-primary/20' : 'bg-white border-gray-200'} rounded-lg border shadow-lg p-8 transition-colors duration-300`}
          >
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Talk with our team
            </h2>
            <div className="mt-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-primary">Customer care</h3>
                <p className="mt-2">support@octocatsupply.com</p>
                <p>+1 (800) 555-MEOW</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary">Sales inquiries</h3>
                <p className="mt-2">sales@octocatsupply.com</p>
                <p>Enterprise onboarding for retailers, clinics, and distributors.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary">Hours</h3>
                <p className="mt-2">Monday - Friday: 8:00 AM - 6:00 PM PT</p>
                <p>Saturday: 9:00 AM - 2:00 PM PT</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary">Visit HQ</h3>
                <p className="mt-2">42 Whisker Way</p>
                <p>Seattle, WA 98101</p>
              </div>
            </div>
          </section>

          <section
            className={`${darkMode ? 'bg-gray-800 border-primary/20' : 'bg-white border-gray-200'} rounded-lg border shadow-lg p-8 transition-colors duration-300`}
          >
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Send us a message
            </h2>
            <p className="mt-3">
              Share a few details and our team will follow up within one business day.
            </p>

            {isSubmitted && (
              <div
                role="status"
                className={`${darkMode ? 'bg-primary/20 text-gray-100' : 'bg-primary/10 text-gray-800'} mt-6 rounded-md border border-primary/30 px-4 py-3`}
              >
                Thanks for reaching out. An OctoCAT specialist will contact you soon.
              </div>
            )}

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-medium">
                  Name
                  <input
                    className={`${darkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-white border-gray-300 text-gray-900'} rounded-md border px-3 py-2 focus:border-primary focus:outline-none`}
                    type="text"
                    value={formData.name}
                    onChange={(event) => handleChange('name', event.target.value)}
                    required
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm font-medium">
                  Email
                  <input
                    className={`${darkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-white border-gray-300 text-gray-900'} rounded-md border px-3 py-2 focus:border-primary focus:outline-none`}
                    type="email"
                    value={formData.email}
                    onChange={(event) => handleChange('email', event.target.value)}
                    required
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-medium">
                  Company
                  <input
                    className={`${darkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-white border-gray-300 text-gray-900'} rounded-md border px-3 py-2 focus:border-primary focus:outline-none`}
                    type="text"
                    value={formData.company}
                    onChange={(event) => handleChange('company', event.target.value)}
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm font-medium">
                  Subject
                  <input
                    className={`${darkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-white border-gray-300 text-gray-900'} rounded-md border px-3 py-2 focus:border-primary focus:outline-none`}
                    type="text"
                    value={formData.subject}
                    onChange={(event) => handleChange('subject', event.target.value)}
                    required
                  />
                </label>
              </div>

              <label className="flex flex-col gap-2 text-sm font-medium">
                Message
                <textarea
                  className={`${darkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-white border-gray-300 text-gray-900'} min-h-36 rounded-md border px-3 py-2 focus:border-primary focus:outline-none`}
                  value={formData.message}
                  onChange={(event) => handleChange('message', event.target.value)}
                  required
                />
              </label>

              <button
                type="submit"
                className="bg-primary hover:bg-accent rounded-md px-6 py-3 font-medium text-white transition-colors"
              >
                Send Message
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}

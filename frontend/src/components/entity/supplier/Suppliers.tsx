import { useState, useMemo } from 'react';
import axios from 'axios';
import { useQuery } from 'react-query';
import { api } from '../../../api/config';
import { useTheme } from '../../../context/ThemeContext';

interface Supplier {
  supplierId: number;
  name: string;
  description: string;
  contactPerson: string;
  email: string;
  phone: string;
  active: boolean;
  verified: boolean;
}

const fetchSuppliers = async (): Promise<Supplier[]> => {
  const { data } = await axios.get(`${api.baseURL}${api.endpoints.suppliers}`);
  return data;
};

export default function Suppliers() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: suppliers, isLoading, error } = useQuery('suppliers', fetchSuppliers, {
    staleTime: 60_000,
  });
  const { darkMode } = useTheme();

  const filteredSuppliers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return suppliers?.filter(
      (supplier) =>
        supplier.name.toLowerCase().includes(term) ||
        supplier.email.toLowerCase().includes(term) ||
        supplier.contactPerson.toLowerCase().includes(term),
    );
  }, [suppliers, searchTerm]);

  if (isLoading) {
    return (
      <div
        className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 px-4 transition-colors duration-300`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 px-4 transition-colors duration-300`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-red-500 text-center">Failed to fetch suppliers</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 pb-16 px-4 transition-colors duration-300`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col space-y-6">
          <h1
            className={`text-3xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'} transition-colors duration-300`}
          >
            Suppliers
          </h1>

          {/* Search input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, email, or contact person..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full px-4 py-2 ${darkMode ? 'bg-gray-800 text-light border-gray-700' : 'bg-white text-gray-800 border-gray-300'} rounded-lg border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors duration-300`}
              aria-label="Search suppliers"
            />
            <svg
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>

          {/* Empty state */}
          {(!filteredSuppliers || filteredSuppliers.length === 0) && (
            <div
              className={`flex flex-col items-center justify-center text-center py-20 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
              role="status"
              aria-live="polite"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-12 w-12 mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"
                />
              </svg>
              <p className={`${darkMode ? 'text-light' : 'text-gray-800'} text-lg font-medium`}>
                No suppliers found
              </p>
              {searchTerm && (
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
                  Try clearing or changing your search filters.
                </p>
              )}
            </div>
          )}

          {/* Supplier cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSuppliers?.map((supplier) => (
              <div
                key={supplier.supplierId}
                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 flex flex-col space-y-3 transition-colors duration-300`}
              >
                <div className="flex items-start justify-between">
                  <h2
                    className={`text-xl font-semibold ${darkMode ? 'text-light' : 'text-gray-800'} transition-colors duration-300`}
                  >
                    {supplier.name}
                  </h2>
                  <div className="flex space-x-1 flex-shrink-0 ml-2">
                    {supplier.active && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    )}
                    {supplier.verified && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Verified
                      </span>
                    )}
                  </div>
                </div>

                {supplier.description && (
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}>
                    {supplier.description}
                  </p>
                )}

                <dl className="space-y-1 text-sm">
                  {supplier.contactPerson && (
                    <div className="flex items-center space-x-2">
                      <svg
                        className={`h-4 w-4 flex-shrink-0 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <dt className="sr-only">Contact person</dt>
                      <dd className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-300`}>
                        {supplier.contactPerson}
                      </dd>
                    </div>
                  )}

                  {supplier.email && (
                    <div className="flex items-center space-x-2">
                      <svg
                        className={`h-4 w-4 flex-shrink-0 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      <dt className="sr-only">Email</dt>
                      <dd>
                        <a
                          href={`mailto:${supplier.email}`}
                          className="text-primary hover:underline transition-colors duration-300"
                        >
                          {supplier.email}
                        </a>
                      </dd>
                    </div>
                  )}

                  {supplier.phone && (
                    <div className="flex items-center space-x-2">
                      <svg
                        className={`h-4 w-4 flex-shrink-0 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      <dt className="sr-only">Phone</dt>
                      <dd className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-300`}>
                        {supplier.phone}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

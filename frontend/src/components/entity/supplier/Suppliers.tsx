import { useState } from 'react';
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

type StatusFilter = 'all' | 'active' | 'inactive';
type VerifiedFilter = 'all' | 'verified' | 'unverified';

export default function Suppliers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [verifiedFilter, setVerifiedFilter] = useState<VerifiedFilter>('all');
  const { data: suppliers, isLoading, error } = useQuery('suppliers', fetchSuppliers);
  const { darkMode } = useTheme();

  const filteredSuppliers = suppliers?.filter((supplier) => {
    const matchesSearch =
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && supplier.active) ||
      (statusFilter === 'inactive' && !supplier.active);

    const matchesVerified =
      verifiedFilter === 'all' ||
      (verifiedFilter === 'verified' && supplier.verified) ||
      (verifiedFilter === 'unverified' && !supplier.verified);

    return matchesSearch && matchesStatus && matchesVerified;
  });

  const inputClass = `px-3 py-2 rounded-lg border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors duration-300 ${
    darkMode ? 'bg-gray-800 text-light border-gray-700' : 'bg-white text-gray-800 border-gray-300'
  }`;

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

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by name, contact or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-4 pr-10 py-2 rounded-lg border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors duration-300 ${
                  darkMode
                    ? 'bg-gray-800 text-light border-gray-700'
                    : 'bg-white text-gray-800 border-gray-300'
                }`}
                aria-label="Search suppliers"
              />
              <svg
                className={`absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Status filter */}
            <div>
              <label htmlFor="status-filter" className="sr-only">
                Filter by status
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className={inputClass}
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Verified filter */}
            <div>
              <label htmlFor="verified-filter" className="sr-only">
                Filter by verification
              </label>
              <select
                id="verified-filter"
                value={verifiedFilter}
                onChange={(e) => setVerifiedFilter(e.target.value as VerifiedFilter)}
                className={inputClass}
              >
                <option value="all">All verifications</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>
          </div>

          {/* Empty state */}
          {(!filteredSuppliers || filteredSuppliers.length === 0) && (
            <div
              className={`flex flex-col items-center justify-center text-center py-20 rounded-lg ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              } shadow-sm border`}
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <p className={`${darkMode ? 'text-light' : 'text-gray-800'} text-lg font-medium`}>
                No suppliers found
              </p>
              {(searchTerm || statusFilter !== 'all' || verifiedFilter !== 'all') && (
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
                  Try clearing or changing your search filters.
                </p>
              )}
            </div>
          )}

          {/* Suppliers table */}
          {filteredSuppliers && filteredSuppliers.length > 0 && (
            <div
              className={`rounded-lg shadow-sm border overflow-hidden ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              }`}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      className={`${
                        darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-600'
                      } text-left`}
                    >
                      <th className="px-4 py-3 font-semibold">Name</th>
                      <th className="px-4 py-3 font-semibold hidden md:table-cell">Contact Person</th>
                      <th className="px-4 py-3 font-semibold hidden lg:table-cell">Email</th>
                      <th className="px-4 py-3 font-semibold hidden lg:table-cell">Phone</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Verified</th>
                    </tr>
                  </thead>
                  <tbody
                    className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}
                  >
                    {filteredSuppliers.map((supplier) => (
                      <tr
                        key={supplier.supplierId}
                        className={`transition-colors duration-150 ${
                          darkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div
                            className={`font-medium ${darkMode ? 'text-light' : 'text-gray-800'}`}
                          >
                            {supplier.name}
                          </div>
                          {supplier.description && (
                            <div
                              className={`text-xs mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'} line-clamp-1`}
                            >
                              {supplier.description}
                            </div>
                          )}
                        </td>
                        <td
                          className={`px-4 py-3 hidden md:table-cell ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                        >
                          {supplier.contactPerson}
                        </td>
                        <td
                          className={`px-4 py-3 hidden lg:table-cell ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                        >
                          <a
                            href={`mailto:${supplier.email}`}
                            className="hover:text-primary transition-colors"
                          >
                            {supplier.email}
                          </a>
                        </td>
                        <td
                          className={`px-4 py-3 hidden lg:table-cell ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                        >
                          {supplier.phone}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              supplier.active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {supplier.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              supplier.verified
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {supplier.verified ? 'Verified' : 'Unverified'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

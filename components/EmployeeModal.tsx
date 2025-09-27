
import React, { useState, useEffect } from 'react';
import { XIcon, SaveIcon } from './icons/Icons';
import type { Employee } from '../types';

interface EmployeeModalProps {
  onClose: () => void;
  onSave: (employee: Omit<Employee, 'id'> | Employee) => void;
  employeeToEdit?: Employee | null;
}

const EmployeeModal: React.FC<EmployeeModalProps> = ({ onClose, onSave, employeeToEdit }) => {
    const [name, setName] = useState('');
    const [telegramId, setTelegramId] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (employeeToEdit) {
            setName(employeeToEdit.name);
            setTelegramId(employeeToEdit.telegramId);
        }
    }, [employeeToEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!name.trim() || !telegramId.trim()) {
            setError('Both name and Telegram ID are required.');
            return;
        }
        if (!/^\d+$/.test(telegramId.trim())) {
            setError('Telegram ID must be a sequence of numbers.');
            return;
        }

        const employeeData = { name: name.trim(), telegramId: telegramId.trim() };
        if (employeeToEdit) {
            onSave({ ...employeeToEdit, ...employeeData });
        } else {
            onSave(employeeData);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-[#242f3d] rounded-2xl shadow-2xl w-full max-w-md text-black dark:text-white" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold">{employeeToEdit ? 'Edit Employee' : 'Add New Employee'}</h2>
                    <button onClick={onClose} className="p-1 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white rounded-full">
                        <XIcon className="w-6 h-6" />
                    </button>
                </header>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="employeeName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee Name</label>
                            <input
                                id="employeeName"
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full bg-gray-100 dark:bg-[#17212b] text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., John Doe"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="telegramId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telegram ID</label>
                            <input
                                id="telegramId"
                                type="text"
                                value={telegramId}
                                onChange={e => setTelegramId(e.target.value)}
                                className="w-full bg-gray-100 dark:bg-[#17212b] text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., 123456789"
                                required
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm text-center pt-2">{error}</p>}
                    </div>
                    <footer className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-200 dark:bg-[#17212b] text-black dark:text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-[#0e1621] transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center"
                        >
                            <SaveIcon className="w-5 h-5 mr-2" />
                            Save
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

const styles = `
@keyframes fade-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fade-in {
  animation: fade-in 0.2s ease-out forwards;
}
`;

if (!document.getElementById('employee-modal-styles')) {
    const styleSheet = document.createElement("style");
    styleSheet.id = 'employee-modal-styles';
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}

export default EmployeeModal;

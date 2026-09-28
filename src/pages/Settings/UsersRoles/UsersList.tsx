import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { TableLoadingRow } from '../../../components/ui/TableLoadingRow';
import { TableEmptyRow } from '../../../components/ui/TableEmptyRow';
import { Pagination } from '../../../components/ui/Pagination';
import { useInviteUsers } from '../../../hooks/UsersRoles/useInviteUsers';
import type { InviteUser } from '../../../types/InviteUser';

interface UsersListProps {
  onEdit: (user: InviteUser) => void;
}

export function UsersList({ onEdit }: UsersListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  const { users, total, isLoading, deleteUser } = useInviteUsers(currentPage);

  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));

  const handleDelete = (user: InviteUser) => {
    if (!window.confirm(`Delete ${user.firstname} ${user.lastname ?? ''}? This cannot be undone.`)) return;
    deleteUser(user.uuid);
  };

  const getStatusBadge = (status: boolean) => {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
    return status
      ? `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400`
      : `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400`;
  };

  return (
    <div className="space-y-6 mt-6">
      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] overflow-hidden transition-theme mx-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] whitespace-nowrap">Name</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] whitespace-nowrap">Email</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] whitespace-nowrap">Mobile</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] whitespace-nowrap">Role</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] whitespace-nowrap">Status</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {isLoading ? (
                <TableLoadingRow colSpan={6} label="Loading users…" />
              ) : users.length === 0 ? (
                <TableEmptyRow colSpan={6} label="No users yet." />
              ) : users.map((user) => (
                <tr key={user.uuid} className="hover:bg-[var(--bg-secondary)] transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-[var(--text-primary)] whitespace-nowrap">
                    {user.firstname} {user.lastname ?? ''}
                    {user.usertype !== 4 && (
                      <span className="ml-2 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400">
                        Owner
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-secondary)] whitespace-nowrap">{user.email}</td>
                  <td className="px-4 py-3 text-sm text-[var(--text-secondary)] whitespace-nowrap">{user.mobile ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-[var(--text-secondary)] whitespace-nowrap">{user.role?.name ?? '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={getStatusBadge(user.status)}>{user.status ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(user)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                      >
                        <Pencil size={14} strokeWidth={2.5} />
                        <span>Edit</span>
                      </button>
                      {user.usertype === 4 && (
                        <button
                          onClick={() => handleDelete(user)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                        >
                          <Trash2 size={14} strokeWidth={2.5} />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination currentPage={currentPage} totalPages={totalPages} total={total} perPage={rowsPerPage} onPageChange={setCurrentPage} onPerPageChange={setRowsPerPage} />
      </div>
    </div>
  );
}

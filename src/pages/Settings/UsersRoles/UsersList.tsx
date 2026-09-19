import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Filter, Edit, Trash2 } from 'lucide-react';
import { Pagination } from '../../../components/ui/Pagination';

interface User {
  id: string;
  name: string;
  username: string;
  role: string;
  avatar?: string;
  initials?: string;
  colorClass?: string;
}

const dummyUsers: User[] = [
  { id: '1', name: 'Rebecca Fox', username: '@rebecca', role: 'CEO', avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: '2', name: 'Stanis Ryle', username: '@stanis', role: 'HR Manager', avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: '3', name: 'Brian Lord', username: '@brian', role: 'Finance Manager', avatar: 'https://i.pravatar.cc/150?u=3' },
  { id: '4', name: 'Diane Hall', username: '@diane', role: 'Social Media Manager', avatar: 'https://i.pravatar.cc/150?u=4' },
  { id: '5', name: 'Marie Goodwin', username: '@marie', role: 'Accountant', avatar: 'https://i.pravatar.cc/150?u=5' },
  { id: '6', name: 'Taylor Hardy', username: '@taylor', role: 'Marketing Manager', initials: 'TH', colorClass: 'bg-purple-200 text-purple-700' },
  { id: '7', name: 'Sofia Reynolds', username: '@sofia', role: 'Community Officer', avatar: 'https://i.pravatar.cc/150?u=7' },
  { id: '8', name: 'Gabriel Allen', username: '@gabriel', role: 'Support', initials: 'GA', colorClass: 'bg-blue-200 text-blue-700' },
  { id: '9', name: 'Benjamin Hunter', username: '@benjamin', role: 'Research Analyst', avatar: 'https://i.pravatar.cc/150?u=9' },
  { id: '10', name: 'Edward Crawford', username: '@edward', role: 'Business Consultant', avatar: 'https://i.pravatar.cc/150?u=10' },
  { id: '11', name: 'Amber Foster', username: '@amber', role: 'Support', initials: 'AF', colorClass: 'bg-green-200 text-green-700' },
  { id: '12', name: 'Amber Foster', username: '@amber', role: 'Support', initials: 'AF', colorClass: 'bg-green-200 text-green-700' },
  { id: '13', name: 'Amber Foster', username: '@amber', role: 'Support', initials: 'AF', colorClass: 'bg-green-200 text-green-700' },
  { id: '14', name: 'Amber Foster', username: '@amber', role: 'Support', initials: 'AF', colorClass: 'bg-green-200 text-green-700' },
  { id: '15', name: 'Amber Foster', username: '@amber', role: 'Support', initials: 'AF', colorClass: 'bg-green-200 text-green-700' },
  { id: '15', name: 'Amber Foster', username: '@amber', role: 'Support', initials: 'AF', colorClass: 'bg-green-200 text-green-700' },
];

export function UsersList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(12);

  const [filterOpen, setFilterOpen] = useState(false);
  const [filterDraft, setFilterDraft] = useState({ name: '' });
  const [appliedFilter, setAppliedFilter] = useState({ name: '' });
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Close menu on click outside
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtering
  const filteredUsers = dummyUsers.filter(u =>
    !appliedFilter.name || u.name.toLowerCase().includes(appliedFilter.name.toLowerCase()) || u.username.toLowerCase().includes(appliedFilter.name.toLowerCase())
  );

  // Pagination
  const total = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = filteredUsers.slice(startIndex, startIndex + rowsPerPage);

  return (
    <div className="space-y-6 mt-6">
      {/* Tab Actions Header */}
      <div className="flex justify-end">
        <button
          onClick={() => setFilterOpen(prev => !prev)}
          className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${filterOpen || Object.values(appliedFilter).some(Boolean)
            ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-300'
            : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
            }`}
        >
          <Filter className="w-4 h-4" />
          Filter
          {Object.values(appliedFilter).some(Boolean) && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary-600 text-white rounded-full">
              {Object.values(appliedFilter).filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Filter Accordion */}
      {filterOpen && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-5 py-4 shadow-sm">
          <div className="flex flex-wrap items-end gap-3">
            {([
              { key: 'name', label: 'Name' },
            ] as { key: keyof typeof filterDraft; label: string }[]).map(({ key, label }) => (
              <div key={key} className="flex flex-col gap-1 flex-1 min-w-[120px]">
                <label className="text-xs font-medium text-[var(--text-secondary)]">{label}</label>
                <input
                  type="text"
                  value={filterDraft[key]}
                  onChange={e => setFilterDraft(prev => ({ ...prev, [key]: e.target.value }))}
                  placeholder={`Filter by ${label.toLowerCase()}...`}
                  className="px-3 py-2 text-sm rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            ))}
            <div className="flex items-end gap-2 pb-0.5">
              <button
                onClick={() => { setAppliedFilter({ ...filterDraft }); setCurrentPage(1); }}
                className="px-4 py-2 text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors whitespace-nowrap"
              >
                Apply
              </button>
              <button
                onClick={() => {
                  const empty = { name: '' };
                  setFilterDraft(empty);
                  setAppliedFilter(empty);
                  setFilterOpen(false);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 text-sm font-medium bg-[var(--bg-secondary)] hover:bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg transition-colors whitespace-nowrap"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      {currentData.length === 0 ? (
        <div className="p-12 text-center text-[var(--text-muted)] bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)]">
          No users found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentData.map((user) => (
            <div key={user.id} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow relative">
              {/* Options button */}
              <div className="absolute top-4 right-4" ref={openMenuId === user.id ? menuRef : null}>
                <button
                  onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                  className="cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                {openMenuId === user.id && (
                  <div className="absolute top-6 right-0 w-32 bg-[var(--bg-card)] rounded-md shadow-lg border border-[var(--border-color)] z-10 py-1">
                    <button
                      onClick={() => { setOpenMenuId(null); console.log('Edit', user.id); }}
                      className="cursor-pointer w-full text-left px-4 py-2 hover:bg-[var(--bg-secondary)] flex items-center gap-2 text-sm text-[var(--text-primary)] transition-colors"
                    >
                      <Edit className="w-4 h-4" /> Edit
                    </button>
                    <button
                      onClick={() => { setOpenMenuId(null); console.log('Delete', user.id); }}
                      className="cursor-pointer w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 text-sm text-red-600 dark:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                )}
              </div>

              {/* Avatar */}
              <div className="flex-shrink-0">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm" />
                ) : (
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center font-semibold text-lg border-2 border-white shadow-sm ${user.colorClass}`}>
                    {user.initials}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-col pr-6">
                <span className="font-semibold text-[var(--text-primary)] text-sm">{user.name}</span>
                <span className="text-xs text-[var(--text-muted)] mb-1">{user.username}</span>
                <span className="text-xs font-bold text-[var(--text-primary)] mt-1">{user.role}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] overflow-hidden transition-theme">
        <Pagination currentPage={currentPage} totalPages={totalPages} total={total} perPage={rowsPerPage} onPageChange={setCurrentPage} onPerPageChange={setRowsPerPage} />
      </div>
    </div>
  );
}

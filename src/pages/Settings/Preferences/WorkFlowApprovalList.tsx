import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, SlidersHorizontal } from 'lucide-react';
import { Pagination } from '../../../components/ui/Pagination';
import { useWorkFlowRules } from '../../../hooks/Preferences/useWorkFlowRules';
import type { WorkFlowRule } from '../../../types/WorkFlowRule';

export function WorkFlowApprovalList() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const { rules, total, lastPage, isLoading, handleDeleteWithConfirmation } = useWorkFlowRules(currentPage);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 px-6 pt-6">
        <SlidersHorizontal className="w-6 h-6 text-[var(--text-primary)]" />
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Work Flow Approval</h1>
          <p className="text-[var(--text-secondary)] mt-1">Configure multi-level approval rules for your modules</p>
        </div>
      </div>

      <div className="mx-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)]">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Workflow Rules</h2>
        <button
          type="button"
          onClick={() => navigate('/settings/work-flow-approval/add')}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New
        </button>
      </div>

      <div className="overflow-x-auto relative min-h-[160px]">
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-white/50 dark:bg-black/20 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        )}
        <table className="w-full">
          <thead>
            <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Name</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Module</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Description</th>
              <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {!isLoading && rules.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-[var(--text-muted)]">
                  No workflow rules found.
                </td>
              </tr>
            )}
            {rules.map((rule: WorkFlowRule) => (
              <tr key={rule.uuid} className="hover:bg-[var(--bg-secondary)] transition-colors">
                <td className="px-4 py-4 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => navigate(`/settings/work-flow-approval/edit/${rule.uuid}`)}
                    className="text-sm font-medium text-primary-600 hover:underline"
                  >
                    {rule.name}
                  </button>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">{rule.module}</td>
                <td className="px-4 py-4 text-sm text-[var(--text-secondary)] max-w-[320px] truncate">
                  {rule.description || '—'}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/settings/work-flow-approval/edit/${rule.uuid}`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                    >
                      <Pencil size={14} strokeWidth={2.5} />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteWithConfirmation(rule.uuid)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                    >
                      <Trash2 size={14} strokeWidth={2.5} />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination
          currentPage={currentPage}
          totalPages={lastPage}
          total={total}
          perPage={15}
          onPageChange={setCurrentPage}
          onPerPageChange={() => {}}
          hasLoaded={!isLoading}
        />
      </div>
      </div>
    </div>
  );
}

export default WorkFlowApprovalList;

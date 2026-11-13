import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Download,
  FileText,
  ShieldCheck,
  UserCog,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  DataTable,
  Dialog,
  Field,
  Pagination,
  Select,
  StatCard,
  StatusBadge,
  Tabs,
  Textarea,
  useToast,
} from '@/components/ui';
import type { Column } from '@/components/ui';
import { useDemoData } from '@/hooks/useDemoData';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { administrationService } from '@/services/administrationService';
import type { AuditEntry, Incident, PrivacyRequest } from '@/types';
import { ROLE_LABELS } from '@/types';
import { formatDate, formatDateTime, relativeTime, titleCase } from '@/utils/format';
import { FilterToolbar, PanelEmpty, useAsyncAction, usePagination } from '@/features/app/shared';

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const content = rows
    .map((row) =>
      row
        .map((cell) => {
          const value = String(cell);
          return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
        })
        .join(','),
    )
    .join('\r\n');
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

/* ------------------------------------------------------------------ */
/* Safety incidents                                                    */
/* ------------------------------------------------------------------ */

const incidentStatuses: Incident['status'][] = ['reported', 'triaged', 'investigating', 'escalated', 'resolved'];
const incidentSeverities: Incident['severity'][] = ['low', 'medium', 'high', 'critical'];

export function AdminIncidentsPage() {
  useDocumentTitle('Safety incidents');
  const { user } = useAuth();
  const state = useDemoData();
  const { run, isPending } = useAsyncAction();
  const { toast } = useToast();
  const [tab, setTab] = useState('open');
  const [query, setQuery] = useState('');
  const [severity, setSeverity] = useState('all');
  const [detail, setDetail] = useState<Incident | null>(null);
  const [statusDraft, setStatusDraft] = useState<Incident['status']>('reported');
  const [severityDraft, setSeverityDraft] = useState<Incident['severity']>('medium');
  const [assigneeDraft, setAssigneeDraft] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const handlers = state.users.filter((entry) => entry.role === 'admin' || entry.role === 'facilitator');

  const filtered = state.incidents
    .filter((incident) => {
      if (tab === 'open') return incident.status !== 'resolved';
      if (tab === 'resolved') return incident.status === 'resolved';
      return true;
    })
    .filter((incident) => (severity === 'all' ? true : incident.severity === severity))
    .filter((incident) =>
      `${incident.reference} ${incident.category} ${incident.summary} ${incident.reportedBy}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
    )
    .sort((a, b) => +new Date(b.reportedAt) - +new Date(a.reportedAt));
  const pagination = usePagination(filtered, 8);

  function openIncident(incident: Incident) {
    setDetail(incident);
    setStatusDraft(incident.status);
    setSeverityDraft(incident.severity);
    setAssigneeDraft(incident.assignedTo ?? '');
    setNote('');
    setError('');
  }

  async function saveIncident() {
    if (!detail) return;
    if (statusDraft === 'resolved' && note.trim().length < 15) {
      setError('Record a short resolution note before closing the case.');
      return;
    }
    if (note.trim().length > 0 && note.trim().length < 10) {
      setError('Add at least 10 characters, or leave the note empty.');
      return;
    }
    setError('');
    const patch: Partial<Pick<Incident, 'status' | 'severity' | 'assignedTo'>> = {
      status: statusDraft,
      severity: severityDraft,
      assignedTo: assigneeDraft || undefined,
    };
    const result = await run('incident', () => administrationService.updateIncident(detail.id, patch, note.trim() || undefined), {
      successTitle: 'Incident updated',
      successDescription: 'The case timeline records this change in your browser. Production would notify the assigned handler.',
      onSuccess: () => setDetail(null),
    });
    if (result === undefined) return;
    if (statusDraft === 'resolved') {
      toast({
        title: 'Resolution recorded',
        description: 'Confirm the reporter has been told the outcome and that any support follow-up is scheduled.',
        variant: 'info',
      });
    }
  }

  const columns: Column<Incident>[] = [
    {
      key: 'reference',
      header: 'Case',
      render: (incident) => (
        <div>
          <p className="text-[0.8125rem] font-semibold text-ink">{incident.reference}</p>
          <p className="mt-0.5 text-2xs text-slate">{incident.category}</p>
        </div>
      ),
    },
    {
      key: 'severity',
      header: 'Severity',
      render: (incident) => <StatusBadge status={incident.severity} />,
    },
    {
      key: 'status',
      header: 'Status',
      render: (incident) => <StatusBadge status={incident.status} />,
    },
    {
      key: 'assigned',
      header: 'Assigned to',
      render: (incident) => <span className="text-xs text-slate">{incident.assignedTo ?? 'Unassigned'}</span>,
    },
    {
      key: 'reported',
      header: 'Reported',
      render: (incident) => (
        <span className="text-2xs text-slate" title={formatDateTime(incident.reportedAt)}>
          {relativeTime(incident.reportedAt)}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      render: (incident) => (
        <Button size="sm" variant="outline" onClick={() => openIncident(incident)}>
          Open case
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Safety incidents"
        description="Triage and track safeguarding and conduct concerns. Demonstration records only; no real case data is included."
        eyebrow="Governance"
        actions={
          <Link
            to="/app/admin/audit"
            className="inline-flex min-h-10 items-center gap-2 rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-canvas"
          >
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Audit log
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Open cases"
          value={state.incidents.filter((incident) => incident.status !== 'resolved').length}
          icon={<AlertTriangle className="h-4 w-4" aria-hidden="true" />}
          hint="Excludes resolved cases"
        />
        <StatCard
          label="High or critical"
          value={state.incidents.filter((incident) => incident.severity === 'high' || incident.severity === 'critical').length}
          icon={<AlertTriangle className="h-4 w-4" aria-hidden="true" />}
          hint="Require senior review"
        />
        <StatCard
          label="Unassigned"
          value={state.incidents.filter((incident) => !incident.assignedTo).length}
          icon={<UserCog className="h-4 w-4" aria-hidden="true" />}
        />
        <StatCard
          label="Resolved"
          value={state.incidents.filter((incident) => incident.status === 'resolved').length}
          icon={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
          hint="Retained for audit"
        />
      </div>

      <Tabs
        ariaLabel="Incident status"
        active={tab}
        onChange={setTab}
        items={[
          { id: 'open', label: 'Open', count: state.incidents.filter((incident) => incident.status !== 'resolved').length },
          { id: 'resolved', label: 'Resolved', count: state.incidents.filter((incident) => incident.status === 'resolved').length },
          { id: 'all', label: 'All', count: state.incidents.length },
        ]}
      />

      <FilterToolbar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search reference, category or summary"
        resultLabel={`${filtered.length} of ${state.incidents.length} cases`}
        onReset={() => {
          setQuery('');
          setSeverity('all');
          setTab('open');
        }}
      >
        <Select value={severity} onChange={(event) => setSeverity(event.target.value)} aria-label="Filter by severity">
          <option value="all">All severities</option>
          {incidentSeverities.map((entry) => (
            <option key={entry} value={entry}>
              {titleCase(entry)}
            </option>
          ))}
        </Select>
      </FilterToolbar>

      <Card>
        <CardBody className="p-0">
          <DataTable
            rows={pagination.pageItems}
            columns={columns}
            getRowKey={(incident) => incident.id}
            caption="Safety incidents with severity, status and assigned handler"
            emptyState={
              <PanelEmpty
                title="No cases in this view"
                description="Try a different filter. In production, anyone could raise a concern through a clearly signposted route."
                action={
                  <Button variant="outline" onClick={() => { setTab('all'); setSeverity('all'); setQuery(''); }}>
                    Show all cases
                  </Button>
                }
                icon={<ShieldCheck className="h-5 w-5" aria-hidden="true" />}
              />
            }
          />
        </CardBody>
        <div className="border-t border-line px-5 py-3">
          <Pagination
            page={pagination.page}
            pageCount={pagination.pageCount}
            onChange={pagination.setPage}
            totalLabel={`${filtered.length} cases`}
          />
        </div>
      </Card>

      <Alert variant="warning" title="Handling a real concern">
        Safeguarding cases need a trained handler, a clear escalation route and confidentiality. Do not use this
        demonstration to record a real incident. If someone is at immediate risk, contact local emergency services.
      </Alert>

      <Dialog
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title={detail ? `${detail.reference} · ${detail.category}` : 'Incident'}
        description={detail ? `Reported ${formatDateTime(detail.reportedAt)} by ${detail.reportedBy}` : undefined}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setDetail(null)}>Cancel</Button>
            <Button onClick={() => void saveIncident()} loading={isPending('incident')}>Save case update</Button>
          </>
        }
      >
        {detail && (
          <div className="space-y-5">
            <div className="rounded-md border border-line bg-canvas p-3.5">
              <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Summary</p>
              <p className="mt-1.5 text-xs leading-5 text-slate">{detail.summary}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Status" htmlFor="incident-status">
                <Select id="incident-status" value={statusDraft} onChange={(event) => setStatusDraft(event.target.value as Incident['status'])}>
                  {incidentStatuses.map((entry) => (
                    <option key={entry} value={entry}>{titleCase(entry)}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Severity" htmlFor="incident-severity">
                <Select id="incident-severity" value={severityDraft} onChange={(event) => setSeverityDraft(event.target.value as Incident['severity'])}>
                  {incidentSeverities.map((entry) => (
                    <option key={entry} value={entry}>{titleCase(entry)}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Assigned handler" htmlFor="incident-assignee">
                <Select id="incident-assignee" value={assigneeDraft} onChange={(event) => setAssigneeDraft(event.target.value)}>
                  <option value="">Unassigned</option>
                  {handlers.map((handler) => (
                    <option key={handler.id} value={handler.name}>{handler.name} · {ROLE_LABELS[handler.role]}</option>
                  ))}
                  {assigneeDraft && !handlers.some((handler) => handler.name === assigneeDraft) && (
                    <option value={assigneeDraft}>{assigneeDraft}</option>
                  )}
                </Select>
              </Field>
            </div>

            <Field
              label="Case note"
              htmlFor="incident-note"
              error={error}
              hint="Record decisions and next steps, not speculation about individuals. Leave empty to update the fields only."
              optional
            >
              <Textarea
                id="incident-note"
                rows={4}
                value={note}
                onChange={(event) => { setNote(event.target.value); setError(''); }}
                placeholder="What was decided, who was contacted and what happens next?"
              />
            </Field>

            <div>
              <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Case notes</p>
              {detail.notes.length === 0 ? (
                <p className="mt-1.5 text-xs text-slate">No notes recorded yet.</p>
              ) : (
                <ol className="mt-2 space-y-2.5">
                  {detail.notes.map((entry, index) => (
                    <li key={`${entry.at}-${index}`} className="rounded-md border border-line p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-ink">{entry.author}</p>
                        <span className="text-2xs text-slate">{formatDateTime(entry.at)}</span>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-slate">{entry.body}</p>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            <div>
              <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Timeline</p>
              <ul className="mt-2 space-y-1.5">
                {detail.actions.map((entry, index) => (
                  <li key={`${entry.at}-${index}`} className="flex flex-wrap items-baseline justify-between gap-2 text-2xs text-slate">
                    <span>{entry.action} · {entry.actor}</span>
                    <span>{formatDateTime(entry.at)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {detail.status !== 'resolved' && statusDraft === 'resolved' && (
              <Alert variant="info" title="Before closing">
                Confirm the reporter has been informed of the outcome, any support referral is in place, and the record
                is retained for the required period.
              </Alert>
            )}

            <p className="text-2xs text-slate">
              Handled by {user?.name ?? 'administrator'}. In production, access to this case would be restricted and
              every view logged.
            </p>
          </div>
        )}
      </Dialog>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Privacy requests                                                    */
/* ------------------------------------------------------------------ */

const privacyStatuses: PrivacyRequest['status'][] = ['received', 'identity_check', 'in_progress', 'completed', 'rejected'];
const privacyTypes: PrivacyRequest['type'][] = ['access', 'correction', 'deletion', 'restriction'];

export function AdminPrivacyPage() {
  useDocumentTitle('Privacy requests');
  const state = useDemoData();
  const { run, isPending } = useAsyncAction();
  const { toast } = useToast();
  const [tab, setTab] = useState('open');
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [detail, setDetail] = useState<PrivacyRequest | null>(null);
  const [statusDraft, setStatusDraft] = useState<PrivacyRequest['status']>('received');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const filtered = state.privacyRequests
    .filter((request) => {
      if (tab === 'open') return request.status !== 'completed' && request.status !== 'rejected';
      if (tab === 'closed') return request.status === 'completed' || request.status === 'rejected';
      return true;
    })
    .filter((request) => (type === 'all' ? true : request.type === type))
    .filter((request) => `${request.reference} ${request.requester} ${request.note}`.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
  const pagination = usePagination(filtered, 8);

  function openRequest(request: PrivacyRequest) {
    setDetail(request);
    setStatusDraft(request.status);
    setNote('');
    setError('');
  }

  async function saveRequest() {
    if (!detail) return;
    if ((statusDraft === 'completed' || statusDraft === 'rejected') && note.trim().length < 15) {
      setError('Record how the request was decided before closing it.');
      return;
    }
    if (note.trim().length > 0 && note.trim().length < 10) {
      setError('Add at least 10 characters, or leave the note empty.');
      return;
    }
    setError('');
    const result = await run('privacy', () => administrationService.updatePrivacyRequest(detail.id, statusDraft, note.trim() || undefined), {
      successTitle: 'Request updated',
      successDescription: 'The requester would be notified in production with the outcome and any next step.',
      onSuccess: () => setDetail(null),
    });
    if (result === undefined) return;
    if (statusDraft === 'completed') {
      toast({
        title: 'Check retention exceptions',
        description: 'Some records may need to be retained for safeguarding or audit. Explain any exception to the requester.',
        variant: 'info',
      });
    }
  }

  const columns: Column<PrivacyRequest>[] = [
    {
      key: 'reference',
      header: 'Request',
      render: (request) => (
        <div>
          <p className="text-[0.8125rem] font-semibold text-ink">{request.reference}</p>
          <p className="mt-0.5 text-2xs text-slate">{request.requester}</p>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (request) => <Badge variant="outline">{titleCase(request.type)}</Badge>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (request) => <StatusBadge status={request.status} />,
    },
    {
      key: 'assignee',
      header: 'Assignee',
      render: (request) => <span className="text-xs text-slate">{request.assignee ?? 'Unassigned'}</span>,
    },
    {
      key: 'received',
      header: 'Received',
      render: (request) => <span className="text-2xs text-slate">{formatDate(request.receivedAt)}</span>,
    },
    {
      key: 'action',
      header: 'Action',
      render: (request) => (
        <Button size="sm" variant="outline" onClick={() => openRequest(request)}>
          Open request
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Privacy requests"
        description="Track access, correction, deletion and restriction requests under Uganda Data Protection and Privacy Act, 2019 statutory rights. Demonstration records only."
        eyebrow="Governance"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Open requests"
          value={state.privacyRequests.filter((request) => request.status !== 'completed' && request.status !== 'rejected').length}
          icon={<ShieldCheck className="h-4 w-4" aria-hidden="true" />}
        />
        <StatCard
          label="Awaiting identity check"
          value={state.privacyRequests.filter((request) => request.status === 'identity_check').length}
          icon={<UserCog className="h-4 w-4" aria-hidden="true" />}
          hint="No data disclosed before verification"
        />
        <StatCard
          label="Completed"
          value={state.privacyRequests.filter((request) => request.status === 'completed').length}
          icon={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
        />
        <StatCard
          label="Total received"
          value={state.privacyRequests.length}
          icon={<ClipboardList className="h-4 w-4" aria-hidden="true" />}
        />
      </div>

      <Tabs
        ariaLabel="Privacy request status"
        active={tab}
        onChange={setTab}
        items={[
          {
            id: 'open',
            label: 'Open',
            count: state.privacyRequests.filter((request) => request.status !== 'completed' && request.status !== 'rejected').length,
          },
          {
            id: 'closed',
            label: 'Closed',
            count: state.privacyRequests.filter((request) => request.status === 'completed' || request.status === 'rejected').length,
          },
          { id: 'all', label: 'All', count: state.privacyRequests.length },
        ]}
      />

      <FilterToolbar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search reference, requester or note"
        resultLabel={`${filtered.length} of ${state.privacyRequests.length} requests`}
        onReset={() => {
          setQuery('');
          setType('all');
          setTab('open');
        }}
      >
        <Select value={type} onChange={(event) => setType(event.target.value)} aria-label="Filter by request type">
          <option value="all">All types</option>
          {privacyTypes.map((entry) => (
            <option key={entry} value={entry}>{titleCase(entry)}</option>
          ))}
        </Select>
      </FilterToolbar>

      <Card>
        <CardBody className="p-0">
          <DataTable
            rows={pagination.pageItems}
            columns={columns}
            getRowKey={(request) => request.id}
            caption="Privacy requests with type, status and assignee"
            emptyState={
              <PanelEmpty
                title="No requests in this view"
                description="Try a different filter. In production, requests would arrive through a documented route with a response deadline."
                action={<Button variant="outline" onClick={() => { setTab('all'); setType('all'); setQuery(''); }}>Show all requests</Button>}
                icon={<FileText className="h-5 w-5" aria-hidden="true" />}
              />
            }
          />
        </CardBody>
        <div className="border-t border-line px-5 py-3">
          <Pagination
            page={pagination.page}
            pageCount={pagination.pageCount}
            onChange={pagination.setPage}
            totalLabel={`${filtered.length} requests`}
          />
        </div>
      </Card>

      <Alert variant="info" title="Response process">
        Verify identity before disclosing or deleting anything. Explain any retention exception in plain language, keep a
        record of the decision, and never ask for more identity data than the check requires.
      </Alert>

      <Dialog
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title={detail ? `${detail.reference} · ${titleCase(detail.type)} request` : 'Privacy request'}
        description={detail ? `Received ${formatDate(detail.receivedAt)} · ${detail.requester}` : undefined}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setDetail(null)}>Cancel</Button>
            <Button onClick={() => void saveRequest()} loading={isPending('privacy')}>Save request update</Button>
          </>
        }
      >
        {detail && (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-md bg-canvas p-3">
                <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Type</p>
                <p className="mt-1 text-xs font-medium text-ink">{titleCase(detail.type)}</p>
              </div>
              <div className="rounded-md bg-canvas p-3">
                <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Current status</p>
                <div className="mt-1.5"><StatusBadge status={detail.status} /></div>
              </div>
              <div className="rounded-md bg-canvas p-3">
                <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Assignee</p>
                <p className="mt-1 text-xs font-medium text-ink">{detail.assignee ?? 'Unassigned'}</p>
              </div>
            </div>

            <div className="rounded-md border border-line p-3.5">
              <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Case log</p>
              <p className="mt-1.5 whitespace-pre-line text-xs leading-5 text-slate">{detail.note}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Status" htmlFor="privacy-status" hint="Identity must be verified before disclosure or deletion.">
                <Select id="privacy-status" value={statusDraft} onChange={(event) => setStatusDraft(event.target.value as PrivacyRequest['status'])}>
                  {privacyStatuses.map((entry) => (
                    <option key={entry} value={entry}>{titleCase(entry)}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Decision note" htmlFor="privacy-note" error={error} optional hint="Appended to the case log.">
                <Textarea
                  id="privacy-note"
                  rows={3}
                  value={note}
                  onChange={(event) => { setNote(event.target.value); setError(''); }}
                  placeholder="What was checked, decided and communicated?"
                />
              </Field>
            </div>

            {statusDraft === 'completed' && detail.status !== 'completed' && (
              <Alert variant="warning" title="Before completing">
                Confirm the response was sent, any export was shared through an approved secure channel, and the decision
                record is retained. Some records may need to be kept for legal or safeguarding reasons.
              </Alert>
            )}

            {statusDraft === 'rejected' && detail.status !== 'rejected' && (
              <Alert variant="warning" title="Rejecting a request">
                Give a clear reason the requester can understand, tell them how to complain, and record who approved the
                decision.
              </Alert>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Audit log                                                           */
/* ------------------------------------------------------------------ */

export function AdminAuditPage() {
  useDocumentTitle('Audit log');
  const state = useDemoData();
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [outcome, setOutcome] = useState('all');
  const [role, setRole] = useState('all');
  const [detail, setDetail] = useState<AuditEntry | null>(null);

  const roles = useMemo(
    () => [...new Set(state.auditLog.map((entry) => entry.actorRole))].sort(),
    [state.auditLog],
  );

  const filtered = state.auditLog
    .filter((entry) => (outcome === 'all' ? true : entry.outcome === outcome))
    .filter((entry) => (role === 'all' ? true : entry.actorRole === role))
    .filter((entry) =>
      `${entry.action} ${entry.actor} ${entry.target} ${entry.metadata}`.toLowerCase().includes(query.trim().toLowerCase()),
    )
    .sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
  const pagination = usePagination(filtered, 12);

  function exportLog() {
    downloadCsv('youthrise-demo-audit-log.csv', [
      ['Timestamp', 'Actor', 'Role', 'Action', 'Target', 'Outcome', 'Metadata'],
      ...filtered.map((entry) => [
        entry.timestamp,
        entry.actor,
        ROLE_LABELS[entry.actorRole],
        entry.action,
        entry.target,
        titleCase(entry.outcome),
        entry.metadata,
      ]),
    ]);
    toast({
      title: 'Audit log exported',
      description: `${filtered.length} demonstration entries. An export is itself a sensitive action and should be logged in production.`,
      variant: 'success',
    });
  }

  const columns: Column<AuditEntry>[] = [
    {
      key: 'when',
      header: 'When',
      render: (entry) => (
        <span className="text-2xs text-slate" title={formatDateTime(entry.timestamp)}>
          {relativeTime(entry.timestamp)}
        </span>
      ),
    },
    {
      key: 'actor',
      header: 'Actor',
      render: (entry) => (
        <div>
          <p className="text-xs font-semibold text-ink">{entry.actor}</p>
          <p className="mt-0.5 text-2xs text-slate">{ROLE_LABELS[entry.actorRole]}</p>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      render: (entry) => (
        <div>
          <p className="text-xs text-ink">{entry.action}</p>
          <p className="mt-0.5 text-2xs text-slate">{entry.target}</p>
        </div>
      ),
    },
    {
      key: 'outcome',
      header: 'Outcome',
      render: (entry) => <StatusBadge status={entry.outcome} />,
    },
    {
      key: 'action-detail',
      header: 'Detail',
      render: (entry) => (
        <Button size="sm" variant="ghost" onClick={() => setDetail(entry)}>
          Inspect
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit log"
        description="An append-only record of sensitive actions. Demonstration entries only; nothing here describes a real person or system."
        eyebrow="Governance"
        actions={
          <Button variant="outline" onClick={exportLog} iconLeft={<Download className="h-4 w-4" aria-hidden="true" />}>
            Export filtered log
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Entries" value={state.auditLog.length} icon={<ClipboardList className="h-4 w-4" aria-hidden="true" />} />
        <StatCard
          label="Successful actions"
          value={state.auditLog.filter((entry) => entry.outcome === 'success').length}
          icon={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
        />
        <StatCard
          label="Denied attempts"
          value={state.auditLog.filter((entry) => entry.outcome === 'denied').length}
          icon={<ShieldCheck className="h-4 w-4" aria-hidden="true" />}
          hint="Permission boundary enforced"
        />
        <StatCard
          label="Failed actions"
          value={state.auditLog.filter((entry) => entry.outcome === 'failed').length}
          icon={<AlertTriangle className="h-4 w-4" aria-hidden="true" />}
        />
      </div>

      <FilterToolbar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search action, actor, target or detail"
        resultLabel={`${filtered.length} of ${state.auditLog.length} entries`}
        onReset={() => {
          setQuery('');
          setOutcome('all');
          setRole('all');
        }}
      >
        <Select value={outcome} onChange={(event) => setOutcome(event.target.value)} aria-label="Filter by outcome">
          <option value="all">All outcomes</option>
          <option value="success">Success</option>
          <option value="denied">Denied</option>
          <option value="failed">Failed</option>
        </Select>
        <Select value={role} onChange={(event) => setRole(event.target.value)} aria-label="Filter by actor role">
          <option value="all">All roles</option>
          {roles.map((entry) => (
            <option key={entry} value={entry}>{ROLE_LABELS[entry]}</option>
          ))}
        </Select>
      </FilterToolbar>

      <Card>
        <CardBody className="p-0">
          <DataTable
            rows={pagination.pageItems}
            columns={columns}
            getRowKey={(entry) => entry.id}
            caption="Audit log entries with actor, action, target and outcome"
            emptyState={
              <PanelEmpty
                title="No entries match"
                description="Try a different outcome, role or search term."
                action={<Button variant="outline" onClick={() => { setQuery(''); setOutcome('all'); setRole('all'); }}>Reset filters</Button>}
                icon={<ClipboardList className="h-5 w-5" aria-hidden="true" />}
              />
            }
          />
        </CardBody>
        <div className="border-t border-line px-5 py-3">
          <Pagination
            page={pagination.page}
            pageCount={pagination.pageCount}
            onChange={pagination.setPage}
            totalLabel={`${filtered.length} entries`}
          />
        </div>
      </Card>

      <Alert variant="info" title="Audit integrity">
        A production audit log must be append-only, time-stamped by the server, retained for a defined period and
        protected from editing. Reading or exporting the log is itself a sensitive action that should be recorded.
      </Alert>

      <Dialog
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title={detail?.action ?? 'Audit entry'}
        description={detail ? `${formatDateTime(detail.timestamp)} · ${detail.actor}` : undefined}
        size="lg"
        footer={<Button variant="outline" onClick={() => setDetail(null)}>Close</Button>}
      >
        {detail && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md bg-canvas p-3">
                <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Actor role</p>
                <p className="mt-1 text-xs font-medium text-ink">{ROLE_LABELS[detail.actorRole]}</p>
              </div>
              <div className="rounded-md bg-canvas p-3">
                <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Outcome</p>
                <div className="mt-1.5"><StatusBadge status={detail.outcome} /></div>
              </div>
            </div>
            <div>
              <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Target</p>
              <p className="mt-1 text-xs text-ink">{detail.target}</p>
            </div>
            <div>
              <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Metadata</p>
              <p className="mt-1 rounded-md border border-line bg-canvas p-3 font-mono text-2xs leading-5 text-slate">
                {detail.metadata}
              </p>
            </div>
            <Alert variant="warning" title="Sensitive record">
              Audit metadata can contain personal data. Share it only with people who need it for a specific
              investigation or assurance task.
            </Alert>
          </div>
        )}
      </Dialog>

      <Card>
        <CardHeader title="What is recorded" />
        <CardBody className="space-y-2.5 text-xs leading-5 text-slate">
          <p className="flex gap-2">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal" aria-hidden="true" />
            Role changes, account suspension, content publication, exports, privacy decisions and safeguarding case access.
          </p>
          <p className="flex gap-2">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal" aria-hidden="true" />
            The actor, the target, the outcome and the reason where one is required.
          </p>
          <p className="flex gap-2">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal" aria-hidden="true" />
            Nothing that would be needed to reconstruct a password, token or full identity document.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}

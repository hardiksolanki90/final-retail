# Complaints & Feedback

## Scope

Complaints & Feedback captures merchandising complaints and suggestions. The first web delivery includes:

- an organisation-scoped, server-paginated list with field filters;
- a create drawer;
- a split record detail view with existing images.

Edit, delete, import/export, workflow actions, and web image upload are outside this delivery.

## Contract

The canonical record fields are Date, Route, Complaint ID, Merchandiser, Feedback Title, Item, Type, Description, and Images.

- `type` is `complaint` or `suggestion`;
- Item is required for complaints and optional for suggestions;
- the server sets Date and generates an organisation-unique Complaint ID;
- Route is derived from the merchandiser's assigned route and may be null;
- images are read-only in the web client and remain available for mobile or legacy-created records.

Authenticated API routes:

- `GET /api/complaint-feedback/list`
- `GET /api/complaint-feedback/edit/{uuid}`
- `POST /api/complaint-feedback/add`

List filters support date, route, Complaint ID, merchandiser, title, item code/name, and type. Responses use the application's normalized camel-case resource and pagination conventions.

## Non-functional requirements

- All parent and relation lookups are organisation-scoped.
- API actions require `complaint-feedback.view` or `complaint-feedback.create`.
- List filtering and pagination execute in the database.
- Create and code generation execute transactionally.
- Missing Route is a supported state, displayed as an em dash.
- Loading, empty, validation, forbidden, and no-image states are explicit.

## Schema compatibility

The legacy NFPC database defines `complaint_feedbacks` and `complaint_feedback_images`. The Final Retail migration is non-destructive: it creates these tables only when absent. Existing installations keep their tables and data.

Live schema inspection was attempted before implementation, but the configured `mariadb` host was unavailable in the local environment. Migration structure therefore supports both greenfield Final Retail databases and existing legacy tables.

## Decision log

- Use native Final Retail controller/repository/resource and React Query patterns instead of legacy endpoints.
- Replace the current CRM-style mock fields with merchandising fields from the reference.
- Keep images display-only on the web in v1.
- Derive Date, Complaint ID, and Route on the server.
- Use indexed database pagination instead of legacy in-memory slicing.

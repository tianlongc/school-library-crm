# School Library CRM

A role-based school library circulation system built with Laravel and Inertia React. It provides staff with book, category, member, and loan management while giving members a self-service catalogue and current-loan dashboard.

## MVP capabilities

### Library staff

- Manage books and categories.
- See total and currently available copies for each title.
- Search the book catalogue by title, author, or ISBN.
- Issue, renew, and return loans.
- View active, overdue, return-requested, and returned loans.
- Search and manage member records.
- Suspend, deactivate, and reactivate memberships according to role permissions.

### Members

- Register and sign in with a Member account.
- Browse and search the available catalogue.
- Borrow an available book.
- Review current loans and due dates.
- Request returns for their own active loans.
- See borrowing restrictions caused by membership status or overdue loans.

### Administrators

- Access the staff workspace.
- Manage user roles.
- Reactivate suspended or inactive members.

## Membership rules

| Status | Sign in | View current loans | Browse catalogue | Borrow | Return own loans |
| --- | --- | --- | --- | --- | --- |
| Active | Yes | Yes | Yes | Yes | Yes |
| Suspended | Yes | Yes | Yes | No | Yes |
| Inactive | Yes | Yes | No | No | Yes |

Authentication and borrowing status are intentionally separate. `User` represents identity and authentication, while `Member` represents the borrowing profile. Deactivating a membership therefore restricts library activity without disabling the underlying user account.

## Circulation rules

- Available copies are calculated as total copies minus active, unreturned loans.
- Returned loans do not reduce availability.
- A member cannot borrow the same title twice concurrently.
- Members with an overdue loan cannot borrow another book until the overdue loan is returned.
- Overdue status is derived from an unreturned loan whose due date has passed.
- Staff can renew an eligible active loan once, adding 14 days from its current due date.
- Returned, return-requested, and overdue loans cannot be renewed.
- Suspended or inactive members, members with another overdue loan, and archived books are not eligible for renewal.
- Each renewal records the staff actor and the previous and new due dates.
- Books with active loans cannot be removed, and their copy count cannot be reduced below the number of active loans.

## Technology

- PHP 8.3 or newer
- Laravel 13
- MySQL
- Inertia.js 2 with React 19
- Ant Design 6 and Tailwind CSS 3
- Spatie Laravel Permission
- Pest 5
- Vite 8

## Local setup

1. Clone the repository and enter the project directory.

   ```bash
   git clone https://github.com/tianlongc/school-library-crm.git
   cd school-library-crm
   ```

2. Install backend and frontend dependencies.

   ```bash
   composer install
   npm install
   ```

3. Create the environment file and application key.

   On Windows PowerShell:

   ```powershell
   Copy-Item .env.example .env
   php artisan key:generate
   ```

   On macOS or Linux:

   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. Create a MySQL database named `school_library_crm`, then update the `DB_*` values in `.env` if required.

5. Run the migrations and seed the roles and permissions.

   ```bash
   php artisan migrate --seed
   ```

6. Build the frontend assets.

   ```bash
   npm run build
   ```

Laravel Herd users can open the project at `http://school-library-crm.test`. During frontend development, run `npm run dev` for Vite hot reloading.

Public registration creates Member accounts. Staff and administrator roles should be assigned only through an authorized administrator or a controlled local bootstrap process.

## Quality checks

Run the automated test suite:

```bash
php artisan test --compact
```

Format changed PHP files:

```bash
vendor/bin/pint --dirty --format agent
```

Verify the production frontend build:

```bash
npm run build
```

## Current MVP boundaries

The current MVP does not yet include monetary penalty calculation, automated notifications, scheduled overdue processing, or spreadsheet exports. Overdue status is calculated dynamically from loan dates, so a daily task is not required for the current circulation workflow.

Recommended post-MVP additions include configurable loan policies, notification delivery, reporting and spreadsheet export, broader audit history, administrator-managed account disabling, and deployment-specific account provisioning.

## License

This project is available under the [MIT License](https://opensource.org/licenses/MIT).

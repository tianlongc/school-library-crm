---
paths:
  - 'app/Domain/Member/**'
---

# Member

## Model borrowers as Members
Use Member as the sole borrowing identity; do not add student or teacher types until their behavior differs. A User may have one Member, while librarian and admin remain independent Spatie roles. Public registration is the only Member-account creation path, and Member status governs borrowing access.

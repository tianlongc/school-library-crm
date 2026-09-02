---
paths:
  - 'app/Domain/Loan/**'
---

# Loan

## Complete returns only after staff confirmation
Members may request a return, but return_requested_at does not complete the loan. Keep returned_at null so the copy remains unavailable and overdue blocking remains active until staff physically receives the book and confirms the return. Only staff confirmation sets returned_at and returned_by_user_id.

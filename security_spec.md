# EduTrack Firestore Security Specification

## 1. Data Invariants

- **User Role Immutability**: Ordinary users can never elevate their own role to 'instructor'. The role field is set to 'student' upon registration and cannot be modified by the client. Role promotion must occur via Firebase Console / Admin tool.
- **Course Ownership**: Courses can only be created by users whose Firestore role is 'instructor'. Only the owning instructor can modify or delete their course.
- **Lesson Authorization**: Lessons can only be created, updated, or deleted by the instructor who owns the course.
- **Enrollment Integrity**: A student can only create an enrollment for themselves (`studentId == request.auth.uid`). A student cannot modify another student's enrollment record.
- **Progress Tracking Integrity**: A student can only create or update progress records for their own user ID (`studentId == request.auth.uid`).
- **PII Isolation**: Non-instructor user profiles are strictly private to the user themselves. Instructor public profiles can be retrieved to display instructor credentials on courses.

## 2. The Dirty Dozen Payloads (Targeting PERMISSION_DENIED)

1. **Role Escalation Attack**: A student creates a user document with `role: "instructor"` or updates their role to `"instructor"`.
2. **Impersonated User Write**: A user creates/updates `/users/{victimId}` where `request.auth.uid != victimId`.
3. **Ghost Field Poisoning**: A user injects unwanted administrative flags like `{ isAdmin: true, bypassPayment: true }` into a course or user document.
4. **Student Course Creation**: A user with `role: "student"` attempts to create a document in `/courses/`.
5. **Unauthorized Course Mutation**: Instructor A attempts to update or delete a course owned by Instructor B.
6. **Instructor Hijacking**: Updating a course and attempting to change `instructorId` to another user.
7. **Unauthorized Lesson Creation**: A student or non-owning instructor creates a lesson under another instructor's course.
8. **Lesson Hijacking**: Changing the `courseId` or `instructorId` of an existing lesson during an update.
9. **Fake Enrollment Spoofing**: User A attempts to create an enrollment record with `studentId: "userB"`.
10. **Progress Spoofing**: User A attempts to mark lessons complete on behalf of User B (`studentId: "userB"`).
11. **Denial-of-Wallet Payload**: An attacker attempts to write an oversized string (> 50,000 characters) into course description or lesson title.
12. **Unauthenticated Access**: An unauthenticated user attempts to create, update, or delete any course, lesson, enrollment, or progress record.

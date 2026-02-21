# Feature Specification: Login Screen Redesign

**Feature Branch**: `006-login-screen-redesign`
**Created**: 2026-02-21
**Status**: Draft
**Input**: User description: "Refactor login and registration screens to match RPG-themed dark design mockup"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - RPG-Themed Login Screen (Priority: P1)

A user opens the application and sees a visually immersive, dark-themed login screen inspired by fantasy RPG aesthetics. The screen features a castle/fortress logo, thematic labels ("Grandmaster ID", "Secret Sigil"), and a golden "Enter the Sanctum" call-to-action button. The user enters their credentials and logs in.

**Why this priority**: The login screen is the first impression of the application. Matching the design mockup is the core deliverable of this feature.

**Independent Test**: Can be fully tested by navigating to the login page, verifying visual elements match the mockup, entering credentials, and successfully logging in.

**Acceptance Scenarios**:

1. **Given** the user is not authenticated, **When** they navigate to the login page, **Then** they see a dark-themed screen with a castle/fortress logo in a purple diamond, "DUNGEON MASTER" title, and "Campaign Management Suite" subtitle.
2. **Given** the login screen is displayed, **When** the user views the form, **Then** they see a "GRANDMASTER ID" field with an @ icon prefix and placeholder "scroll-keeper@realm.com", and a "SECRET SIGIL" field with a key icon prefix and masked password dots.
3. **Given** the login screen is displayed, **When** the user views the password field, **Then** they see a "FORGOTTEN?" link to the right of the label and a visibility toggle (eye icon) inside the input field.
4. **Given** valid credentials are entered, **When** the user clicks the golden "Enter the Sanctum" button (with lock icon), **Then** they are authenticated and redirected to the home page.
5. **Given** invalid credentials are entered, **When** the user submits the form, **Then** an error message is displayed in a style consistent with the dark theme.

---

### User Story 2 - Navigate to Registration from Login (Priority: P2)

A user who does not have an account sees an "OR JOIN THE GUILD" divider below the login button, followed by an outlined "Create New Campaign" button. Clicking it navigates them to the registration page.

**Why this priority**: Registration access from the login screen is essential for new user onboarding, but secondary to the login experience itself.

**Independent Test**: Can be fully tested by loading the login page, locating the "Create New Campaign" button, clicking it, and verifying navigation to the registration route.

**Acceptance Scenarios**:

1. **Given** the login screen is displayed, **When** the user scrolls below the login button, **Then** they see an "OR JOIN THE GUILD" text divider with horizontal lines on both sides.
2. **Given** the divider is visible, **When** the user looks below it, **Then** they see an outlined "Create New Campaign" button.
3. **Given** the "Create New Campaign" button is visible, **When** the user clicks it, **Then** they are navigated to the registration page.

---

### User Story 3 - Registration Screen Theming (Priority: P3)

The registration screen adopts the same dark RPG theme as the login screen, maintaining visual consistency with thematic styling, colors, and typography while keeping its existing form fields (username, email, password, confirm password).

**Why this priority**: Visual consistency across auth screens is important but the registration screen is visited less frequently than login.

**Independent Test**: Can be fully tested by navigating to the registration page and verifying the dark theme, colors, and typography match the login screen style.

**Acceptance Scenarios**:

1. **Given** the user navigates to the registration page, **When** the page loads, **Then** the same dark background, purple accents, and golden button styling from the login screen are applied.
2. **Given** the registration form is displayed, **When** the user views the form fields, **Then** the inputs use the same dark-themed styling with rounded borders and icon prefixes.
3. **Given** the registration page is displayed, **When** the user looks for navigation, **Then** there is a link to return to the login page, styled consistently with the theme.

---

### User Story 4 - Password Visibility Toggle (Priority: P4)

A user can toggle the visibility of their password in the "Secret Sigil" field by clicking the eye icon on the right side of the input. This allows them to verify what they have typed.

**Why this priority**: Password visibility toggle is a usability enhancement shown in the design but is secondary to core visual and functional requirements.

**Independent Test**: Can be fully tested by entering text in the password field, clicking the eye icon, and verifying the input type toggles between password and text.

**Acceptance Scenarios**:

1. **Given** the password field contains text, **When** the user clicks the eye icon, **Then** the password becomes visible (input type changes from password to text).
2. **Given** the password is visible, **When** the user clicks the eye icon again, **Then** the password is masked again (input type changes back to password).

---

### Edge Cases

- What happens when the screen is viewed on a small mobile device? The layout should remain centered and usable with appropriate padding.
- What happens when the username/password fields are empty and the user clicks "Enter the Sanctum"? Validation errors should be displayed in a style consistent with the dark theme.
- What happens when the "FORGOTTEN?" link is clicked? It should be a non-functional placeholder for now (no password reset feature exists).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a dark-themed login screen with a deep navy/dark purple background.
- **FR-002**: System MUST display a castle/fortress logo in a purple diamond shape at the top of the login screen, with a key icon overlay.
- **FR-003**: System MUST display "DUNGEON MASTER" as the main title in a large, bold display font, followed by "Campaign Management Suite" as a subtitle.
- **FR-004**: System MUST label the username/email input field as "GRANDMASTER ID" in bold uppercase, with an @ icon prefix inside the input field and placeholder text "scroll-keeper@realm.com".
- **FR-005**: System MUST label the password input field as "SECRET SIGIL" in bold uppercase, with a key icon prefix inside the input field.
- **FR-006**: System MUST display a "FORGOTTEN?" link aligned to the right of the "SECRET SIGIL" label.
- **FR-007**: System MUST include a visibility toggle (eye icon) on the right side of the password input field to show/hide the password.
- **FR-008**: System MUST display a full-width golden/yellow "Enter the Sanctum" submit button with a lock icon.
- **FR-009**: System MUST display an "OR JOIN THE GUILD" text divider with horizontal lines on both sides, separating login from registration navigation.
- **FR-010**: System MUST display an outlined "Create New Campaign" button below the divider that navigates to the registration page.
- **FR-011**: System MUST apply the same dark theme to the registration screen, maintaining visual consistency with the login screen.
- **FR-012**: System MUST preserve all existing form validation logic (required fields, minimum lengths, email format, password matching on registration).
- **FR-013**: System MUST preserve all existing authentication functionality (login, registration, token handling, navigation).
- **FR-014**: Input fields MUST have dark backgrounds with rounded borders, consistent with the dark theme.
- **FR-015**: Typography for labels MUST use bold uppercase styling. The main title MUST use a larger display-style font.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Login screen visual elements match the provided design mockup (logo, labels, colors, button styles, layout).
- **SC-002**: Users can successfully log in using the redesigned login screen without any change in authentication behavior.
- **SC-003**: Users can navigate from the login screen to the registration screen via the "Create New Campaign" button.
- **SC-004**: Users can toggle password visibility using the eye icon in the password field.
- **SC-005**: All existing authentication tests continue to pass after the redesign.
- **SC-006**: Both login and registration screens maintain visual consistency with the dark RPG theme.

## Assumptions

- The "FORGOTTEN?" link will be a non-functional placeholder since no password reset feature currently exists in the application.
- The "TOUCH ID" / fingerprint biometric section shown at the bottom of the design mockup will not be implemented, as biometric authentication is not part of the current application scope.
- The castle/fortress logo will be implemented using CSS/SVG or an icon library rather than a custom image asset, unless a suitable asset is provided.
- The existing routing structure (separate `/login` and `/register` routes) will be preserved. The "Create New Campaign" button navigates to `/register`.
- Color values are approximate and may be fine-tuned during implementation to achieve the best visual match with the mockup.

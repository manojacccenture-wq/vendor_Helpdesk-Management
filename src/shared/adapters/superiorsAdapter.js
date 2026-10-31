/**
 * Superior Users Adapter
 *
 * Transforms the raw response of GET /api/Tickets/superiors into a stable
 * frontend view model. Isolates API response structure changes from the UI,
 * following the same pattern as ticketDetailsAdapter.js.
 *
 * Architecture:
 *   API Response
 *     ↓ adaptSuperiors()
 *     ↓ [{ value, label, userId, name, userCode, role, email, department }]
 *     ↓ ForwardTicketModal → Select
 *     ↓ POST /api/Tickets/forward { forwardToUserId, forwardToRole, … }
 *
 * The exact API contract is not documented, so the mapping is defensive:
 *   - common response envelopes are unwrapped (data / items / users / result)
 *   - PascalCase (.NET serialization) and camelCase keys are both accepted
 *   - entries without a usable identifier are dropped
 *
 * Confirmed response shape:
 *   [{ "userId": "119507d7-…9841", "name": "Adwine Keshav Jha", "designation": "HOD" }]
 *
 * `value` is the identifier used by the dropdown; `userId` is the value sent as
 * `forwardToUserId` (a GUID for this API, with userCode used only as a last
 * resort). `role` is the selected superior's own role (the API's `designation`),
 * sent as `forwardToRole`.
 */

/** Property names accepted for each logical field, in priority order. */
const USER_ID_KEYS = ['userId', 'UserId', 'userID', 'UserID', 'userGuid', 'UserGuid', 'guid', 'Guid', 'id', 'Id'];
const USER_CODE_KEYS = ['userCode', 'UserCode', 'code', 'Code', 'employeeCode', 'EmployeeCode'];
const NAME_KEYS = ['name', 'Name', 'userName', 'UserName', 'username', 'Username', 'fullName', 'FullName', 'displayName', 'DisplayName'];
const EMAIL_KEYS = ['email', 'Email', 'emailId', 'EmailId', 'emailAddress', 'EmailAddress'];
// The superiors API returns the user's role as `designation`.
const ROLE_KEYS = ['designation', 'Designation', 'role', 'Role', 'userRole', 'UserRole', 'roleCode', 'RoleCode'];
const DEPARTMENT_KEYS = ['department', 'Department', 'departmentName', 'DepartmentName', 'deptName', 'DeptName'];

/** Envelope key names that may wrap the actual array of users. */
const ENVELOPE_KEYS = [
  'data', 'Data',
  'items', 'Items',
  'users', 'Users',
  'result', 'Result',
  'superiors', 'Superiors',
  'list', 'List',
  'value', 'Value',
];

/** Matches a GUID (the expected shape of `forwardToUserId`). */
const GUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const pick = (source, keys) => {
  for (const key of keys) {
    const value = source?.[key];
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return '';
};

/**
 * Resolve the user id used for `forwardToUserId`.
 * Prefers an explicit GUID, then any id-like property, then the user code.
 */
function pickUserId(user) {
  const candidates = USER_ID_KEYS
    .map((key) => user?.[key])
    .filter((value) => value !== undefined && value !== null && value !== '');

  const guid = candidates.find((value) => GUID_PATTERN.test(String(value)));
  if (guid) return String(guid);

  if (candidates.length > 0) return String(candidates[0]);

  const userCode = pick(user, USER_CODE_KEYS);
  return userCode ? String(userCode) : '';
}

/**
 * Reduce the raw payload to the array of user objects, regardless of the
 * envelope it arrives in. Returns [] when nothing array-like is found.
 */
function unwrapUsers(raw) {
  let value = raw;

  // Defend against stringified JSON (missing Content-Type header)
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value);
    } catch {
      return [];
    }
  }

  // Walk through nested envelopes (guarded against cycles)
  const visited = new Set();
  while (value && typeof value === 'object' && !Array.isArray(value) && !visited.has(value)) {
    visited.add(value);

    const next = ENVELOPE_KEYS
      .map((key) => value[key])
      .find((candidate) => candidate && typeof candidate === 'object');

    if (!next) break;
    value = next;
  }

  return Array.isArray(value) ? value : [];
}

/**
 * Adapt the raw superior users API response into dropdown options.
 *
 * @param {*} raw - Raw API response from GET /api/Tickets/superiors
 * @returns {Array<{ value: string, label: string, userId: string, name: string, userCode: string, role: string, email: string, department: string }>}
 */
export function adaptSuperiors(raw) {
  let payload = raw;

  // Defend against stringified JSON (missing Content-Type header)
  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload);
    } catch {
      // Not JSON string; continue
    }
  }

  // Detect unsuccessful response envelopes and raise error for RTK Query
  if (payload && typeof payload === 'object') {
    const isExplicitlyUnsuccessful =
      payload.isSuccessful === false ||
      payload.IsSuccessful === false ||
      payload.success === false ||
      payload.Success === false;

    if (isExplicitlyUnsuccessful) {
      const message =
        payload.message ||
        payload.Message ||
        payload.error ||
        payload.Error ||
        'Failed to load superior users.';
      const error = new Error(message);
      error.data = payload;
      throw error;
    }
  }

  const users = unwrapUsers(payload);
  const seen = new Set();

  return users.reduce((options, user) => {
    if (!user || typeof user !== 'object' || Array.isArray(user)) return options;

    const userId = pickUserId(user);
    const name = pick(user, NAME_KEYS);

    if (!userId && !name) return options;

    const value = userId || name;
    if (seen.has(value)) return options;
    seen.add(value);

    const userCode = pick(user, USER_CODE_KEYS);
    const role = pick(user, ROLE_KEYS);
    const email = pick(user, EMAIL_KEYS);

    // Display: "MUKESH SINHA (HOD) · 155344" — degraded gracefully when fields are absent
    const labelParts = [String(name || userCode || value)];
    const context = [role, userCode].filter(Boolean).map(String);
    if (context.length > 0) labelParts.push(`(${context.join(' · ')})`);

    options.push({
      value,
      label: labelParts.join(' '),
      userId,
      name: name ? String(name) : '',
      userCode: userCode ? String(userCode) : '',
      role: role ? String(role) : '',
      email: email ? String(email) : '',
      department: pick(user, DEPARTMENT_KEYS),
    });

    return options;
  }, []);
}

export default adaptSuperiors;

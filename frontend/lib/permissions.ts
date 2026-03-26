/**
 * Role-based permission helpers.
 *
 * DB roles → display names:
 *   OWNER   → Owner
 *   MANAGER → Manager         (same access as OWNER)
 *   CHEF    → Procurement Officer  (inventory write + kitchen)
 *   STAFF   → Kitchen Staff        (kitchen only, read-only inventory)
 */

type Role = string | undefined | null;

/** Owner or Manager — full access including Settings and team management. */
export function isAdminRole(role: Role): boolean {
  return role === "OWNER" || role === "MANAGER";
}

/** Can write to inventory (create/edit items, submit opening/closing stock). */
export function canWriteInventory(role: Role): boolean {
  return role === "OWNER" || role === "MANAGER" || role === "CHEF";
}

/** Can use Kitchen Service (log usage / waste). All roles. */
export function canUseKitchen(role: Role): boolean {
  return role === "OWNER" || role === "MANAGER" || role === "CHEF" || role === "STAFF";
}

/** Human-readable label for a DB role value. */
export function getRoleLabel(role: Role): string {
  switch (role) {
    case "OWNER":   return "Owner";
    case "MANAGER": return "Manager";
    case "CHEF":    return "Procurement Officer";
    case "STAFF":   return "Kitchen Staff";
    default:        return role ?? "Unknown";
  }
}

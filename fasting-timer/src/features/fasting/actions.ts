import {
  createFast,
  deleteAllFasts,
  deleteFast,
  getActiveFast,
  updateFast,
  type Fast,
  type FastInput,
} from '@/db/fasts';

import {
  cancelFastEndAlert,
  cancelStartReminder,
  ensureNotificationPermission,
  scheduleFastEndAlert,
  scheduleStartReminder,
} from './notifications';
import { preferences } from './preferences';
import { getProtocol, type ProtocolId } from './protocols';
import { goalMs } from './stats';

/** Writes that also keep the scheduled notifications in step with the data. */

async function syncEndAlert(active: Fast | null) {
  if (!active || !preferences.get().endAlert) {
    await cancelFastEndAlert();
    return;
  }
  await scheduleFastEndAlert(active.startedAt + goalMs(active), active.goalHours);
}

export async function startFast(protocolId: ProtocolId, startedAt = Date.now()): Promise<Fast> {
  const fast = await createFast({
    protocolId,
    goalHours: getProtocol(protocolId).fastHours,
    startedAt,
    endedAt: null,
  });
  await syncEndAlert(fast);
  return fast;
}

export async function endFast(fast: Fast, endedAt = Date.now()): Promise<void> {
  await updateFast(fast.id, { ...fast, endedAt });
  await cancelFastEndAlert();
}

/** Changing the plan mid-fast moves the goal; the alert follows. */
export async function changeProtocol(id: ProtocolId, active: Fast | null): Promise<void> {
  preferences.set({ protocolId: id });
  if (active) {
    const updated = { ...active, protocolId: id, goalHours: getProtocol(id).fastHours };
    await updateFast(active.id, updated);
    await syncEndAlert(updated);
  }
}

export async function saveFast(id: number | undefined, input: FastInput): Promise<void> {
  if (id === undefined) {
    await createFast(input);
  } else {
    await updateFast(id, input);
  }
  if (input.endedAt === null) {
    await syncEndAlert(await getActiveFast());
  }
}

export async function removeFast(fast: Fast): Promise<void> {
  await deleteFast(fast.id);
  if (fast.endedAt === null) {
    await cancelFastEndAlert();
  }
}

/** Settings toggle. Resolves to the value that now applies (false when permission was refused). */
export async function setEndAlert(on: boolean): Promise<boolean> {
  if (on && !(await ensureNotificationPermission())) {
    return false;
  }
  preferences.set({ endAlert: on });
  await syncEndAlert(await getActiveFast());
  return on;
}

export async function setStartReminder(on: boolean): Promise<boolean> {
  if (on && !(await ensureNotificationPermission())) {
    return false;
  }
  preferences.set({ startReminder: on });
  const { startHour, startMinute } = preferences.get();
  await (on ? scheduleStartReminder(startHour, startMinute) : cancelStartReminder());
  return on;
}

export async function setStartTime(startHour: number, startMinute: number): Promise<void> {
  preferences.set({ startHour, startMinute });
  if (preferences.get().startReminder) {
    await scheduleStartReminder(startHour, startMinute);
  }
}

/** Settings "Reset data": every fast, every preference, every scheduled notification. */
export async function resetFastingData(): Promise<void> {
  await deleteAllFasts();
  await preferences.reset();
  await Promise.all([cancelFastEndAlert(), cancelStartReminder()]);
}

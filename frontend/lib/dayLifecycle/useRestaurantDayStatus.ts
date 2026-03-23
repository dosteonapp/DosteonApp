import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DayState, DayStatus, DayStep } from "./types";
import { restaurantDayStorage } from "./storage";
import { restaurantOpsService } from "@/lib/services/restaurantOpsService";
import { useUser } from "@/context/UserContext";
 
const DEFAULT_ORG_ID = "org_123";

// Determine today's date in local format (YYYY-MM-DD)
const getTodayString = () => new Date().toISOString().split('T')[0];

const INITIAL_OPENING_STEPS: DayStep[] = [
  { id: "step1", title: "Home — Day Kickoff", targetPath: "/dashboard", done: false },
  { id: "step2", title: "Kitchen Services — Kitchen Ready", targetPath: "/dashboard/kitchen-service", done: false },
  { id: "step3", title: "Inventory — Stock Ready", targetPath: "/dashboard/inventory", done: false },
  { id: "step4", title: "Closing — Confirm Day Open", targetPath: "/dashboard/closing", done: false },
];

const INITIAL_CLOSING_STEPS: DayStep[] = [
  { id: "step1", title: "Kitchen Services — Final Orders Check", targetPath: "/dashboard/kitchen-service", done: false },
  { id: "step2", title: "Inventory — Reconcile Stock", targetPath: "/dashboard/inventory", done: false },
  { id: "step3", title: "Home — Summary Review", targetPath: "/dashboard", done: false },
  { id: "step4", title: "Closing — Close Day", targetPath: "/dashboard/closing", done: false },
];

export function useRestaurantDayStatus() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const orgId = user?.organization_id || DEFAULT_ORG_ID;
  const businessDate = getTodayString();

  const { data: status, isLoading } = useQuery({
    queryKey: ["restaurantDayStatus", orgId, businessDate],
    queryFn: async () => {
      // 1. Try local storage first (immediate UI)
      const saved = restaurantDayStorage.getStatus(orgId, businessDate);
      
      // 2. Fetch from service (actual API)
      try {
        const apiResult = await restaurantOpsService.getDayStatus();
        
        // Normalise API business date to local YYYY-MM-DD for comparison
        let apiBusinessDate = businessDate;
        if (apiResult.business_date) {
          try {
            apiBusinessDate = new Date(apiResult.business_date).toISOString().split('T')[0];
          } catch {
            apiBusinessDate = businessDate;
          }
        }

        // If the last recorded day was fully closed and belongs to a
        // previous calendar date, automatically roll forward to a new
        // PRE_OPEN day so Daily Stock Count can run again.
        const isClosedPreviousDay =
          apiResult.state === "CLOSED" &&
          apiBusinessDate < businessDate;

        if (isClosedPreviousDay) {
          const resetStatus: DayStatus = {
            state: DayState.PRE_OPEN,
            businessDate,
            openingSteps: INITIAL_OPENING_STEPS,
            closingSteps: INITIAL_CLOSING_STEPS,
            metadata: {},
            updatedAt: new Date().toISOString(),
          };

          restaurantDayStorage.saveStatus(orgId, resetStatus);
          return resetStatus;
        }

        // Transform API results (snake_case to camelCase)
        const isActuallyOpen = apiResult.is_opening_completed || apiResult.openingCompleted;
        const apiState = apiResult.state || (isActuallyOpen ? DayState.OPEN : DayState.PRE_OPEN);
        
        const initialStatus: DayStatus = {
            state: apiState,
            businessDate: apiBusinessDate,
            openingSteps: INITIAL_OPENING_STEPS.map(s => ({ ...s, done: !!isActuallyOpen })),
            closingSteps: INITIAL_CLOSING_STEPS,
            metadata: apiResult.metadata,
            updatedAt: new Date().toISOString(),
        };

        // If local storage is stale compared to API, prefer API
        if (!saved || isActuallyOpen || apiState !== saved.state) {
            restaurantDayStorage.saveStatus(orgId, initialStatus);
            return initialStatus;
        }
      } catch (err) {
        console.warn("Using local cache for day status due to network issue");
      }

      if (saved) return saved;

      const defaultStatus: DayStatus = {
        state: DayState.PRE_OPEN,
        businessDate: businessDate,
        openingSteps: INITIAL_OPENING_STEPS,
        closingSteps: INITIAL_CLOSING_STEPS,
        updatedAt: new Date().toISOString(),
      };
      
      restaurantDayStorage.saveStatus(orgId, defaultStatus);
      return defaultStatus;
    },
    staleTime: 60000, // 1 minute stale time for operational status
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: DayStatus) => {
      restaurantDayStorage.saveStatus(orgId, newStatus);
      return newStatus;
    },
    onSuccess: (newStatus) => {
      queryClient.setQueryData(["restaurantDayStatus", orgId, businessDate], newStatus);
    },
  });

  const startOpening = async () => {
    if (!status || status.state !== DayState.PRE_OPEN) return;
    await updateStatusMutation.mutateAsync({
      ...status,
      state: DayState.OPENING_IN_PROGRESS,
      updatedAt: new Date().toISOString(),
    });
  };

  const completeOpeningStep = async (stepId: string) => {
    if (!status || status.state !== DayState.OPENING_IN_PROGRESS) return;
    
    const nextStepIndex = status.openingSteps.findIndex(s => !s.done);
    if (nextStepIndex === -1) return;
    
    const targetStep = status.openingSteps[nextStepIndex];
    if (targetStep.id !== stepId) return;

    const newSteps = [...status.openingSteps];
    newSteps[nextStepIndex] = { ...targetStep, done: true };

    await updateStatusMutation.mutateAsync({
      ...status,
      openingSteps: newSteps,
      updatedAt: new Date().toISOString(),
    });
  };

  const finishOpening = async () => {
    if (!status) return;
    
    // Create the "OPEN" state locally
    const updatedStatus: DayStatus = {
      ...status,
      state: DayState.OPEN,
      openingSteps: status.openingSteps.map(s => ({ ...s, done: true })),
      updatedAt: new Date().toISOString(),
    };

    // 1. Sync update local storage IMMEDIATELY
    restaurantDayStorage.saveStatus(orgId, updatedStatus);
    
    // 2. Optimistically update React Query for ZERO latency transition
    queryClient.setQueryData(["restaurantDayStatus", orgId, businessDate], updatedStatus);
    
    // 3. Update legacy mock key for hybrid usage support
    if (typeof window !== 'undefined') {
        localStorage.setItem('mock_day_status', JSON.stringify({
            openingCompleted: true,
            shiftStatus: "Active",
            state: "OPEN"
        }));
    }

    // 4. Final background sync
    try {
        await updateStatusMutation.mutateAsync(updatedStatus);
        // Ensure all observers are notified
        queryClient.invalidateQueries({ queryKey: ["restaurantDayStatus", orgId] });
    } catch (err) {
        console.error("Delayed background sync in finishOpening:", err);
    }
  };

  const startClosing = async () => {
    if (!status || status.state !== DayState.OPEN) return;
    const updatedStatus: DayStatus = {
      ...status,
      state: DayState.CLOSING_IN_PROGRESS,
      updatedAt: new Date().toISOString(),
    };
    
    queryClient.setQueryData(["restaurantDayStatus", orgId, businessDate], updatedStatus);
    updateStatusMutation.mutate(updatedStatus);
  };

  const completeClosingStep = async (stepId: string) => {
    if (!status || status.state !== DayState.CLOSING_IN_PROGRESS) return;
    
    const nextStepIndex = status.closingSteps.findIndex(s => !s.done);
    if (nextStepIndex === -1) return;
    
    const targetStep = status.closingSteps[nextStepIndex];
    if (targetStep.id !== stepId) return;

    const newSteps = [...status.closingSteps];
    newSteps[nextStepIndex] = { ...targetStep, done: true };

    await updateStatusMutation.mutateAsync({
      ...status,
      closingSteps: newSteps,
      updatedAt: new Date().toISOString(),
    });
  };

  const finishClosing = async () => {
    if (!status || status.state !== DayState.CLOSING_IN_PROGRESS) return;
    const allDone = status.closingSteps.every(s => s.done);
    if (!allDone) return;

    const updatedStatus: DayStatus = {
      ...status,
      state: DayState.CLOSED,
      updatedAt: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
        localStorage.setItem('mock_day_status', JSON.stringify({
            openingCompleted: false,
            shiftStatus: "Closed",
            state: "CLOSED"
        }));
    }

    queryClient.setQueryData(["restaurantDayStatus", orgId, businessDate], updatedStatus);
    updateStatusMutation.mutate(updatedStatus);
  };

  const forceClose = async () => {
    if (!status) return;
    const updatedStatus: DayStatus = {
      ...status,
      state: DayState.CLOSED,
      closingSteps: status.closingSteps.map(s => ({ ...s, done: true })),
      updatedAt: new Date().toISOString(),
    };

    queryClient.setQueryData(["restaurantDayStatus", orgId, businessDate], updatedStatus);
    updateStatusMutation.mutate(updatedStatus);
  };

  const startNextDay = async () => {
    if (!status || status.state !== DayState.CLOSED) return;
    
    const currentDate = new Date(status.businessDate);
    currentDate.setDate(currentDate.getDate() + 1);
    const nextDateStr = currentDate.toISOString().split('T')[0];

    const nextStatus: DayStatus = {
      state: DayState.PRE_OPEN,
      businessDate: nextDateStr,
      openingSteps: INITIAL_OPENING_STEPS,
      closingSteps: INITIAL_CLOSING_STEPS,
      updatedAt: new Date().toISOString(),
    };

    await updateStatusMutation.mutateAsync(nextStatus);
    queryClient.invalidateQueries({ queryKey: ["restaurantDayStatus"] });
  };

  const { data: settings } = useQuery({
    queryKey: ["restaurantSettings", orgId],
    queryFn: () => restaurantOpsService.getSettings(),
    enabled: !!orgId
  });

  return {
    status,
    isLoading: isLoading && !status, // Only true if we have zero data (neither server nor storage)
    startOpening,
    completeOpeningStep,
    finishOpening,
    startClosing,
    completeClosingStep,
    finishClosing,
    forceClose,
    startNextDay,
    // Selectors
    isOpen: status?.state === DayState.OPEN,
    isOpening: status?.state === DayState.OPENING_IN_PROGRESS,
    isClosing: status?.state === DayState.CLOSING_IN_PROGRESS,
    // Only treat the day as locked when it is explicitly
    // marked CLOSED. PRE_OPEN represents a fresh day where
    // opening workflows (like Daily Stock Count) should be
    // available.
    isLocked: status?.state === DayState.CLOSED,
    isClosed: status?.state === DayState.CLOSED,
    isPreOpen: status?.state === DayState.PRE_OPEN,
    isClosingTimeReached: (() => {
        const closingStart = settings?.closing_start || "08:00 PM";
        const [time, period] = closingStart.split(" ");
        const [hours, minutes] = time.split(":").map(Number);
        
        let hour24 = hours;
        if (period === "PM" && hours !== 12) hour24 += 12;
        if (period === "AM" && hours === 12) hour24 = 0;
        
        const now = new Date();
        const currentHour = now.getHours();
        const currentMin = now.getMinutes();

        return (currentHour > hour24) || (currentHour === hour24 && currentMin >= (minutes || 0));
    })(),
    currentTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    targetClosingTime: settings?.closing_start || "08:00 PM"
  };
}

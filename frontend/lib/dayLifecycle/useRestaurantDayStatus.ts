import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DayState, DayStatus, DayStep } from "./types";
import { restaurantDayStorage } from "./storage";
import { restaurantOpsService } from "@/lib/services/restaurantOpsService";

const DEFAULT_ORG_ID = "org_123";
const DEFAULT_BUSINESS_DATE = "2026-01-24"; // Matching the hardcoded date in UI for consistency

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
  const orgId = DEFAULT_ORG_ID;
  const businessDate = DEFAULT_BUSINESS_DATE;

  const { data: status, isLoading } = useQuery({
    queryKey: ["restaurantDayStatus", orgId, businessDate],
    queryFn: async () => {
      // 1. Try local storage first (persistence)
      const saved = restaurantDayStorage.getStatus(orgId, businessDate);
      if (saved) return saved;

      // 2. Fetch from service (mock)
      const mockResult = await restaurantOpsService.getDayStatus();
      
      // Transform mock to our structure
      const initialState = mockResult.openingCompleted ? DayState.OPEN : DayState.PRE_OPEN;
      const initialOpeningSteps = INITIAL_OPENING_STEPS.map(s => ({ ...s, done: mockResult.openingCompleted }));

      const initialStatus: DayStatus = {
        state: initialState,
        businessDate: businessDate,
        openingSteps: initialOpeningSteps,
        closingSteps: INITIAL_CLOSING_STEPS,
        updatedAt: new Date().toISOString(),
      };

      restaurantDayStorage.saveStatus(orgId, initialStatus);
      return initialStatus;
    },
    staleTime: Infinity,
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
    if (!status) {
        console.error("Cannot finish opening: status is missing");
        return;
    }
    
    console.log("Finishing opening for", businessDate);
    const newOpeningSteps = status.openingSteps.map(s => ({ ...s, done: true }));
    const updatedStatus: DayStatus = {
      ...status,
      state: DayState.OPEN,
      openingSteps: newOpeningSteps,
      updatedAt: new Date().toISOString(),
    };

    // Update the legacy mock key for consistency with restaurantOpsService
    if (typeof window !== 'undefined') {
        const legacyStatus = localStorage.getItem('mock_day_status');
        const parsed = legacyStatus ? JSON.parse(legacyStatus) : {};
        localStorage.setItem('mock_day_status', JSON.stringify({
            ...parsed,
            openingCompleted: true,
            shiftStatus: "Active"
        }));
    }

    // 1. Direct persistence update (Sync)
    restaurantDayStorage.saveStatus(orgId, updatedStatus);
    
    // 2. IMMEDIATE cache update for zero-latency UI transition
    queryClient.setQueryData(["restaurantDayStatus", orgId, businessDate], updatedStatus);
    
    // 3. Background sync and invalidation
    try {
        // We don't necessarily need to await this here if we want the toast/overlay to vanish instantly
        updateStatusMutation.mutate(updatedStatus);
        console.log("Mutation started in background, kitchen state updated locally");
        
        // Invalidate in background to notify other possible observers
        queryClient.invalidateQueries({ queryKey: ["restaurantDayStatus"] });
    } catch (err) {
        console.error("Failed to mutate status in background:", err);
    }
  };

  const startClosing = async () => {
    if (!status || status.state !== DayState.OPEN) return;
    const updatedStatus: DayStatus = {
      ...status,
      state: DayState.CLOSING_IN_PROGRESS,
      updatedAt: new Date().toISOString(),
    };
    
    // Immediate cache update
    queryClient.setQueryData(["restaurantDayStatus", orgId, businessDate], updatedStatus);
    // Background sync
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

    // Update legacy mock key
    if (typeof window !== 'undefined') {
        const legacyStatus = localStorage.getItem('mock_day_status');
        const parsed = legacyStatus ? JSON.parse(legacyStatus) : {};
        localStorage.setItem('mock_day_status', JSON.stringify({
            ...parsed,
            openingCompleted: false,
            shiftStatus: "Closed"
        }));
    }

    // Immediate cache update
    queryClient.setQueryData(["restaurantDayStatus", orgId, businessDate], updatedStatus);
    // Background sync
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
  };

  return {
    status,
    isLoading,
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
    isLocked: status?.state !== DayState.OPEN,
    isClosed: status?.state === DayState.CLOSED,
    isPreOpen: status?.state === DayState.PRE_OPEN,
    isClosingTimeReached: (() => {
        const now = new Date();
        return now.getHours() >= 19; // 7 PM
    })(),
    currentTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    targetClosingTime: "7:00 PM"
  };
}

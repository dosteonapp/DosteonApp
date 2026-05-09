from prometheus_client import Counter

# Counts successful restaurant onboardings
ONBOARDING_COMPLETED_COUNTER = Counter(
    "dosteon_onboarding_completed_total",
    "Total number of successful restaurant onboardings.",
)

# Counts opening inventory events recorded via bulk_add_opening_events
INVENTORY_OPENING_EVENTS_COUNTER = Counter(
    "dosteon_inventory_opening_events_total",
    "Total number of opening inventory events recorded.",
)

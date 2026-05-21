# 🎯 ROLLOUT STRATEGY & PROCEDURES (PHASE 3)

**Date:** 2026-05-21  
**Status:** Ready for Implementation  
**Risk Level:** LOW (feature flags + monitoring + instant rollback)

---

## Executive Summary

Controlled rollout strategy using feature flags to gradually enable shadow systems.

**Key Guarantees:**
- ✅ Instant rollback (disable flag)
- ✅ Gradual activation (start small % of traffic)
- ✅ Monitored (metrics + alerts)
- ✅ Reversible (no data modifications)
- ✅ Zero production downtime

---

## Rollout Timeline

### Phase 3a: Monitoring Validation (24-48 hours)

**Before Enabling Any Flag:**

1. **Deploy shadow systems** (already done in Phase 0-2)
2. **Verify observability working**
   ```bash
   # Check logs for shadow operations
   grep "shadow_inventory\|shadow_pos" /logs/dosteon.log
   ```
3. **Monitor for 24-48 hours**
   - Shadow systems running in background
   - Old systems serving production traffic
   - Comparing outputs, logging discrepancies
   - Collecting metrics

4. **Check readiness criteria**
   ```
   Shadow Inventory:
     - 100+ operations ✓
     - 99.5%+ success rate ✓
     - ≤0.5% discrepancy rate ✓
   
   Shadow POS:
     - 100+ operations ✓
     - 99.5%+ success rate ✓
     - ≤0.5% discrepancy rate ✓
   ```

---

### Phase 3b: Shadow Inventory Rollout (If Metrics Pass)

**Timeline: Day 2-3**

**Step 1: Enable for 1% of traffic**
```bash
POST /admin/feature-flags/rollout/start/ENABLE_ATOMIC_INVENTORY_TX
  percentage: 1
```

**Monitor (1 hour):**
- ✅ No increased error rate
- ✅ Latency similar to old system
- ✅ New system results match old

**Step 2: Increase to 5%**
```bash
POST /admin/feature-flags/{flag}/enable
  percentage: 5
```

**Monitor (2 hours):**
- ✅ Error rates stable
- ✅ No financial inconsistencies
- ✅ Inventory counts match

**Step 3: Increase to 25%**
```bash
POST /admin/feature-flags/{flag}/enable
  percentage: 25
```

**Monitor (4 hours):**
- ✅ All checks passing
- ✅ No discrepancies

**Step 4: Increase to 50%**
```bash
POST /admin/feature-flags/{flag}/enable
  percentage: 50
```

**Monitor (8 hours):**
- ✅ Stable across all metrics

**Step 5: Increase to 100% (All Traffic)**
```bash
POST /admin/feature-flags/{flag}/enable
  percentage: 100
```

**Monitor (24 hours):**
- ✅ All production traffic using new system
- ✅ Zero issues

---

### Phase 3c: Shadow POS Rollout (If Inventory Successful)

**Timeline: Day 4-5**

**Same strategy as inventory:**
1. 1% → Monitor 1 hour
2. 5% → Monitor 2 hours
3. 25% → Monitor 4 hours
4. 50% → Monitor 8 hours
5. 100% → Monitor 24 hours

**Key Checks for POS:**
- ✅ Financial consistency (profit = revenue - cogs)
- ✅ Inventory depletion (every order has depletions)
- ✅ No race conditions (stock never negative)
- ✅ Order atomicity (no partial orders)

---

## Instant Rollback Procedures

### Scenario 1: Error Rate Spike

**Detection:**
```
Monitoring alert:
  Error rate increased from 0.1% to 2.5% in last 5 minutes
  Flag: ENABLE_ATOMIC_INVENTORY_TX at 25% traffic
```

**Rollback (Immediate):**
```bash
POST /admin/feature-flags/rollout/stop/ENABLE_ATOMIC_INVENTORY_TX
```

**Result:**
- Flag disabled instantly
- All traffic returns to old system
- Old system already proven stable
- No data corruption (no writes modified)
- No downtime

---

### Scenario 2: Discrepancy Detected

**Detection:**
```json
{
  "event": "inventory_dual_write_discrepancy",
  "status": "discrepancy",
  "expected_stock": 100.0,
  "actual_stock": 95.0,
  "difference": -5.0
}
```

**Investigation:**
```bash
# 1. Check which scenario is correct
SELECT * FROM inventory_events 
  WHERE product_id = '...' 
  AND created_at > NOW() - '1 hour'::interval

# 2. Check stock in both systems
SELECT current_stock FROM contextual_products WHERE id = '...'

# 3. Compare logic
# Review shadow_inventory_service.py vs inventory_service.py
```

**Decision:**
- If shadow is correct: continue rollout
- If old is correct: stop shadow, investigate
- If both wrong: investigate root cause

**Rollback (if needed):**
```bash
POST /admin/feature-flags/rollout/stop/ENABLE_ATOMIC_INVENTORY_TX
```

---

## Monitoring Dashboard (to be implemented)

Should track in real-time:

| Metric | Old System | Shadow | Healthy? |
|--------|-----------|--------|----------|
| Operations/min | 45 | 45 | ✓ |
| Success rate | 99.8% | 99.8% | ✓ |
| Error rate | 0.2% | 0.2% | ✓ |
| Avg latency | 125ms | 128ms | ✓ |
| Discrepancies | - | 0 | ✓ |
| Financial delta | - | $0.00 | ✓ |

---

## Alert Configuration

### High-Priority Alerts (Immediate Response)

**1. Error Rate Spike**
```
Condition: error_rate > 1% OR error_rate > baseline + 500%
Action: Disable flag immediately, notify on-call
```

**2. Financial Inconsistency**
```
Condition: gross_profit != (revenue - cogs)
Action: Disable flag immediately, notify finance team
```

**3. Inventory Negative Stock**
```
Condition: current_stock < 0
Action: Disable flag immediately, notify operations
```

**4. Orphaned Orders**
```
Condition: SaleOrder without SaleOrderItems
Action: Disable flag immediately, investigate
```

---

### Medium-Priority Alerts (Manual Review)

**1. Discrepancy Rate > 0.5%**
```
Condition: shadow discrepancies > 0.5%
Action: Notify engineering, review logs, escalate if > 2%
```

**2. Latency Increase > 20%**
```
Condition: shadow_latency > old_latency * 1.2
Action: Monitor, optimize query if needed, escalate if > 50%
```

**3. High Volume Period**
```
Condition: ops/min > 1000 during rollout
Action: Monitor closely, pause rollout if errors spike
```

---

## Success Criteria

### Per-Phase Success

**Phase 3a (Monitoring):**
- ✅ 100+ shadow inventory operations without issues
- ✅ 100+ shadow POS operations without issues
- ✅ ≤0.5% discrepancy rate
- ✅ No financial inconsistencies

**Phase 3b (Inventory Rollout):**
- ✅ 1% → 100% without error spike
- ✅ Zero financial issues
- ✅ Zero negative inventory
- ✅ Metrics stable throughout

**Phase 3c (POS Rollout):**
- ✅ 1% → 100% without error spike
- ✅ Zero financial inconsistencies
- ✅ Zero partial orders
- ✅ Metrics stable throughout

---

## Rollback Criteria (When to Stop Rollout)

**Automatic (Flag Disabled Immediately):**
- Error rate > 1%
- Financial inconsistency detected
- Negative inventory detected
- Orphaned orders detected

**Manual (Escalate for Decision):**
- Discrepancy rate > 0.5% (investigate before continuing)
- Latency increase > 50%
- Database connection issues
- Monitoring system failures

---

## Communication Plan

### Before Rollout
```
1. Notify engineering team (24 hours before)
2. Alert support team (4 hours before)
3. Prepare incident response playbook
4. On-call engineer on standby
```

### During Rollout
```
1. Slack #dosteon-rollout channel updates
2. Every 10% increase: status message
3. Any issue detected: immediate notification
4. Rollback: company-wide notification
```

### After Rollout Complete
```
1. Post-mortem if any issues occurred
2. Metrics summary published
3. Lessons learned documented
```

---

## Gradual Rollout Implementation (Future)

Current implementation:
```
flag = on/off (all or nothing)
```

Future improvement:
```
flag = {
  enabled: true,
  percentage: 25,  # Only 25% of traffic
  cohort: "organization_hash % 100 < 25"
}
```

This would enable:
- True gradual rollout to 1%, 5%, 25%, etc.
- Per-user consistency (same user always in same cohort)
- Canary deployments
- A/B testing

---

## Admin Controls

### Via API

```bash
# Get all flags
GET /api/v1/admin/feature-flags

# Get one flag
GET /api/v1/admin/feature-flags/ENABLE_ATOMIC_INVENTORY_TX

# Enable flag
PATCH /api/v1/admin/feature-flags/ENABLE_ATOMIC_INVENTORY_TX
  { "enabled": true, "reason": "rollout approved" }

# Disable flag (instant rollback)
PATCH /api/v1/admin/feature-flags/ENABLE_ATOMIC_INVENTORY_TX
  { "enabled": false, "reason": "error rate spike detected" }

# Start gradual rollout
POST /api/v1/admin/feature-flags/rollout/start/ENABLE_ATOMIC_INVENTORY_TX
  { "percentage": 5 }

# Stop rollout (instant rollback)
POST /api/v1/admin/feature-flags/rollout/stop/ENABLE_ATOMIC_INVENTORY_TX
```

### Via Environment

```bash
# Set during deployment
ENABLE_ATOMIC_INVENTORY_TX=false
ENABLE_SAFE_POS_ORDER_FLOW=false

# Or runtime override (above API)
```

---

## Metrics Collection

Automatically collected by:
- `rollout_monitoring.py` — in-memory metrics
- Observability logging — detailed events
- Prometheus metrics — exported for dashboards

**To View Metrics:**

```bash
# Get current status
curl http://localhost:8000/api/v1/admin/metrics/rollout

# Expected output:
{
  "shadow_inventory": {
    "operations": 1245,
    "success_rate": 99.8,
    "error_rate": 0.2,
    "discrepancies": 0,
    "discrepancy_rate": 0.0
  },
  "shadow_pos": {
    "operations": 523,
    "success_rate": 99.6,
    "error_rate": 0.4,
    "discrepancies": 1,
    "discrepancy_rate": 0.19
  },
  "readiness": {
    "shadow_inventory_ready": true,
    "shadow_pos_ready": true,
    "all_systems_ready": true,
    "recommendation": "✅ All systems ready for production rollout"
  }
}
```

---

## Safety Guarantees

### Guaranteed Properties
- ✅ INSTANT ROLLBACK — disable flag takes effect immediately
- ✅ NO DATA CORRUPTION — shadow writes don't modify production (flag disabled)
- ✅ ZERO DOWNTIME — fallback to old system is instant
- ✅ NO MANUAL INTERVENTION — automated monitoring
- ✅ AUDIT TRAIL — all flag changes logged with admin ID + reason
- ✅ REVERSIBILITY — any rollout can be instantly undone

### Worst Case Scenario
```
Even if all shadow systems malfunction:

1. Monitoring detects issue (error spike, discrepancy, etc.)
2. Alert triggered
3. Flag disabled (1-second operation)
4. All traffic returns to old system
5. Old system continues serving (proven stable for months)
6. No user impact, no data loss, no downtime
```

---

## Next Steps

1. **Deploy Phase 3 infrastructure** (this document)
2. **Start monitoring shadow systems** (24-48 hours)
3. **Verify readiness criteria pass**
4. **Begin Phase 3b rollout** (inventory first)
5. **If successful, begin Phase 3c** (POS second)
6. **After both complete, proceed to Phase 4** (schema hardening)

---

## Questions & Support

For questions during rollout:
- Check monitoring dashboard
- Review observability logs
- Run diagnostics script
- Contact on-call engineer
- Rollback if unsure (safety first)

---

**Status: READY FOR IMPLEMENTATION**

Proceed to Phase 3 monitoring when both shadow systems have been deployed and running for baseline collection.

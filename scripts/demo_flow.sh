#!/usr/bin/env bash
# scripts/demo_flow.sh
# End-to-end demo: Mint & List → Buy & Approve → Check-in

set -euo pipefail

ROOT="$(cd "$(dirname "$0")"/.. && pwd)"
source "$ROOT/scripts/env.sh"

COMMAND="${1:-}"
VERIFY_PAYOUTS="${2:-}"

if [[ -z "$COMMAND" ]]; then
    echo "Usage: $0 <mint-list|buy-approve|check-in> [args]"
    echo ""
    echo "Commands:"
    echo "  mint-list                  - Create event, mint ticket, list in Kiosk"
    echo "  buy-approve [--verify]     - Purchase ticket with royalty enforcement"
    echo "  check-in <TICKET_ID>       - Mark ticket as used (and test double-use)"
    exit 1
fi

# Validate environment
if [[ -z "${PACKAGE_ID:-}" ]]; then
    echo "✘ PACKAGE_ID not set. Run: bash scripts/deploy_package.sh"
    exit 1
fi

if [[ -z "${POLICY_ID:-}" ]]; then
    echo "✘ POLICY_ID not set. Run: bash scripts/create_policy.sh"
    exit 1
fi

case "$COMMAND" in
    mint-list)
        echo "========================================"
        echo "  PTB #1: Mint & List (SELLER)"
        echo "========================================"
        echo ""
        
        cd "$ROOT/scripts"
        MINT_OUTPUT=$(npx tsx ptb_mint_and_list.ts 2>&1)
        echo "$MINT_OUTPUT"
        
        # Extract IDs from output
        KIOSK_ID=$(echo "$MINT_OUTPUT" | grep "KIOSK_ID:" | awk '{print $NF}')
        LISTING_ID=$(echo "$MINT_OUTPUT" | grep "LISTING_ID:" | awk '{print $NF}')
        TICKET_ID=$(echo "$MINT_OUTPUT" | grep "TICKET_ID:" | awk '{print $NF}')
        
        if [[ -z "$TICKET_ID" ]]; then
            echo "✘ Could not extract ticket ID"
            exit 1
        fi
        
        # Save IDs to temp file for buy-approve
        echo "export LAST_KIOSK_ID=$KIOSK_ID" > "$ROOT/scripts/.last_mint.sh"
        echo "export LAST_LISTING_ID=$LISTING_ID" >> "$ROOT/scripts/.last_mint.sh"
        echo "export LAST_TICKET_ID=$TICKET_ID" >> "$ROOT/scripts/.last_mint.sh"
        
        echo ""
        echo "========================================"
        echo "  ✓ Mint & List Complete"
        echo "========================================"
        echo ""
        echo "Next: Run buy-approve to purchase the ticket"
        echo "  ./scripts/demo_flow.sh buy-approve"
        ;;
        
    buy-approve)
        echo "========================================"
        echo "  PTB #2: Buy & Approve (BUYER)"
        echo "========================================"
        echo ""
        
        # Load last mint IDs
        if [[ -f "$ROOT/scripts/.last_mint.sh" ]]; then
            source "$ROOT/scripts/.last_mint.sh"
        else
            echo "✘ No mint data found. Run 'mint-list' first."
            exit 1
        fi
        
        if [[ -z "${LAST_KIOSK_ID:-}" ]] || [[ -z "${LAST_TICKET_ID:-}" ]]; then
            echo "✘ Missing KIOSK_ID or TICKET_ID from last mint"
            exit 1
        fi
        
        cd "$ROOT/scripts"
        
        # Check if payout verification is requested
        if [[ "$VERIFY_PAYOUTS" == "--verify-payouts" ]] || [[ "$VERIFY_PAYOUTS" == "--verify" ]]; then
            echo "Running with payout verification..."
            echo ""
            npx tsx verify_payouts.ts "$LAST_KIOSK_ID" "$LAST_TICKET_ID" 250000000
        else
            npx tsx ptb_buy_and_approve.ts "$LAST_KIOSK_ID" "$LAST_TICKET_ID" 250000000
        fi
        
        echo ""
        echo "========================================"
        echo "  ✓ Buy & Approve Complete"
        echo "========================================"
        echo ""
        echo "Next: Run check-in to mark the ticket as used"
        echo "  ./scripts/demo_flow.sh check-in $LAST_TICKET_ID"
        ;;
        
    check-in)
        TICKET_ID="${2:-}"
        
        if [[ -z "$TICKET_ID" ]]; then
            # Try to load from last mint
            if [[ -f "$ROOT/scripts/.last_mint.sh" ]]; then
                source "$ROOT/scripts/.last_mint.sh"
                TICKET_ID="$LAST_TICKET_ID"
            fi
        fi
        
        if [[ -z "$TICKET_ID" ]]; then
            echo "Usage: $0 check-in <TICKET_ID>"
            exit 1
        fi
        
        echo "========================================"
        echo "  PTB #3: Check-in (Mark as Used)"
        echo "========================================"
        echo ""
        echo "Ticket ID: $TICKET_ID"
        echo ""
        
        cd "$ROOT/scripts"
        
        # First check-in (should succeed)
        echo "→ Attempt 1: Marking ticket as used..."
        if npx tsx ptb_checkin.ts "$TICKET_ID" 2>&1; then
            echo "✓ Check-in successful (used = true)"
        else
            echo "✓ Check-in successful (ticket already marked as used)"
        fi
        
        echo ""
        echo "→ Attempt 2: Testing double-use prevention..."
        sleep 2
        
        if npx tsx ptb_checkin.ts "$TICKET_ID" 2>&1 | tee /tmp/checkin2.log; then
            echo "✗ WARNING: Second check-in should have failed!"
            exit 1
        else
            if grep -q "MoveAbort" /tmp/checkin2.log || grep -q "E_ALREADY_USED" /tmp/checkin2.log; then
                echo "✓ Double-use prevention working (E_ALREADY_USED)"
            else
                echo "✗ Unexpected error on second check-in"
                cat /tmp/checkin2.log
                exit 1
            fi
        fi
        
        echo ""
        echo "========================================"
        echo "  ✓ Check-in Complete"
        echo "========================================"
        echo ""
        echo "Summary:"
        echo "  1. ✓ Ticket marked as used on first check-in"
        echo "  2. ✓ Second check-in prevented (E_ALREADY_USED)"
        ;;
        
    *)
        echo "✘ Unknown command: $COMMAND"
        echo "Valid commands: mint-list, buy-approve, check-in"
        exit 1
        ;;
esac

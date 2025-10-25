#!/usr/bin/env bash
# scripts/env.example.sh
# Template for environment configuration. Copy to env.sh and fill in actual values.
# NEVER commit secrets (private keys, mnemonics). Addresses and object IDs only.

# Network configuration
export NETWORK=testnet
export RPC_URL=https://fullnode.testnet.sui.io:443

# Package and policy IDs (filled after `sui client publish` in M1)
export PACKAGE_ID=              # DropKit Move package ID
export POLICY_ID=               # Transfer Policy object ID

# Actor addresses (filled after `sui client new-address` in M0)
export ADDR_SELLER=             # Event organizer/creator (mints tickets)
export ADDR_BUYER=              # Fan/attendee (purchases tickets)
export ADDR_CREATOR=            # Royalty recipient (may = ADDR_SELLER)
export ADDR_TREASURY=           # Platform fee recipient (optional)

# Gas sponsorship (M3)
# export SPONSOR_ADDRESS=       # Address that sponsors gas for users

# Walrus config (M4)
# export WALRUS_PUBLISHER_URL=  # e.g., https://publisher.walrus-testnet.walrus.space
# export WALRUS_AGGREGATOR_URL= # e.g., https://aggregator.walrus-testnet.walrus.space

# Seal (DSM) config (M4)
# export SEAL_API_KEY=          # Never commit; load from secure vault in prod

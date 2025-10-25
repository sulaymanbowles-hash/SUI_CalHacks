/**
 * Transaction effects parsing utilities
 */

/**
 * Find created objects of a specific type from transaction effects
 */
export function findCreatedOf(typePrefix: string, effects: any): string[] {
  if (!effects?.objectChanges) return [];
  
  return effects.objectChanges
    .filter((change: any) => 
      change.type === 'created' && 
      change.objectType?.includes(typePrefix)
    )
    .map((change: any) => change.objectId);
}

/**
 * Find Kiosk and listing ID from transaction effects
 */
export function findListingAndKiosk(effects: any): { kioskId?: string; listingId?: string } {
  if (!effects?.objectChanges) return {};
  
  const kioskObj = effects.objectChanges.find((c: any) => 
    c.type === 'created' && 
    c.objectType?.includes('::kiosk::Kiosk') &&
    (c.owner as any)?.Shared
  );
  
  // For Kiosk, the listing ID is typically the item ID
  // We can also check events for ItemListed
  const listingId = effects.events?.find((e: any) => 
    e.type?.includes('::kiosk::ItemListed')
  )?.parsedJson?.id;
  
  return {
    kioskId: kioskObj?.objectId,
    listingId,
  };
}

/**
 * Find the new owner from transaction effects
 */
export function findNewOwner(effects: any): string | undefined {
  if (!effects?.objectChanges) return undefined;
  
  // Look for mutated or created objects with AddressOwner
  const ownedObject = effects.objectChanges.find((c: any) => 
    (c.type === 'mutated' || c.type === 'created') &&
    (c.owner as any)?.AddressOwner
  );
  
  return (ownedObject?.owner as any)?.AddressOwner;
}

/**
 * Extract ticket ID from effects
 */
export function findTicketId(effects: any): string | undefined {
  const tickets = findCreatedOf('::ticket::Ticket', effects);
  return tickets[0];
}

/**
 * Extract event ID from effects
 */
export function findEventId(effects: any): string | undefined {
  const events = findCreatedOf('::event::Event', effects);
  return events[0];
}

/**
 * Extract class ID from effects
 */
export function findClassId(effects: any): string | undefined {
  const classes = findCreatedOf('::class::TicketClass', effects);
  return classes[0];
}

/**
 * Parse balance changes from effects
 */
export function parseBalanceChanges(effects: any): Array<{ owner: string; amount: string }> {
  if (!effects?.balanceChanges) return [];
  
  return effects.balanceChanges.map((change: any) => ({
    owner: (change.owner as any)?.AddressOwner || 'unknown',
    amount: (Number(change.amount) / 1e9).toFixed(4),
  }));
}

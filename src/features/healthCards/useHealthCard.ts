import { useState } from "react";
// Service removed - use useHealthCards hook directly instead
import { withNetwork } from "../../lib/network";

export function useHealthCardByToken() {
  const [loading, setLoading] = useState(false);
  const [card, setCard] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchCard(token: string) {
    setLoading(true); 
    setError(null);
    try {
      const data = await withNetwork(() => healthCardsService.getByVerificationToken(token));
      setCard(data);
    } catch (e: any) {
      setError(e?.message ?? "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }

  return { loading, card, error, fetchCard };
}

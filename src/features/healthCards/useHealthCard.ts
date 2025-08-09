import { useState } from "react";
import { getByVerificationToken } from "../../api/healthCards.api";
import { withNetwork } from "../../lib/network";

export function useHealthCardByToken() {
  const [loading, setLoading] = useState(false);
  const [card, setCard] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchCard(token: string) {
    setLoading(true); 
    setError(null);
    try {
      const data = await withNetwork(() => getByVerificationToken(token));
      setCard(data);
    } catch (e: any) {
      setError(e?.message ?? "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }

  return { loading, card, error, fetchCard };
}

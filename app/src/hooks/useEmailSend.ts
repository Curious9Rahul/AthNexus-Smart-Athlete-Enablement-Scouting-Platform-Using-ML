import { useState } from 'react';
import type { TournamentEmail } from '../data/tournamentsData';

interface SendResult {
  success: boolean;
  id?: string;
  error?: string;
}

interface BulkSendResult {
  success: boolean;
  sent: number;
  failed: number;
  results: Array<{
    email: string | null;
    status: 'fulfilled' | 'rejected';
    id: string | null;
    error: string | null;
  }>;
}

export function useEmailSend() {
  const [isSending, setIsSending] = useState(false);
  const [lastResult, setLastResult] = useState<SendResult | BulkSendResult | null>(null);

  const sendEmail = async (playerName: string, playerEmail: string, tournament: TournamentEmail) => {
    setIsSending(true);
    try {
      const response = await fetch('http://localhost:5000/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName, playerEmail, tournament }),
      });
      
      const result = await response.json();
      setLastResult(result);
      return result as SendResult;
    } catch (error: any) {
      const errResult = { success: false, error: error.message };
      setLastResult(errResult);
      return errResult;
    } finally {
      setIsSending(false);
    }
  };

  const sendBulkEmail = async (players: Array<{ playerName: string; playerEmail: string }>, tournament: TournamentEmail) => {
    setIsSending(true);
    try {
      const response = await fetch('http://localhost:5000/api/send-bulk-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ players, tournament }),
      });
      
      const result = await response.json();
      setLastResult(result);
      return result as BulkSendResult;
    } catch (error: any) {
      const errResult = { success: false, error: error.message, sent: 0, failed: players.length, results: [] };
      setLastResult(errResult);
      return errResult as BulkSendResult;
    } finally {
      setIsSending(false);
    }
  };

  return { sendEmail, sendBulkEmail, isSending, lastResult };
}

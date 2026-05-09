'use server';
/**
 * @fileOverview An AI assistant that analyzes supervisor notes on chalet conditions,
 * categorizes them, identifies urgency, and suggests actions for Admins.
 *
 * - analyzeChaletConditionNotes - A function that handles the analysis of chalet condition notes.
 * - AdminChaletConditionAnalyzerInput - The input type for the analyzeChaletConditionNotes function.
 * - AdminChaletConditionAnalyzerOutput - The return type for the analyzeChaletConditionNotes function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AdminChaletConditionAnalyzerInputSchema = z.object({
  notes: z.string().describe("Supervisor's notes on the chalet's condition."),
  chaletId: z.string().optional().describe("Optional: The ID of the chalet the notes pertain to.")
});
export type AdminChaletConditionAnalyzerInput = z.infer<typeof AdminChaletConditionAnalyzerInputSchema>;

const AdminChaletConditionAnalyzerOutputSchema = z.object({
  categories: z.array(z.enum(['maintenance', 'cleanliness', 'financial', 'general'])).describe("A list of categories the note falls into (e.g., 'maintenance', 'cleanliness', 'financial', 'general')."),
  summary: z.string().describe("A concise summary of the supervisor's notes."),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).describe("The urgency of the issue described in the notes."),
  urgentFlag: z.boolean().describe("True if the issue is urgent and requires immediate attention from the Admin."),
  suggestedActions: z.array(z.string()).describe("A list of suggested actions for the Admin to take based on the notes.")
});
export type AdminChaletConditionAnalyzerOutput = z.infer<typeof AdminChaletConditionAnalyzerOutputSchema>;

export async function analyzeChaletConditionNotes(input: AdminChaletConditionAnalyzerInput): Promise<AdminChaletConditionAnalyzerOutput> {
  return analyzeChaletConditionNotesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adminChaletConditionAnalyzerPrompt',
  input: { schema: AdminChaletConditionAnalyzerInputSchema },
  output: { schema: AdminChaletConditionAnalyzerOutputSchema },
  prompt: `You are an AI assistant specialized in analyzing supervisor notes regarding chalet conditions for the STUDIO FIREBASS AI management system.
Your task is to review the provided notes, categorize the issues, assess their urgency, and suggest appropriate actions for the Admin.

Categories: 'maintenance', 'cleanliness', 'financial', 'general'.
Priorities: 'low', 'medium', 'high', 'urgent'.

Analyze the following supervisor notes:
Chalet ID: {{{chaletId}}}
Notes: {{{notes}}}

Based on the notes, provide a JSON output conforming to the AdminChaletConditionAnalyzerOutputSchema.
Ensure that the 'urgentFlag' is set to true if the 'priority' is 'urgent' or 'high' and requires immediate administrative attention.
For example, if the notes mention 'يحتاج صيانة' (needs maintenance) and it's critical, categorize it as 'maintenance', set priority to 'urgent', urgentFlag to true, and suggest arranging a technician. If it mentions 'غرامة تأخير' (late fee), categorize it as 'financial', set priority as 'high' or 'urgent', and suggest processing the fee.`
});

const analyzeChaletConditionNotesFlow = ai.defineFlow(
  {
    name: 'analyzeChaletConditionNotesFlow',
    inputSchema: AdminChaletConditionAnalyzerInputSchema,
    outputSchema: AdminChaletConditionAnalyzerOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

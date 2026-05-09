'use server';
/**
 * @fileOverview An AI assistant for Admins to analyze chalet booking calendars, identify empty days, and suggest strategies to ensure continuous, back-to-back occupancy.
 *
 * - adminChaletBookingGapOptimizer - A function that optimizes chalet booking gaps.
 * - AdminChaletBookingGapOptimizerInput - The input type for the adminChaletBookingGapOptimizer function.
 * - AdminChaletBookingGapOptimizerOutput - The return type for the adminChaletBookingGapOptimizer function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AdminChaletBookingGapOptimizerInputSchema = z.object({
  chaletId: z.string().describe('The ID of the chalet.'),
  currentDate: z.string().describe('The current date in ISO format.'),
  bookings: z.array(
    z.object({
      startDate: z.string().describe('The start date of the booking.'),
      endDate: z.string().describe('The end date of the booking.'),
    })
  ).describe('Existing bookings for the chalet.'),
});
export type AdminChaletBookingGapOptimizerInput = z.infer<typeof AdminChaletBookingGapOptimizerInputSchema>;

const GapDetailSchema = z.object({
  gapStartDate: z.string().describe('The start date of an identified gap.'),
  gapEndDate: z.string().describe('The end date of an identified gap.'),
  durationDays: z.number().describe('The duration of the gap in days.'),
});
export type GapDetail = z.infer<typeof GapDetailSchema>;

const AdminChaletBookingGapOptimizerOutputSchema = z.object({
  analysis: z.string().describe('Analysis of the booking calendar.'),
  suggestions: z.array(z.string()).describe('Strategies to fill gaps.'),
  hasGaps: z.boolean().describe('True if gaps were found.'),
  gapDetails: z.array(GapDetailSchema).describe('Details of each gap.'),
});
export type AdminChaletBookingGapOptimizerOutput = z.infer<typeof AdminChaletBookingGapOptimizerOutputSchema>;

export async function adminChaletBookingGapOptimizer(input: AdminChaletBookingGapOptimizerInput): Promise<AdminChaletBookingGapOptimizerOutput> {
  return adminChaletBookingGapOptimizerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adminChaletBookingGapOptimizerPrompt',
  input: { schema: AdminChaletBookingGapOptimizerInputSchema },
  output: { schema: AdminChaletBookingGapOptimizerOutputSchema },
  prompt: `You are an expert hospitality management assistant for PHARMA BEACH RESORT.
Review the following bookings for Chalet ID: {{{chaletId}}}.
Current Date is {{{currentDate}}}.

Bookings:
{{#each bookings}}
- From {{{startDate}}} to {{{endDate}}}
{{/each}}

Analyze the calendar to find empty days (gaps) between bookings.
Suggest specific marketing strategies to fill these gaps, like "Last minute discount" or "Free late checkout for adjacent bookings".
Identify if there are any significant periods of vacancy.

Provide the analysis and suggestions in Arabic for the Egyptian market.`
});

const adminChaletBookingGapOptimizerFlow = ai.defineFlow(
  {
    name: 'adminChaletBookingGapOptimizerFlow',
    inputSchema: AdminChaletBookingGapOptimizerInputSchema,
    outputSchema: AdminChaletBookingGapOptimizerOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

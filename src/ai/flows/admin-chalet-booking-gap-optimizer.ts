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
  currentDate: z.string().datetime().describe('The current date in ISO format (e.g., "YYYY-MM-DDTHH:MM:SSZ"). This is the starting point for analysis.'),
  bookings: z.array(
    z.object({
      startDate: z.string().datetime().describe('The start date of the booking in ISO format.'),
      endDate: z.string().datetime().describe('The end date of the booking in ISO format.'),
    })
  ).describe('An array of existing bookings for the chalet, ordered by date.'),
});
export type AdminChaletBookingGapOptimizerInput = z.infer<typeof AdminChaletBookingGapOptimizerInputSchema>;

const GapDetailSchema = z.object({
  gapStartDate: z.string().describe('The start date of an identified gap (YYYY-MM-DD).'),
  gapEndDate: z.string().describe('The end date of an identified gap (YYYY-MM-DD).'),
  durationDays: z.number().describe('The duration of the gap in days.'),
});
export type GapDetail = z.infer<typeof GapDetailSchema>;

const AdminChaletBookingGapOptimizerOutputSchema = z.object({
  analysis: z.string().describe('A detailed analysis of the booking calendar and identified gaps.'),
  suggestions: z.array(z.string()).describe('A list of strategies to fill identified empty days, including promotional offers or internal placeholder bookings.'),
  hasGaps: z.boolean().describe('True if any booking gaps were found, false otherwise.'),
  gapDetails: z.array(GapDetailSchema).describe('Details of each identified booking gap.'),
});
export type AdminChaletBookingGapOptimizerOutput = z.infer<typeof AdminChaletBookingGapOptimizerOutputSchema>;

export async function adminChaletBookingGapOptimizer(input: AdminChaletBookingGapOptimizerInput): Promise<AdminChaletBookingGapOptimizerOutput> {
  return adminChaletBookingGapOptimizerFlow(input);
}

/**
 * Finds booking gaps in a chalet's calendar based on existing bookings and a current date.
 * Assumes bookings are already sorted by startDate.
 * @param bookings - An array of existing bookings.
 * @param currentDate - The date from which to start checking for gaps.
 * @returns An array of GapDetail objects.
 */
function findBookingGaps(bookings: AdminChaletBookingGapOptimizerInput['bookings'], currentDate: string): GapDetail[] {
  const parsedCurrentDate = new Date(currentDate);
  parsedCurrentDate.setHours(0, 0, 0, 0); // Normalize to start of day

  const sortedBookings = [...bookings].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  const gaps: GapDetail[] = [];

  // Define a future horizon for analysis, e.g., 60 days from the current date or from the last known booking date.
  // This ensures the AI considers future occupancy even if there are no explicit bookings far out.
  const futureHorizonDate = new Date(parsedCurrentDate.getTime());
  futureHorizonDate.setDate(futureHorizonDate.getDate() + 90); // Look 90 days into the future

  if (sortedBookings.length === 0) {
    // If no bookings exist, the entire period up to the future horizon is a gap.
    const gapStart = parsedCurrentDate;
    const gapEnd = new Date(futureHorizonDate.getTime() - 24 * 60 * 60 * 1000); // Day before horizon to be inclusive
    const duration = Math.ceil((gapEnd.getTime() - gapStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (duration > 0) {
      gaps.push({
        gapStartDate: gapStart.toISOString().split('T')[0],
        gapEndDate: gapEnd.toISOString().split('T')[0],
        durationDays: duration,
      });
    }
  } else {
    // Check for gap before the first booking, if it's after the current date.
    const firstBookingStartDate = new Date(sortedBookings[0].startDate);
    firstBookingStartDate.setHours(0, 0, 0, 0); // Normalize to start of day

    if (firstBookingStartDate > parsedCurrentDate) {
      const gapStart = parsedCurrentDate;
      const gapEnd = new Date(firstBookingStartDate.getTime() - 24 * 60 * 60 * 1000); // Day before first booking
      const duration = Math.ceil((gapEnd.getTime() - gapStart.getTime()) / (1000 * 60 * 60 * 24)) + 1; // Inclusive days
      if (duration > 0) {
        gaps.push({
          gapStartDate: gapStart.toISOString().split('T')[0],
          gapEndDate: gapEnd.toISOString().split('T')[0],
          durationDays: duration,
        });
      }
    }

    let previousBookingEndDate = new Date(sortedBookings[0].endDate);
    previousBookingEndDate.setHours(0, 0, 0, 0);

    // Check for gaps between bookings.
    for (let i = 1; i < sortedBookings.length; i++) {
      const currentBookingStartDate = new Date(sortedBookings[i].startDate);
      currentBookingStartDate.setHours(0, 0, 0, 0);

      const dayAfterPreviousBooking = new Date(previousBookingEndDate);
      dayAfterPreviousBooking.setDate(dayAfterPreviousBooking.getDate() + 1); // The day after the previous booking ends

      if (currentBookingStartDate > dayAfterPreviousBooking) {
        // Gap found
        const gapStart = dayAfterPreviousBooking;
        const gapEnd = new Date(currentBookingStartDate.getTime() - 24 * 60 * 60 * 1000); // Day before current booking

        const duration = Math.ceil((gapEnd.getTime() - gapStart.getTime()) / (1000 * 60 * 60 * 24)) + 1; // Inclusive days
        if (duration > 0) {
          gaps.push({
            gapStartDate: gapStart.toISOString().split('T')[0],
            gapEndDate: gapEnd.toISOString().split('T')[0],
            durationDays: duration,
          });
        }
      }
      previousBookingEndDate = new Date(sortedBookings[i].endDate);
      previousBookingEndDate.setHours(0, 0, 0, 0);
    }

    // Check for gap after the last booking until the future horizon.
    const lastBookingEndDate = new Date(sortedBookings[sortedBookings.length - 1].endDate);
    lastBookingEndDate.setHours(0, 0, 0, 0);

    const dayAfterLastBooking = new Date(lastBookingEndDate);
    dayAfterLastBooking.setDate(dayAfterLastBooking.getDate() + 1);

    // Only consider this an 
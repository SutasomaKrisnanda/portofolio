'use server';

/**
 * @fileOverview This file defines a Genkit flow for summarizing a resume, highlighting key skills and experiences.
 *
 * - generateResumeSummary - A function that takes a resume text as input and returns a summarized version.
 * - ResumeSummaryInput - The input type for the generateResumeSummary function (resume as text).
 * - ResumeSummaryOutput - The return type for the generateResumeSummary function (summarized resume).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ResumeSummaryInputSchema = z.object({
  resumeText: z.string().describe('The full text content of the resume.'),
  jobDescription: z.string().optional().describe('The job description for which the resume summary is tailored.'),
});
export type ResumeSummaryInput = z.infer<typeof ResumeSummaryInputSchema>;

const ResumeSummaryOutputSchema = z.object({
  summary: z.string().describe('A summarized version of the resume, highlighting key skills and experiences.'),
});
export type ResumeSummaryOutput = z.infer<typeof ResumeSummaryOutputSchema>;

export async function generateResumeSummary(input: ResumeSummaryInput): Promise<ResumeSummaryOutput> {
  return resumeSummaryFlow(input);
}

const resumeSummaryPrompt = ai.definePrompt({
  name: 'resumeSummaryPrompt',
  input: {schema: ResumeSummaryInputSchema},
  output: {schema: ResumeSummaryOutputSchema},
  prompt: `You are an expert resume writer. Please summarize the following resume, highlighting the key skills and experiences.  Focus on making it concise and easy to read.

Resume:
{{resumeText}}

{{#if jobDescription}}
Additionally, tailor the resume to the following job description, emphasizing the skills and experiences that are most relevant:
{{jobDescription}}
{{/if}}
`,
});

const resumeSummaryFlow = ai.defineFlow(
  {
    name: 'resumeSummaryFlow',
    inputSchema: ResumeSummaryInputSchema,
    outputSchema: ResumeSummaryOutputSchema,
  },
  async input => {
    const {output} = await resumeSummaryPrompt(input);
    return output!;
  }
);

/**
 * Older Supabase schemas use `sample_text NOT NULL`; the app uses `samples`.
 * Populate both so inserts succeed until a migration drops `sample_text`.
 */
export function brandVoiceWritingFields(samplesTrimmed: string): {
  samples: string;
  sample_text: string;
} {
  return { samples: samplesTrimmed, sample_text: samplesTrimmed };
}

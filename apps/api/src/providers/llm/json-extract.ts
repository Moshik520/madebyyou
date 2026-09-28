/**
 * Pull a JSON object out of model text.
 *
 * The Agent SDK returns free text, so the object may arrive wrapped in prose,
 * fenced as markdown, or both. Kept separate from the provider so it can be
 * tested without pulling in config and logging.
 */
export function extractJsonObject(text: string): unknown {
  let candidate = text.trim();

  const fence = candidate.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence?.[1]) candidate = fence[1].trim();

  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start !== -1 && end !== -1) candidate = candidate.slice(start, end + 1);

  return JSON.parse(candidate);
}

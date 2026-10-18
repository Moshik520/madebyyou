import { defaultPlacement } from '../../platform/compositor.js';
import type { AgentTurn, AgentTurnInput, LLMProvider } from './types.js';

/**
 * A deterministic stand-in for the real agent.
 *
 * It exists for two reasons. Tests cannot assert on a model whose wording
 * changes between runs, and a public demo cannot hold a real API key, because
 * anyone who finds the link would be spending someone else's money.
 *
 * Rather than replaying a canned script, it derives the next turn from the
 * brief it is handed. The conversation still advances, and the same input
 * always produces the same output.
 */
function nextTurn(input: AgentTurnInput): AgentTurn {
  const brief = input.brief ?? {
    artworkSource: null,
    subject: null,
    style: null,
    colorPalette: [],
    mood: null,
    negative: null,
    textOverlay: null,
    placement: defaultPlacement,
  };

  const message = input.userMessage.trim();

  // An uploaded image decides the source for us.
  const artworkSource =
    brief.artworkSource ?? (input.hasSourceImage ? 'UPLOAD_TRANSFORM' : 'GENERATE');

  // Nothing known yet: treat the first message as the subject.
  if (!brief.subject) {
    return {
      reply: 'יפה. באיזה סגנון תרצו שזה ייראה?',
      brief: { ...brief, artworkSource, subject: message },
      status: 'NEEDS_INPUT',
      quickReplies: ['גיאומטרי', 'מינימליסטי', 'קריקטורה'],
      needsUpload: false,
      capability: 'NONE',
    };
  }

  // Subject known, style missing: this message is the style, and that is
  // enough to produce something.
  const style = brief.style ?? message;

  return {
    reply:
      input.versionCount > 0
        ? 'עדכנתי. מכין גרסה חדשה.'
        : 'מעולה, מתחיל לעבוד על זה.',
    brief: { ...brief, artworkSource, style },
    status: 'READY',
    quickReplies: [],
    needsUpload: false,
    capability:
      artworkSource === 'UPLOAD'
        ? 'NONE'
        : artworkSource === 'UPLOAD_TRANSFORM'
          ? 'IMAGE_TO_IMAGE'
          : 'TEXT_TO_IMAGE',
  };
}

export const mockLLMProvider: LLMProvider = {
  name: 'mock',
  runTurn: (input) => Promise.resolve(nextTurn(input)),
};

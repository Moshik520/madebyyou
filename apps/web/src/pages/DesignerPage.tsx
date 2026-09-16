import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { useCart } from '../cart/useCart';
import { BriefCard } from '../components/BriefCard';
import { PlacementEditor } from '../components/PlacementEditor';
import {
  fetchConversation,
  fetchDesignProject,
  placeDesignVersion,
  sendAgentMessage,
  type Placement,
  type AgentTurn,
  type ChatMessage,
  type DesignBrief,
  type DesignProject,
  type DesignVersion,
} from '../lib/api';
import './DesignerPage.css';

const emptyBrief: DesignBrief = {
  artworkSource: null,
  subject: null,
  style: null,
  colorPalette: [],
  mood: null,
  negative: null,
  textOverlay: null,
};

/**
 * Repositioning a design creates a new version derived from the old one rather
 * than mutating it. A chat bubble should still show the current state, so it
 * follows the lineage forward to the newest descendant.
 */
function buildLatestByAncestor(
  versions: DesignVersion[],
): Map<string, DesignVersion> {
  const childOf = new Map<string, DesignVersion>();

  for (const version of versions) {
    if (version.derivedFromVersionId) {
      childOf.set(version.derivedFromVersionId, version);
    }
  }

  const latest = new Map<string, DesignVersion>();

  for (const version of versions) {
    let current = version;

    while (childOf.has(current.id)) {
      current = childOf.get(current.id)!;
    }

    latest.set(version.id, current);
  }

  return latest;
}

const OPENING_LINE =
  'היי! מה תרצו שיודפס על המוצר? אפשר לתאר רעיון, או להעלות תמונה שיש לכם.';

export function DesignerPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { user, loading } = useAuth();
  const { addItem, busy: cartBusy } = useCart();
  const navigate = useNavigate();

  const [project, setProject] = useState<DesignProject | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [brief, setBrief] = useState<DesignBrief>(emptyBrief);
  const [turn, setTurn] = useState<AgentTurn | null>(null);
  const [versions, setVersions] = useState<DesignVersion[]>([]);
  const [editing, setEditing] = useState<DesignVersion | null>(null);
  const [placing, setPlacing] = useState(false);

  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  const latestByAncestor = useMemo(
    () => buildLatestByAncestor(versions),
    [versions],
  );

  useEffect(() => {
    if (!projectId || loading || !user) return;

    let cancelled = false;

    Promise.all([fetchDesignProject(projectId), fetchConversation(projectId)])
      .then(([p, c]) => {
        if (cancelled) return;
        setProject(p.project);
        setMessages(c.messages);
        setBrief(c.brief);
        setVersions(c.versions);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'לא הצלחנו לטעון את העיצוב');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [projectId, loading, user]);

  // Keep the newest message in view.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, sending]);

  async function send(content: string) {
    if (!projectId || sending) return;

    const text = content.trim();
    if (!text) return;

    setSending(true);
    setError(null);
    setDraft('');

    // Show the user's message immediately; the server echoes it back with an id.
    const optimistic: ChatMessage = {
      id: `pending-${Date.now()}`,
      role: 'USER',
      content: text,
      designVersionId: null,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const data = await sendAgentMessage(projectId, text);

      setMessages((prev) => [
        ...prev.filter((m) => m.id !== optimistic.id),
        ...data.messages,
      ]);
      setBrief(data.turn.brief);
      setTurn(data.turn);

      if (data.version) {
        setVersions((prev) => [...prev, data.version!]);
      }
    } catch (err: unknown) {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setDraft(text);
      setError(err instanceof Error ? err.message : 'השליחה נכשלה');
    } finally {
      setSending(false);
    }
  }

  async function handleAddToCart(version: DesignVersion) {
    if (!project) return;

    try {
      await addItem(project.product.slug, 1, version.id);
      navigate('/cart');
    } catch {
      /* the cart provider already surfaced the error */
    }
  }

  async function handlePlace(placement: Placement) {
    if (!projectId || !editing) return;

    setPlacing(true);

    try {
      await placeDesignVersion(projectId, editing.id, placement);

      // Re-read so every bubble resolves to the newest version in its lineage.
      const refreshed = await fetchConversation(projectId);
      setMessages(refreshed.messages);
      setVersions(refreshed.versions);
      setBrief(refreshed.brief);
      setEditing(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'לא הצלחנו לשמור את המיקום');
    } finally {
      setPlacing(false);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void send(draft);
  }

  if (loading) return null;

  if (!user) return <Navigate to="/login" replace />;

  if (error && messages.length === 0) {
    return (
      <section className="section">
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 className="section__title">{error}</h1>
          <Link className="btn btn--primary" to="/">
            חזרה לקטלוג
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="designer-chat">
      <div className="container">
        <nav className="product-page__crumbs" aria-label="ניווט משני">
          <Link to="/">דף הבית</Link>
          <span aria-hidden="true">›</span>
          {project ? (
            <Link to={`/products/${project.product.slug}`}>
              {project.product.name}
            </Link>
          ) : (
            <span>מוצר</span>
          )}
          <span aria-hidden="true">›</span>
          <span>עיצוב</span>
        </nav>

        <div className="designer-chat__layout">
          <div className="chat">
            <header className="chat__head">
              {project && (
                <img
                  className="chat__thumb"
                  src={project.product.imageUrl}
                  alt={project.product.name}
                />
              )}
              <div>
                <h1 className="chat__title">סוכן העיצוב</h1>
                <p className="chat__subtitle">
                  {project ? project.product.name : 'טוען…'}
                </p>
              </div>
            </header>

            <div className="chat__messages">
              <div className="bubble bubble--agent">{OPENING_LINE}</div>

              {messages.map((message) => {
                const version = message.designVersionId
                  ? latestByAncestor.get(message.designVersionId)
                  : undefined;

                return (
                  <div
                    className={
                      message.role === 'USER'
                        ? 'bubble bubble--user'
                        : 'bubble bubble--agent'
                    }
                    key={message.id}
                  >
                    {message.content}

                    {version?.mockupUrl && (
                      <figure className="bubble__design">
                        <img
                          src={version.mockupUrl}
                          alt={`גרסה ${version.versionNumber}`}
                          loading="lazy"
                        />
                        <figcaption>
                          <span>
                            גרסה {version.versionNumber}
                            {version.artworkUrl && (
                              <>
                                {' · '}
                                <a
                                  href={version.artworkUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  קובץ ההדפסה
                                </a>
                              </>
                            )}
                          </span>

                          <span className="bubble__buttons">
                            <button
                              className="bubble__place"
                              type="button"
                              onClick={() => setEditing(version)}
                            >
                              מיקום וגודל
                            </button>
                            <button
                              className="bubble__cart"
                              type="button"
                              disabled={cartBusy}
                              onClick={() => void handleAddToCart(version)}
                            >
                              {cartBusy ? 'מוסיף…' : 'הוספה לעגלה'}
                            </button>
                          </span>
                        </figcaption>
                      </figure>
                    )}
                  </div>
                );
              })}

              {sending && (
                <div className="bubble bubble--agent bubble--typing">
                  <span />
                  <span />
                  <span />
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {error && messages.length > 0 && (
              <div className="chat__error">{error}</div>
            )}

            {turn && turn.quickReplies.length > 0 && !sending && (
              <div className="chat__quick">
                {turn.quickReplies.map((reply) => (
                  <button
                    className="quick-reply"
                    type="button"
                    key={reply}
                    onClick={() => void send(reply)}
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}

            {turn?.needsUpload && (
              <div className="chat__upload-hint">
                📎 העלאת קבצים תתווסף בשלב הבא — בינתיים אפשר להמשיך לתאר במילים.
              </div>
            )}

            <form className="chat__composer" onSubmit={handleSubmit}>
              <input
                className="chat__input"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="כתבו מה תרצו על המוצר…"
                disabled={sending}
                autoFocus
              />
              <button
                className="chat__send"
                type="submit"
                disabled={sending || draft.trim().length === 0}
              >
                {sending ? '…' : 'שליחה'}
              </button>
            </form>
          </div>

          <BriefCard brief={brief} />
        </div>
      </div>

      {editing && project && editing.artworkUrl && (
        <PlacementEditor
          productImageUrl={project.product.imageUrl}
          printArea={project.product.printArea}
          artworkUrl={editing.artworkUrl}
          initial={editing.placement}
          busy={placing}
          onCancel={() => setEditing(null)}
          onSave={(placement) => void handlePlace(placement)}
        />
      )}
    </section>
  );
}

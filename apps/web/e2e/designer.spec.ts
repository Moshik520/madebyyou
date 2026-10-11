import { expect, test } from './fixtures/auth';
import { CatalogPage } from './pages/CatalogPage';
import { DesignerPage } from './pages/DesignerPage';
import { ProductPage } from './pages/ProductPage';

/**
 * The agent turn the server would normally get back from Claude. Stubbing it
 * keeps the test deterministic and free: the model's wording changes between
 * runs, and every real call costs money. What we are checking is our own chat
 * UI, not Anthropic's output.
 */
const agentTurn = {
  turn: {
    reply: 'איזה סגנון מתאים לך?',
    brief: {
      artworkSource: 'GENERATE',
      subject: 'wolf',
      style: null,
      colorPalette: ['blue'],
      mood: null,
      negative: null,
      textOverlay: null,
    },
    status: 'NEEDS_INPUT',
    quickReplies: ['גיאומטרי', 'מינימליסטי'],
    needsUpload: false,
    capability: 'TEXT_TO_IMAGE',
  },
  messages: [
    {
      id: 'stub-user',
      role: 'USER',
      content: 'אני רוצה זאב בכחול',
      designVersionId: null,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'stub-assistant',
      role: 'ASSISTANT',
      content: 'איזה סגנון מתאים לך?',
      designVersionId: null,
      createdAt: '2026-01-01T00:00:01.000Z',
    },
  ],
  version: null,
};

test('the designer shows the agent reply and its quick replies', async ({
  signedInPage: page,
}) => {
  const catalogPage = new CatalogPage(page);
  const productPage = new ProductPage(page);
  const designerPage = new DesignerPage(page);

  // The agent endpoint is the only call that would reach a model, so it is the
  // only one stubbed. Everything else talks to the real API.
  await page.route('**/api/design-projects/*/messages', (route) =>
    route.fulfill({ status: 201, json: agentTurn }),
  );

  await catalogPage.goto();
  await catalogPage.openFirstProduct();
  await productPage.startDesigningLink.click();

  await expect(designerPage.title).toBeVisible();

  await designerPage.send('אני רוצה זאב בכחול');

  await expect(page.getByText('איזה סגנון מתאים לך?')).toBeVisible();
  await expect(page.getByRole('button', { name: 'גיאומטרי' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'מינימליסטי' })).toBeVisible();
});

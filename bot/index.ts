import { Markup, Scenes, Telegraf, session } from "telegraf";
import { message } from "telegraf/filters";
import type { Update } from "telegraf/types";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { fallbackLanguage, translate, type Language } from "@/lib/i18n";

type ProductDraft = {
  nameRu?: string;
  nameUz?: string;
  price?: number;
  category?: string;
  fileId?: string;
};

interface BotSession extends Scenes.WizardSessionData {
  language?: Language;
  pendingOrderId?: number;
  productDraft?: ProductDraft;
}

type BotContext = Scenes.WizardContext<BotSession>;

const CATALOG_BUTTONS = [
  translate("ru", "menuCatalog"),
  translate("uz", "menuCatalog")
];
const SUPPORT_BUTTONS = [
  translate("ru", "menuSupport"),
  translate("uz", "menuSupport")
];

const priceFormatter = new Intl.NumberFormat("ru-RU");

const formatPrice = (price: number) => priceFormatter.format(price);

const sessionState = (ctx: BotContext): BotSession => ctx.session as BotSession;

const getLanguage = (ctx: BotContext, fallback?: Language | null): Language =>
  sessionState(ctx).language ?? fallback ?? fallbackLanguage;

const setLanguage = (ctx: BotContext, language?: Language | null) => {
  if (language) {
    sessionState(ctx).language = language;
  }
};

async function ensureUser(ctx: BotContext) {
  if (!ctx.from) return null;
  const telegramId = BigInt(ctx.from.id);
  let user = await prisma.user.findUnique({ where: { telegramId } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        telegramId,
        username: ctx.from.username,
        firstName: ctx.from.first_name,
        language: ctx.from.language_code ?? null
      }
    });
  }
  if (user.language) {
    setLanguage(ctx, user.language as Language);
  }
  return user;
}

const isAdmin = (ctx: BotContext) => ctx.from?.id === env.ADMIN_TELEGRAM_ID;

async function sendMainMenu(ctx: BotContext, language: Language) {
  await ctx.reply(
    translate(language, "welcome"),
    Markup.keyboard([
      [translate(language, "menuCatalog"), translate(language, "menuSupport")]
    ])
      .resize()
      .oneTime(false)
  );
}

async function listCategories(ctx: BotContext, language: Language) {
  const categories = await prisma.product.findMany({
    where: { isActive: true },
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" }
  });

  if (categories.length === 0) {
    await ctx.reply(translate(language, "categoriesEmpty"));
    return;
  }

  const buttons = categories.map(({ category }) => [
    Markup.button.callback(category, `category:${encodeURIComponent(category)}`)
  ]);

  await ctx.reply(
    translate(language, "categoriesTitle"),
    Markup.inlineKeyboard(buttons)
  );
}

async function sendProductsForCategory(
  ctx: BotContext,
  language: Language,
  category: string
) {
  const products = await prisma.product.findMany({
    where: { category, isActive: true },
    orderBy: { price: "asc" }
  });

  if (products.length === 0) {
    await ctx.reply(translate(language, "noProductsInCategory"));
    return;
  }

  const inlineButtons = products.map((product) => [
    Markup.button.callback(
      `${language === "ru" ? product.nameRu : product.nameUz} · ${formatPrice(
        product.price
      )}`,
      `product:${product.id}`
    )
  ]);

  await ctx.reply(
    translate(language, "productsForCategory", { category }),
    Markup.inlineKeyboard(inlineButtons)
  );
}

const extractText = (ctx: BotContext) => (ctx.message as { text?: string })?.text;

function createAddProductWizard(): Scenes.WizardScene<BotContext> {
  return new Scenes.WizardScene<BotContext>(
    "ADD_PRODUCT",
    async (ctx) => {
      if (!isAdmin(ctx)) {
        await ctx.reply(translate(getLanguage(ctx), "adminOnly"));
        return ctx.scene.leave();
      }
      sessionState(ctx).productDraft = {};
      await ctx.reply(translate(getLanguage(ctx), "wizardNameRu"));
      return ctx.wizard.next();
    },
    async (ctx) => {
      const text = extractText(ctx)?.trim();
      if (!text) {
        await ctx.reply(translate(getLanguage(ctx), "wizardNameRu"));
        return;
      }
      {
        const state = sessionState(ctx);
        state.productDraft = { ...state.productDraft, nameRu: text };
      }
      await ctx.reply(translate(getLanguage(ctx), "wizardNameUz"));
      return ctx.wizard.next();
    },
    async (ctx) => {
      const text = extractText(ctx)?.trim();
      if (!text) {
        await ctx.reply(translate(getLanguage(ctx), "wizardNameUz"));
        return;
      }
      {
        const state = sessionState(ctx);
        state.productDraft = { ...state.productDraft, nameUz: text };
      }
      await ctx.reply(translate(getLanguage(ctx), "wizardPrice"));
      return ctx.wizard.next();
    },
    async (ctx) => {
      const text = extractText(ctx)?.trim();
      const price = text ? Number(text) : NaN;
      if (!text || Number.isNaN(price) || price <= 0) {
        await ctx.reply(translate(getLanguage(ctx), "invalidPrice"));
        return;
      }
      {
        const state = sessionState(ctx);
        state.productDraft = { ...state.productDraft, price };
      }
      await ctx.reply(translate(getLanguage(ctx), "wizardCategory"));
      return ctx.wizard.next();
    },
    async (ctx) => {
      const text = extractText(ctx)?.trim();
      if (!text) {
        await ctx.reply(translate(getLanguage(ctx), "wizardCategory"));
        return;
      }
      {
        const state = sessionState(ctx);
        state.productDraft = { ...state.productDraft, category: text };
      }
      await ctx.reply(translate(getLanguage(ctx), "wizardFile"));
      return ctx.wizard.next();
    },
    async (ctx) => {
      const document = (ctx.message as { document?: { file_id: string } })?.document;
      if (!document) {
        await ctx.reply(translate(getLanguage(ctx), "wizardFile"));
        return;
      }
      {
        const state = sessionState(ctx);
        state.productDraft = {
          ...state.productDraft,
          fileId: document.file_id
        };
      }

      const draft = sessionState(ctx).productDraft;
      if (
        !draft?.nameRu ||
        !draft.nameUz ||
        !draft.price ||
        !draft.category ||
        !draft.fileId
      ) {
        await ctx.reply(translate(getLanguage(ctx), "wizardGenericError"));
        return ctx.scene.leave();
      }

      await prisma.product.create({
        data: {
          nameRu: draft.nameRu,
          nameUz: draft.nameUz,
          descRu: draft.nameRu,
          descUz: draft.nameUz,
          price: draft.price,
          category: draft.category,
          fileId: draft.fileId,
          isActive: true
        }
      });

      await ctx.reply(translate(getLanguage(ctx), "wizardSuccess"));
      sessionState(ctx).productDraft = undefined;
      return ctx.scene.leave();
    }
  );
}

function buildBot() {
  const bot = new Telegraf<BotContext>(env.TELEGRAM_BOT_TOKEN);

  bot.use(session());

  const stage = new Scenes.Stage<BotContext>([createAddProductWizard()]);
  bot.use(stage.middleware());

  bot.start(async (ctx) => {
    const user = await ensureUser(ctx);
    const savedLanguage = (user?.language as Language) ?? undefined;
    if (savedLanguage) {
      await sendMainMenu(ctx, getLanguage(ctx, savedLanguage));
      return;
    }
    await ctx.reply(
      translate(fallbackLanguage, "languagePrompt"),
      Markup.inlineKeyboard([
        [
          Markup.button.callback(
            translate("uz", "languageButtonUz"),
            "language:uz"
          ),
          Markup.button.callback(
            translate("ru", "languageButtonRu"),
            "language:ru"
          )
        ]
      ])
    );
  });

  bot.action(/language:(ru|uz)/, async (ctx) => {
    await ctx.answerCbQuery();
    const lang = (ctx.match as RegExpExecArray)[1] as Language;
    const user = await ensureUser(ctx);
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { language: lang }
      });
    }
    setLanguage(ctx, lang);
    await ctx.editMessageText(translate(lang, "languageSaved"));
    await sendMainMenu(ctx, lang);
  });

  bot.hears(CATALOG_BUTTONS, async (ctx) => {
    const user = await ensureUser(ctx);
    const language = getLanguage(ctx, (user?.language as Language) ?? undefined);
    await listCategories(ctx, language);
  });

  bot.hears(SUPPORT_BUTTONS, async (ctx) => {
    const user = await ensureUser(ctx);
    const language = getLanguage(ctx, (user?.language as Language) ?? undefined);
    await ctx.reply(
      translate(language, "supportMessage", { support: env.SUPPORT_USERNAME })
    );
  });

  bot.command("admin", async (ctx) => {
    if (!isAdmin(ctx)) {
      await ctx.reply(translate(getLanguage(ctx), "adminOnly"));
      return;
    }
    const language = getLanguage(ctx);
    await ctx.reply(
      translate(language, "adminPanelTitle"),
      Markup.inlineKeyboard([
        [
          Markup.button.callback(
            translate(language, "adminAddProductButton"),
            "admin:add-product"
          )
        ]
      ])
    );
  });

  bot.action("admin:add-product", async (ctx) => {
    await ctx.answerCbQuery();
    if (!isAdmin(ctx)) {
      await ctx.reply(translate(getLanguage(ctx), "adminOnly"));
      return;
    }
    await ctx.scene.enter("ADD_PRODUCT");
  });

  bot.action(/category:(.+)/, async (ctx) => {
    await ctx.answerCbQuery();
    const user = await ensureUser(ctx);
    const language = getLanguage(ctx, (user?.language as Language) ?? undefined);
    const [, rawCategory] = ctx.match as RegExpExecArray;
    await sendProductsForCategory(ctx, language, decodeURIComponent(rawCategory));
  });

  bot.action(/product:(\d+)/, async (ctx) => {
    await ctx.answerCbQuery();
    const user = await ensureUser(ctx);
    if (!user) return;
    const language = getLanguage(ctx, (user.language as Language) ?? undefined);
    const [, productId] = ctx.match as RegExpExecArray;
    const product = await prisma.product.findUnique({
      where: { id: Number(productId) }
    });
    if (!product || !product.isActive) {
      await ctx.reply(translate(language, "productInactive"));
      return;
    }

    const name = language === "ru" ? product.nameRu : product.nameUz;
    const description =
      language === "ru"
        ? product.descRu ?? ""
        : product.descUz ?? "";

    await ctx.reply(
      translate(language, "productDescription", {
        name,
        description,
        price: formatPrice(product.price)
      }),
      Markup.inlineKeyboard([
        [
          Markup.button.callback(
            translate(language, "buyButton", { price: formatPrice(product.price) }),
            `buy:${product.id}`
          )
        ]
      ])
    );
  });

  bot.action(/buy:(\d+)/, async (ctx) => {
    await ctx.answerCbQuery();
    const user = await ensureUser(ctx);
    if (!user) return;
    const language = getLanguage(ctx, (user.language as Language) ?? undefined);
    const [, productId] = ctx.match as RegExpExecArray;

    const product = await prisma.product.findUnique({
      where: { id: Number(productId) }
    });
    if (!product || !product.isActive) {
      await ctx.reply(translate(language, "productInactive"));
      return;
    }

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        productId: product.id,
        status: "WAITING_SCREENSHOT",
        totalPrice: product.price
      }
    });

    sessionState(ctx).pendingOrderId = order.id;

    await ctx.reply(
      translate(language, "paymentInstruction", {
        price: formatPrice(product.price),
        card: env.PAYMENT_CARD_NUMBER
      })
    );
    await ctx.reply(translate(language, "sendScreenshotPrompt"));
  });

  bot.on(message("photo"), async (ctx) => {
    const user = await ensureUser(ctx);
    if (!user) return;
    const language = getLanguage(ctx, (user.language as Language) ?? undefined);

    const pendingOrderId = sessionState(ctx).pendingOrderId;
    let activeOrder = pendingOrderId
      ? await prisma.order.findUnique({
          where: { id: pendingOrderId },
          include: { product: true }
        })
      : null;

    if (
      !activeOrder ||
      activeOrder.userId !== user.id ||
      activeOrder.status !== "WAITING_SCREENSHOT"
    ) {
      activeOrder = await prisma.order.findFirst({
        where: {
          userId: user.id,
          status: "WAITING_SCREENSHOT"
        },
        orderBy: { createdAt: "desc" },
        include: { product: true }
      });
    }

    if (!activeOrder) {
      await ctx.reply(translate(language, "noPendingOrder"));
      return;
    }

    const photos = ctx.message.photo;
    if (!photos || photos.length === 0) {
      await ctx.reply(translate(language, "noPendingOrder"));
      return;
    }
    const fileId = photos[photos.length - 1].file_id;

    await prisma.order.update({
      where: { id: activeOrder.id },
      data: { status: "PENDING_APPROVAL" }
    });

    sessionState(ctx).pendingOrderId = undefined;

    await ctx.reply(translate(language, "screenshotReceived"));

    const username = ctx.from?.username
      ? `@${ctx.from.username}`
      : ctx.from?.id?.toString() ?? "unknown";
    const adminCaption = translate(fallbackLanguage, "adminOrderSummary", {
      orderId: activeOrder.id,
      product: activeOrder.product.nameRu,
      username,
      price: formatPrice(activeOrder.totalPrice)
    });

    await ctx.telegram.sendPhoto(env.ADMIN_TELEGRAM_ID, fileId, {
      caption: adminCaption,
      reply_markup: Markup.inlineKeyboard([
        [
          Markup.button.callback(
            translate(fallbackLanguage, "adminApproveButton"),
            `admin:approve:${activeOrder.id}`
          ),
          Markup.button.callback(
            translate(fallbackLanguage, "adminRejectButton"),
            `admin:reject:${activeOrder.id}`
          )
        ]
      ]).reply_markup
    });
  });

  bot.action(/admin:(approve|reject):(\d+)/, async (ctx) => {
    await ctx.answerCbQuery();
    if (!isAdmin(ctx)) {
      await ctx.reply(translate(getLanguage(ctx), "adminOnly"));
      return;
    }
    const [, action, orderIdRaw] = ctx.match as RegExpExecArray;
    const orderId = Number(orderIdRaw);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true, product: true }
    });

    if (!order) {
      await ctx.editMessageCaption(
        translate(getLanguage(ctx), "orderNotFound"),
        { reply_markup: Markup.inlineKeyboard([]).reply_markup }
      );
      return;
    }

    const userLanguage = (order.user.language as Language) ?? fallbackLanguage;
    const chatId = Number(order.user.telegramId);

    if (action === "approve") {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "COMPLETED" }
      });

      await ctx.telegram.sendDocument(chatId, order.product.fileId, {
        caption: translate(userLanguage, "orderConfirmedUser")
      });

      await ctx.editMessageCaption(
        translate("ru", "orderApprovedAdmin", { orderId: order.id }),
        { reply_markup: Markup.inlineKeyboard([]).reply_markup }
      );
    } else {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "REJECTED" }
      });

      await ctx.telegram.sendMessage(
        chatId,
        translate(userLanguage, "orderRejectedUser")
      );

      await ctx.editMessageCaption(
        translate("ru", "orderRejectedAdmin", { orderId: order.id }),
        { reply_markup: Markup.inlineKeyboard([]).reply_markup }
      );
    }
  });

  bot.catch((err, ctx) => {
    console.error("Bot error", err, ctx.updateType);
  });

  return bot;
}

declare global {
  // eslint-disable-next-line no-var
  var _botInstance: Telegraf<BotContext> | undefined;
}

export const bot = global._botInstance ?? buildBot();
if (process.env.NODE_ENV !== "production") {
  global._botInstance = bot;
}

export async function handleUpdate(update: Update) {
  await bot.handleUpdate(update);
}

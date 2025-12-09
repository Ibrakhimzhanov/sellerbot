export type Language = "ru" | "uz";

export type TranslationKey =
  | "welcome"
  | "languagePrompt"
  | "languageSaved"
  | "languageButtonUz"
  | "languageButtonRu"
  | "menuCatalog"
  | "menuSupport"
  | "supportMessage"
  | "categoriesTitle"
  | "categoriesEmpty"
  | "productsForCategory"
  | "productDescription"
  | "buyButton"
  | "paymentInstruction"
  | "waitingScreenshot"
  | "screenshotReceived"
  | "noPendingOrder"
  | "orderConfirmedUser"
  | "orderRejectedUser"
  | "orderForwardCaption"
  | "orderApprovedAdmin"
  | "orderRejectedAdmin"
  | "adminOrderSummary"
  | "sendScreenshotPrompt"
  | "noProductsInCategory"
  | "productInactive"
  | "adminOnly"
  | "adminPanelTitle"
  | "adminAddProductButton"
  | "adminApproveButton"
  | "adminRejectButton"
  | "wizardNameRu"
  | "wizardNameUz"
  | "wizardPrice"
  | "wizardCategory"
  | "wizardFile"
  | "wizardSuccess"
  | "wizardGenericError"
  | "invalidPrice"
  | "orderNotFound";

type Dictionary = Record<Language, Record<TranslationKey, string>>;

const dictionary: Dictionary = {
  ru: {
    welcome: "Ассалому алайкум! Добро пожаловать в цифровой магазин.",
    languagePrompt: "Assalomu alaykum! Tilni tanlang / Выберите язык",
    languageSaved: "Язык успешно сохранен!",
    languageButtonUz: "🇺🇿 O'zbek",
    languageButtonRu: "🇷🇺 Русский",
    menuCatalog: "🛍 Каталог",
    menuSupport: "🆘 Поддержка",
    supportMessage: "Если возникли вопросы, напишите нам: {support}",
    categoriesTitle: "Выберите категорию товара:",
    categoriesEmpty: "Каталог пока пуст. Загляните позже!",
    productsForCategory: "Категория: {category}",
    productDescription:
      "{name}\n{description}\nЦена: {price} сум",
    buyButton: "💳 Купить за {price} сум",
    paymentInstruction:
      "Переведите {price} сум на карту {card} и отправьте скриншот чека сюда.",
    waitingScreenshot: "Ждем скриншот оплаты по заказу #{orderId}.",
    screenshotReceived: "Скриншот получен! Ожидайте подтверждения.",
    noPendingOrder:
      "У вас нет ожидающих заказов. Выберите товар в каталоге и оформите покупку.",
    orderConfirmedUser: "Оплата принята! Вот ваш файл.",
    orderRejectedUser:
      "К сожалению, платеж не подтвержден. Свяжитесь с поддержкой.",
    orderForwardCaption:
      "Заказ #{orderId}. Товар: {product}. Юзер: @{username}. Сумма: {price} сум.",
    orderApprovedAdmin: "✅ Заказ #{orderId} выдан",
    orderRejectedAdmin: "❌ Заказ #{orderId} отклонен",
    adminOrderSummary:
      "Заказ #{orderId}. Товар: {product}. Юзер: {username}. Сумма: {price} сум.",
    sendScreenshotPrompt:
      "После оплаты обязательно отправьте скриншот чека в этот чат.",
    noProductsInCategory:
      "В этой категории пока нет активных товаров.",
    productInactive: "Товар недоступен. Выберите другой вариант.",
    adminOnly: "Команда доступна только администратору.",
    adminPanelTitle:
      "Админ-панель: выберите действие",
    adminAddProductButton: "➕ Добавить товар",
    adminApproveButton: "✅ Подтвердить",
    adminRejectButton: "❌ Отклонить",
    wizardNameRu: "Введите название (RU):",
    wizardNameUz: "Введите название (UZ):",
    wizardPrice: "Введите цену в сумах:",
    wizardCategory: "Введите категорию товара:",
    wizardFile: "Пришлите ZIP файл товара (как документ):",
    wizardSuccess: "Товар успешно добавлен!",
    wizardGenericError: "Что-то пошло не так. Повторите /admin.",
    invalidPrice: "Некорректная цена. Попробуйте еще раз.",
    orderNotFound: "Заказ не найден."
  },
  uz: {
    welcome: "Assalomu alaykum! Raqamli do'konga xush kelibsiz.",
    languagePrompt: "Assalomu alaykum! Tilni tanlang / Выберите язык",
    languageSaved: "Til saqlandi!",
    languageButtonUz: "🇺🇿 O'zbek",
    languageButtonRu: "🇷🇺 Rus tili",
    menuCatalog: "🛍 Mahsulotlar",
    menuSupport: "🆘 Yordam",
    supportMessage: "Savollaringiz bo'lsa, bizga yozing: {support}",
    categoriesTitle: "Kategoriya tanlang:",
    categoriesEmpty: "Hozircha mahsulotlar yo'q. Keyinroq qayting!",
    productsForCategory: "Kategoriya: {category}",
    productDescription:
      "{name}\n{description}\nNarxi: {price} so'm",
    buyButton: "💳 {price} so'mga sotib olish",
    paymentInstruction:
      "{price} so'mni {card} kartasiga o'tkazing va chek skrinshotini shu yerga yuboring.",
    waitingScreenshot:
      "#{orderId} buyurtma uchun to'lov skrinshotini kutyapmiz.",
    screenshotReceived:
      "Skrinshot qabul qilindi! Tasdiqlashni kuting.",
    noPendingOrder:
      "Faol buyurtmalaringiz yo'q. Katalogdan mahsulot tanlang va xarid qiling.",
    orderConfirmedUser: "To'lov qabul qilindi! Mana faylingiz.",
    orderRejectedUser:
      "Afsuski, to'lov tasdiqlanmadi. Yordam uchun biz bilan bog'laning.",
    orderForwardCaption:
      "Buyurtma #{orderId}. Mahsulot: {product}. Foydalanuvchi: @{username}. Summasi: {price} so'm.",
    orderApprovedAdmin: "✅ Buyurtma #{orderId} berildi",
    orderRejectedAdmin: "❌ Buyurtma #{orderId} rad etildi",
    adminOrderSummary:
      "Buyurtma #{orderId}. Mahsulot: {product}. Foydalanuvchi: {username}. Summasi: {price} so'm.",
    sendScreenshotPrompt:
      "To'lovdan so'ng chek skrinshotini shu chatga yuboring.",
    noProductsInCategory:
      "Bu kategoriyada hali mahsulotlar yo'q.",
    productInactive:
      "Mahsulot mavjud emas. Boshqa variantni tanlang.",
    adminOnly: "Bu buyruq faqat administrator uchun.",
    adminPanelTitle: "Admin paneli: amal tanlang",
    adminAddProductButton: "➕ Mahsulot qo'shish",
    adminApproveButton: "✅ Tasdiqlash",
    adminRejectButton: "❌ Rad etish",
    wizardNameRu: "Mahsulot nomi (RU) ni kiriting:",
    wizardNameUz: "Mahsulot nomi (UZ) ni kiriting:",
    wizardPrice: "Narxni so'mda kiriting:",
    wizardCategory: "Mahsulot kategoriyasini kiriting:",
    wizardFile: "ZIP faylni (hujjat sifatida) yuboring:",
    wizardSuccess: "Mahsulot muvaffaqiyatli qo'shildi!",
    wizardGenericError: "Xatolik yuz berdi. /admin buyrug'ini qayta bering.",
    invalidPrice: "Noto'g'ri narx. Qaytadan urinib ko'ring.",
    orderNotFound: "Buyurtma topilmadi."
  }
};

export const fallbackLanguage: Language = "ru";

export function translate(
  language: Language | undefined,
  key: TranslationKey,
  params: Record<string, string | number> = {}
): string {
  const lang: Language = language && dictionary[language] ? language : fallbackLanguage;
  const template = dictionary[lang][key] ?? dictionary[fallbackLanguage][key];
  return Object.entries(params).reduce(
    (acc, [paramKey, value]) => acc.replaceAll(`{${paramKey}}`, String(value)),
    template
  );
}

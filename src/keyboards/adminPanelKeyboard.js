import { Keyboard } from "grammy";

export const adminPanelKeyboard = new Keyboard()

adminPanelKeyboard
.text("🧾 Сводка")
.text("📊 Тарифы").row()
.text("👮‍♂️ Админы")
.text("🗑 Удалить аккаунт").row()
.text("⬅️ Назад").row()
.resized()


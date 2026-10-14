import { useI18n } from "../i18n";
import { useState } from "react";
export default function RecoveryCode({ code }) {
  const { t: tr } = useI18n();
  const [saved, setSaved] = useState(false);
  if (!code) return null;
  function download() {
    const url = URL.createObjectURL(
      new Blob(
        [
          `Numerologic — резервный код входа\n\n${code}\n\nХраните отдельно от пароля. Код заменяется после использования. Никому его не передавайте.\n`,
        ],
        {
          type: "text/plain;charset=utf-8",
        },
      ),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "numerologic-recovery-code.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setSaved(true);
  }
  return (
    <article className="soft-card recovery-card" role="status">
      <h3>
        {tr(
          "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u0435 \u0440\u0435\u0437\u0435\u0440\u0432\u043D\u044B\u0439 \u043A\u043E\u0434.",
        )}
      </h3>
      <p>
        {tr(
          "\u041E\u043D \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442 \u0434\u043E\u0441\u0442\u0443\u043F, \u0435\u0441\u043B\u0438 \u0432\u044B \u0437\u0430\u0431\u0443\u0434\u0435\u0442\u0435 \u043F\u0430\u0440\u043E\u043B\u044C. \u041A\u043E\u0434 \u043F\u043E\u043A\u0430\u0437\u0430\u043D \u0442\u043E\u043B\u044C\u043A\u043E \u0441\u0435\u0439\u0447\u0430\u0441; \u0434\u0435\u0440\u0436\u0438\u0442\u0435 \u0435\u0433\u043E \u043E\u0442\u0434\u0435\u043B\u044C\u043D\u043E \u043E\u0442 \u043F\u0430\u0440\u043E\u043B\u044F.",
        )}
      </p>
      <code>{tr(code.match(/.{1,8}/g).join(" "))}</code>
      <button className="secondary-button" onClick={download}>
        {tr(saved ? "Скачать ещё раз" : "Скачать резервный код ↓")}
      </button>
    </article>
  );
}

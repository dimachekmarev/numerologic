import { useState } from "react";
export default function RecoveryCode({ code }) {
  const [saved, setSaved] = useState(false);
  if (!code) return null;
  function download() {
    const url = URL.createObjectURL(
      new Blob(
        [
          `Numerologic — резервный код входа\n\n${code}\n\nХраните отдельно от пароля. Код заменяется после использования. Никому его не передавайте.\n`,
        ],
        { type: "text/plain;charset=utf-8" },
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
      <h3>Сохраните резервный код.</h3>
      <p>
        Он восстановит доступ, если вы забудете пароль. Код показан только
        сейчас; держите его отдельно от пароля.
      </p>
      <code>{code.match(/.{1,8}/g).join(" ")}</code>
      <button className="secondary-button" onClick={download}>
        {saved ? "Скачать ещё раз" : "Скачать резервный код ↓"}
      </button>
    </article>
  );
}

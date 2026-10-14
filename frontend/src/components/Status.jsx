import { useI18n } from "../i18n";
export default function Status({ loading, error, reload }) {
  const { t: tr } = useI18n();
  if (loading)
    return (
      <div className="status" role="status">
        <span className="loading-dot" />
        {tr(
          "\u0417\u0430\u0433\u0440\u0443\u0436\u0430\u0435\u043C \u0432\u0430\u0448\u0435 \u043F\u0440\u043E\u0441\u0442\u0440\u0430\u043D\u0441\u0442\u0432\u043E\u2026",
        )}
      </div>
    );
  if (error)
    return (
      <div className="status error" role="alert">
        <p>{tr(error)}</p>
        {tr(
          reload && (
            <button className="secondary-button" onClick={reload}>
              {tr(
                "\u041F\u043E\u043F\u0440\u043E\u0431\u043E\u0432\u0430\u0442\u044C \u0441\u043D\u043E\u0432\u0430",
              )}
            </button>
          ),
        )}
      </div>
    );
  return null;
}

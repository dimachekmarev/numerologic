import { useI18n } from "../i18n";
import { Link } from "react-router-dom";
export default function ReportCard({ report }) {
  const { t: tr } = useI18n();
  return (
    <article className="report-card">
      <span className="chip sage">
        {tr(
          "\u0421\u043E\u0445\u0440\u0430\u043D\u0451\u043D\u043D\u044B\u0439 \u043E\u0442\u0447\u0451\u0442",
        )}
      </span>
      <h3>{tr(report.title)}</h3>
      <p>{tr(String(report.content || "").slice(0, 140))}...</p>
      <Link className="ghost-button" to={`/report/${report.id}`}>
        {tr(
          "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u043E\u0442\u0447\u0451\u0442",
        )}
      </Link>
    </article>
  );
}
